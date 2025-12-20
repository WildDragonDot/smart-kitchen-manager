import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../../../.env') });
import Fastify from 'fastify';
import { ApolloServer } from '@apollo/server';
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';

import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createContext, Context } from './graphql/context';
import { prisma } from '@kitchen/db';
import { jobScheduler } from './jobs/scheduler';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Register security plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  await fastify.register(rateLimit, {
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // requests per window
    timeWindow: '15 minutes', // 15 minutes
    errorResponseBuilder: function (request, context) {
      return {
        code: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
        date: Date.now(),
        expiresIn: Math.round(context.ttl / 1000),
      };
    },
  });

  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-domain.com']
      : true,
    credentials: true,
  });

  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this',
  });

  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Create Apollo Server
  const apollo = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
    formatError: (err) => {
      console.error('GraphQL Error:', err);
      return {
        message: err.message,
        extensions: {
          code: err.extensions?.code,
          userMessage: err.extensions?.userMessage,
          field: err.extensions?.field,
          statusCode: err.extensions?.statusCode,
        },
        path: err.path,
      };
    },
  });

  await apollo.start();

  // Register GraphQL endpoint with stricter rate limiting
  await fastify.register(async function (fastify) {
    await fastify.register(rateLimit, {
      max: process.env.NODE_ENV === 'production' ? 50 : 200, // Lower limit for GraphQL
      timeWindow: '15 minutes',
      keyGenerator: function (request) {
        // Rate limit by IP and user ID if authenticated
        const authHeader = request.headers.authorization;
        let userId = 'anonymous';
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const decoded = fastify.jwt.verify(token) as any;
            userId = decoded.userId || 'anonymous';
          } catch (error) {
            // Invalid token, use IP only
          }
        }
        
        return `${request.ip}-${userId}`;
      },
      errorResponseBuilder: function (request, context) {
        return {
          errors: [{
            message: 'Rate limit exceeded for GraphQL requests',
            extensions: {
              code: 'RATE_LIMIT_EXCEEDED',
              retryAfter: Math.round(context.ttl / 1000),
            },
          }],
        };
      },
    });

    await fastify.register(fastifyApollo(apollo), {
      context: createContext,
    });
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      fastify.log.error('Health check failed: ' + (error as Error).message);
      throw new Error('Database connection failed');
    }
  });

  // File upload endpoint
  fastify.post('/upload', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No file uploaded' });
      }

      const buffer = await data.toBuffer();
      const filename = data.filename || 'unknown';
      const contentType = data.mimetype || 'application/octet-stream';

      // Upload to Cloudflare R2
      const { StorageService } = await import('./services/storage');
      const result = await StorageService.uploadFile(buffer, filename, contentType);
      
      return result;
    } catch (error) {
      fastify.log.error('Upload failed: ' + (error as Error).message);
      return reply.code(500).send({ error: 'Upload failed' });
    }
  });

  // Avatar upload endpoint
  fastify.post('/upload/avatar', async (request, reply) => {
    try {
      // Check authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const token = authHeader.substring(7);
      let userId: string;
      
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this') as any;
        userId = decoded.userId;
      } catch (error) {
        return reply.code(401).send({ error: 'Invalid token' });
      }

      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No avatar file uploaded' });
      }

      // Validate file type
      if (!data.mimetype || !data.mimetype.startsWith('image/')) {
        return reply.code(400).send({ error: 'Only image files are allowed for avatars' });
      }

      // Validate file size (max 5MB)
      const buffer = await data.toBuffer();
      if (buffer.length > 5 * 1024 * 1024) {
        return reply.code(400).send({ error: 'Avatar file too large (max 5MB)' });
      }

      const filename = data.filename || 'avatar.jpg';

      // Upload avatar to Cloudflare R2
      const { StorageService } = await import('./services/storage');
      
      // Get current user to delete old avatar
      const { createContext } = await import('./graphql/context');
      const context = await createContext(request, reply);
      
      if (context.user) {
        const currentUser = await context.prisma.user.findUnique({
          where: { id: context.user.id },
          select: { avatar: true },
        });

        // Delete old avatar if exists
        if (currentUser?.avatar) {
          await StorageService.deleteOldAvatar(currentUser.avatar);
        }
      }

      const result = await StorageService.uploadAvatar(buffer, filename, userId);
      
      // Update user avatar URL in database
      await context.prisma.user.update({
        where: { id: userId },
        data: { avatar: result.url },
      });
      
      return result;
    } catch (error) {
      fastify.log.error('Avatar upload failed: ' + (error as Error).message);
      return reply.code(500).send({ error: 'Avatar upload failed' });
    }
  });

  // Barcode scanning endpoint
  fastify.post('/scan/barcode', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ success: false, message: 'No file uploaded' });
      }

      const buffer = await data.toBuffer();
      
      // Process barcode with OCR service
      const { OCRService } = await import('./services/ocr');
      const barcode = await OCRService.processBarcode(buffer);
      
      if (barcode) {
        return reply.send({
          success: true,
          barcode,
          format: 'EAN-13', // Default format
          message: 'Barcode detected successfully'
        });
      } else {
        return reply.code(404).send({
          success: false,
          message: 'No barcode detected in image'
        });
      }
    } catch (error) {
      fastify.log.error('Barcode scanning failed: ' + (error as Error).message);
      return reply.code(500).send({
        success: false,
        message: 'Barcode scanning failed'
      });
    }
  });

  // OCR Receipt processing endpoint
  fastify.post('/ocr/receipt', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No image uploaded' });
      }

      const buffer = await data.toBuffer();
      
      // Process receipt with OCR
      const { OCRService } = await import('./services/ocr');
      const receiptData = await OCRService.processReceipt(buffer);
      
      // Upload image to storage
      const { StorageService } = await import('./services/storage');
      const uploadResult = await StorageService.uploadReceipt(buffer, data.filename || 'receipt.jpg');
      
      return {
        receiptData,
        imageUrl: uploadResult.url,
        imageKey: uploadResult.key
      };
    } catch (error) {
      fastify.log.error('Receipt OCR failed: ' + (error as Error).message);
      return reply.code(500).send({ error: 'Failed to process receipt' });
    }
  });

  // OCR Inventory item processing endpoint
  fastify.post('/ocr/inventory', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No image uploaded' });
      }

      const buffer = await data.toBuffer();
      
      // Process inventory item with OCR
      const { OCRService } = await import('./services/ocr');
      const itemData = await OCRService.processInventoryItem(buffer);
      
      // Upload image to storage
      const { StorageService } = await import('./services/storage');
      const uploadResult = await StorageService.uploadInventoryImage(buffer, data.filename || 'item.jpg');
      
      return {
        itemData,
        imageUrl: uploadResult.url,
        imageKey: uploadResult.key
      };
    } catch (error) {
      fastify.log.error('Inventory OCR failed: ' + (error as Error).message);
      return reply.code(500).send({ error: 'Failed to process inventory item' });
    }
  });

  // Barcode scanning endpoint
  fastify.post('/ocr/barcode', async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ error: 'No image uploaded' });
      }

      const buffer = await data.toBuffer();
      
      // Process barcode with OCR
      const { OCRService } = await import('./services/ocr');
      const barcode = await OCRService.processBarcode(buffer);
      
      return { barcode };
    } catch (error) {
      fastify.log.error('Barcode OCR failed: ' + (error as Error).message);
      return reply.code(500).send({ error: 'Failed to process barcode' });
    }
  });

  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server ready at http://${HOST}:${PORT}/graphql`);
    console.log(`📊 Health check at http://${HOST}:${PORT}/health`);
    
    // Start background job scheduler
    jobScheduler.start();
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  jobScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  jobScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
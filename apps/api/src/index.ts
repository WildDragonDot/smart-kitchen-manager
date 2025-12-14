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

  // Register plugins
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

  // Register GraphQL endpoint
  await fastify.register(fastifyApollo(apollo), {
    context: createContext,
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
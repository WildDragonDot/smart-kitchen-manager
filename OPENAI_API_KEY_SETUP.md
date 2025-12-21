# OpenAI API Key Setup

## Issue
The current OpenAI API key in your `.env` file is invalid or expired. This is causing the AI recipe generation feature to fail.

## Solution

### Step 1: Get a Valid OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Click "Create new secret key"
5. Copy the generated key (it starts with `sk-`)

### Step 2: Update Your .env File

1. Open the `.env` file in the root directory
2. Find the line with `OPENAI_API_KEY`
3. Replace the existing key with your new key:

```env
OPENAI_API_KEY="sk-your-new-api-key-here"
```

### Step 3: Restart the API Server

After updating the `.env` file, restart the API server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
cd apps/api
npm run dev
```

## Important Notes

- **API Key Security**: Never commit your API key to version control
- **Billing**: Make sure you have billing set up on your OpenAI account
- **Rate Limits**: OpenAI has rate limits based on your account tier
- **Development Fallback**: In development mode, the system will provide fallback recipes if the API key is invalid

## Testing the API Key

You can test if your API key is valid by running:

```bash
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

If the key is valid, you'll get a response with generated text. If invalid, you'll get a 401 error.

## Alternative: Use Development Fallback

If you don't want to use OpenAI for now, the system will automatically provide fallback recipes in development mode when the API key is invalid. However, these recipes won't be as personalized or realistic as AI-generated ones.

## Current Status

✅ **Fixed Issues:**
- Increased rate limits for development (1000 requests per 15 minutes)
- Reduced AI recipe generation calls (2 recipes instead of 3)
- Added better error handling with helpful messages
- Added development fallback recipes

❌ **Remaining Issue:**
- Invalid OpenAI API key needs to be replaced

## Next Steps

1. Get a valid OpenAI API key from the platform
2. Update the `.env` file with the new key
3. Restart the API server
4. Test the recipe generation feature

The application will work with fallback recipes in development mode, but for the best experience with AI-generated personalized recipes, you'll need a valid OpenAI API key.

import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import DotenvFlow from 'dotenv-flow';

DotenvFlow.config();

export const openrouterInstance = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

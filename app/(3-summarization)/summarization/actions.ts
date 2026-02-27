'use server';

import { openrouterInstance } from '@/app/openrouter';
import { generateText, Output } from 'ai';
import { z } from 'zod';

// --- 技巧 1: 用结构化 schema 替代自由文本 ---
// 把 takeaways 从 string 改为 array，强制 LLM 输出离散条目，
// 用 .max(3) 硬性限制数组长度，比在 describe 里写 "max 3" 有效得多。
const summarySchema = z.object({
  headline: z
    .string()
    .max(50) // 硬性字符限制，zod 会校验
    .describe('5-word title. No punctuation.'),
  context: z
    .string()
    .max(200)
    .describe('1-2 sentences of background. Under 200 characters.'),
  discussionPoints: z
    .array(z.string().max(100).describe('One key topic in ≤15 words.'))
    .min(1)
    .max(3)
    .describe('Top 1-3 discussion topics as short phrases.'),
  takeaways: z
    .array(
      z.object({
        action: z.string().max(100).describe('Action item in ≤15 words.'),
        owner: z.string().describe('Person responsible. "Unassigned" if unknown.'),
      }),
    )
    .min(1)
    .max(3)
    .describe('1-3 action items with assigned owner.'),
});

type SummarySchema = z.infer<typeof summarySchema>;

// --- 技巧 2: 在 system prompt 中显式约束格式 ---
// LLM 对 prompt 指令的遵从度远高于 schema description。
const SYSTEM_PROMPT = `You are a concise meeting summarizer. STRICT RULES:
- headline: exactly 5 words, no punctuation
- context: 1-2 sentences, under 200 characters total
- discussionPoints: 1-3 items, each ≤15 words
- takeaways: 1-3 action items, each ≤15 words, always include owner name
Do NOT exceed these limits. Brevity is mandatory.`;

export const generateSummary = async (comments: any[]): Promise<SummarySchema> => {
  console.log('Generating summary for', comments.length, 'comments...');

  // --- 技巧 3: 用 system + prompt 分离角色和数据 ---
  const { output: summary } = await generateText({
    model: openrouterInstance.chat('minimax/minimax-m2.5'),
    system: SYSTEM_PROMPT,
    prompt: `Summarize these comments:\n${JSON.stringify(comments)}`,
    output: Output.object({ schema: summarySchema }),
  });

  console.log('Summary generated:', summary);
  return summary;
};
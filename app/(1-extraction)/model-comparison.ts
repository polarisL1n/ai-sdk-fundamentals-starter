import { generateText } from 'ai';
import DotenvFlow from 'dotenv-flow';

DotenvFlow.config();

const complexProblem = `
A company has 150 employees. They want to organize them into teams where:
- Each team has between 8-12 people
- No team should have exactly 10 people
- Teams should be as equal in size as possible
How should they organize the teams?
`;

async function benchmarkModel(modelName: string, label: string) {
  console.log(`\n🚀 Testing ${label} (${modelName})...`);
  const start = Date.now();
  
  try {
    const result = await generateText({
      model: modelName,
      prompt: complexProblem,
    });
    
    const duration = Date.now() - start;
    // 获取 Token 使用情况 (Vercel AI SDK 通常会在 usage 字段返回)
    const tokens = result.usage.outputTokens || 0; 
    const speed = (duration / tokens).toFixed(2);
    
    console.log(`⏱️  Time: ${duration}ms`);
    console.log(`📊 Tokens generated: ${tokens}`);
    console.log(`⚡ Speed: ${speed} ms/token`);
    console.log('📝 Preview:', result.text.substring(0, 100).replace(/\n/g, ' ') + '...');
  } catch (e) {
    console.error(`❌ Error testing ${modelName}:`, e);
  }
}

async function runBenchmark() {
  // 预热/多次测试建议使用循环，这里演示单次对比增强版
  await benchmarkModel('openai/gpt-4o-mini', 'Fast Model');
  await benchmarkModel('openai/gpt-5.2', 'Reasoning Model'); 
}

runBenchmark().catch(console.error);
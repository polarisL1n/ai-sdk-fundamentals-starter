import DotenvFlow from "dotenv-flow";
import fs from "fs";
import { generateId, generateText } from 'ai';

DotenvFlow.config();

const essay = fs.readFileSync('app/(1-extraction)/essay.txt', 'utf-8');

// Advanced extraction patterns
 
// Company extraction with context
const companyPrompt = `Extract all company names from this essay.
Include both explicit mentions and implied references (e.g., "the startup" referring to a previously mentioned company).
 
Format as JSON array: ["Company 1", "Company 2"]
 
Essay: ${essay}`;
 
// Concept extraction with categorization
const conceptPrompt = `Identify the main business concepts and technical terms in this essay.
Categorize them as either 'business' or 'technical' concepts.
 
Format as JSON:
{
  "business": ["concept1", "concept2"],
  "technical": ["term1", "term2"]
}
 
Essay: ${essay}`;
 
// Quote extraction with attribution
const quotePrompt = `Extract all quotes (text in quotation marks) from this essay.
For each quote, identify who said it if mentioned.
 
Format as JSON array:
[{"quote": "text here", "speaker": "name or null"}]
 
Essay: ${essay}`;


const main = async () => {
  console.log('⏳ 开始请求...');
  const startTime = Date.now();
  
  const result = await generateText({
    model: 'anthropic/claude-haiku-4.5',
    prompt: `Extract all contents based on the following requirements,you should answer each prompt separately
    and format the result as a JSON object,each prompt's name should be a key in the JSON object
    ${companyPrompt}
    ${conceptPrompt}
    ${quotePrompt}`
  });

  console.log(`✅ 完成，耗时: ${Date.now() - startTime}ms`);
  console.log(result.text);
};

main().catch(e => {
  console.error(e);
})
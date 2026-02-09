import { PDFParse } from 'pdf-parse';
import fs from 'fs';
import { streamText, generateText, Output } from 'ai';
import DotenvFlow from 'dotenv-flow';
import z from 'zod';

DotenvFlow.config();

const filePath = 'pdf/2005.14165v4.pdf';

export const loadPdf = async (filePath: string) => {
  const buffer = fs.readFileSync(filePath);
  // 转换 Buffer 为 Uint8Array
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const pdfParse = new PDFParse(data);
  const result = await pdfParse.getText();
  return result.text;
}

export const splitPdfToChunks = (fileContent: string, chunkSize: number) => {
  const chunks = [];
  let i = 0;
  while (i < fileContent.length) {
    chunks.push(fileContent.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

export async function extractLargeDocument(filePath: string) {
  // TODO: chunk file, stream extraction, merge results
  const batchSize = 4000; // tokens per chunk
 
  // 1. Split document into chunks
  const fileContent = await loadPdf(filePath);
  console.log(`文件长度: ${fileContent.length}`);
  const chunks = splitPdfToChunks(fileContent, batchSize);
  // 2. Process each chunk with streamText
  const results = await Promise.all(chunks.map(async (chunk, index) => {
    console.log(`处理中: ${index + 1} / ${chunks.length} (${(Math.round(index / chunks.length * 100))}%)`)
    const currentResult = streamText({
      model: 'zai/glm-4.7',
      prompt: `请总结以下内容的要点，用中文回答，100字以内：
        ${chunk}
        要点总结：`,
    });
    console.log(`处理完成: ${index + 1} / ${chunks.length}`);
    for await (const streamChunk of currentResult.textStream) {
      process.stdout.write(streamChunk);  // 实时输出每个片段
    }
    return currentResult.text;
  }));
  // 3. Merge extracted data

  const reducedResult = await generateText({
    model: 'zai/glm-4.7',
    prompt: `请将以下内容总结成一个完整的内容：
      ${results.join('\n')}
      合并结果：
      `,
    output: Output.object({
      schema: z.object({
        summary: z.string(),
      })
    })
  });
  // 4. Return consolidated result

  return reducedResult.text;
}

extractLargeDocument(filePath).then((result) => {
  console.log(result);
}).catch(e => {
  console.error(e);
});
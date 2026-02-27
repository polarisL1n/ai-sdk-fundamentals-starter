'use server';
 
import { generateText, Output } from 'ai';
import { appointmentSchema, type AppointmentDetails } from './schemas';
 
export const extractAppointment = async (
  input: string,
): Promise<AppointmentDetails> => {
  console.log(`Extracting from: "${input}"`);
 
  // TODO: Use generateText with Output.object() to extract appointment details
  // - Model: 'openai/gpt-5-mini'
  // - Prompt: Ask to extract appointment details from the input
  // - Output: Output.object({ schema: appointmentSchema })
  // - Return the extracted details from the 'output' property

  const { output: appointmentDetails } = await generateText({
		model: "openai/gpt-5-mini",
		prompt: `Extract the appointment details from the following natural language input:\n\n"${input}"`,
		output: Output.object({
			schema: appointmentSchema,
		}),
	});
 
	console.log("Extracted details:", appointmentDetails);
	return appointmentDetails;
};
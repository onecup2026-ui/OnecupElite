'use server';
/**
 * @fileOverview An AI chatbot that answers common questions about tournament rules, schedules, registration processes, and payment details for participants.
 *
 * - aiParticipantFaqChatbot - A function that handles participant FAQ queries.
 * - AiParticipantFaqChatbotInput - The input type for the aiParticipantFaqChatbot function.
 * - AiParticipantFaqChatbotOutput - The return type for the aiParticipantFaqChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiParticipantFaqChatbotInputSchema = z.object({
  question: z.string().describe("The participant's question about tournament details.")
});
export type AiParticipantFaqChatbotInput = z.infer<typeof AiParticipantFaqChatbotInputSchema>;

const AiParticipantFaqChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer to the participant's question.")
});
export type AiParticipantFaqChatbotOutput = z.infer<typeof AiParticipantFaqChatbotOutputSchema>;

export async function aiParticipantFaqChatbot(
  input: AiParticipantFaqChatbotInput
): Promise<AiParticipantFaqChatbotOutput> {
  return aiParticipantFaqChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiParticipantFaqChatbotPrompt',
  input: {schema: AiParticipantFaqChatbotInputSchema},
  output: {schema: AiParticipantFaqChatbotOutputSchema},
  prompt: `You are a helpful and knowledgeable AI assistant for the ONE CUP tournament platform.
Your role is to answer participant questions accurately and concisely about tournament rules, schedules, registration processes, and payment details.
Provide direct and clear answers based on common knowledge about such events.

Participant's question: {{{question}}}

Please provide a clear and concise answer.`
});

const aiParticipantFaqChatbotFlow = ai.defineFlow(
  {
    name: 'aiParticipantFaqChatbotFlow',
    inputSchema: AiParticipantFaqChatbotInputSchema,
    outputSchema: AiParticipantFaqChatbotOutputSchema
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

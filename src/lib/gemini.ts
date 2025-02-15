import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing Gemini API key');
  throw new Error('Please add your Gemini API key to the .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function summarizePaper(text: string): Promise<string> {
  if (!text) {
    throw new Error('No text provided for summarization');
  }

  try {
    const result = await model.generateContent(text);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error in summarizePaper:', error);
    throw new Error(error.message || 'Failed to summarize paper');
  }
}

export async function detectBias(text: string): Promise<string> {
  if (!text) {
    throw new Error('No text provided for bias detection');
  }

  try {
    const result = await model.generateContent(text);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error in detectBias:', error);
    throw new Error(error.message || 'Failed to detect bias');
  }
}

export async function answerQuestion(text: string, question: string): Promise<string> {
  if (!text || !question) {
    throw new Error('Missing text or question');
  }

  try {
    const result = await model.generateContent(`${text}\n\nQuestion: ${question}`);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Error in answerQuestion:', error);
    throw new Error(error.message || 'Failed to answer question');
  }
}

export async function getSuggestions(paperText: string, annotation: string): Promise<string> {
  if (!paperText || !annotation) {
    throw new Error('Missing paper text or annotation');
  }

  try {
    const prompt = `You are an experienced research mentor providing feedback on a student's annotation of a research paper. 

Context:
Paper: "${paperText.slice(0, 2000)}..."
Student's Annotation: "${annotation}"

As their mentor, please provide:
1. A brief analysis of their perspective and how it relates to the paper's content
2. 2-3 specific suggestions for deepening their analysis
3. Potential research directions they could explore based on their interests
4. Areas where they could contribute novel insights to the field

Keep the tone supportive yet professional, as if you're a senior researcher mentoring a promising junior colleague.`;
    
    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('No response received from Gemini API');
    }
    return result.response.text();
  } catch (error: any) {
    console.error('Error in getSuggestions:', error);
    throw new Error(error.message || 'Failed to get suggestions');
  }
}
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('Missing Gemini API key');
  throw new Error('Please add your Gemini API key to the .env file');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function summarizePaper(text: string): Promise<string> {
  const prompt = `Please provide a comprehensive summary of the following research paper. Focus on the main findings, methodology, and conclusions. Give pre formatted text as output. Here's the paper text:\n\n${text}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error summarizing paper:', error);
    throw error;
  }
}

export async function detectBias(text: string): Promise<string> {
  const prompt = `Analyze the following research paper for potential biases. Consider:
  1. Selection bias in methodology
  2. Confirmation bias in conclusions
  3. Sampling bias in data collection
  4. Cultural or geographical bias
  5. Funding source bias
  6. Publication bias
  
  Provide a detailed analysis of any biases found and their potential impact on the research findings.
  Give pre formatted text as output.
  
  Paper text:\n\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error detecting bias:', error);
    throw error;
  }
}

export async function answerQuestion(text: string, question: string): Promise<string> {
  const prompt = `Using the context of the following research paper, please answer this question: "${question}"
  
  Paper text:\n\n${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error answering question:', error);
    throw error;
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
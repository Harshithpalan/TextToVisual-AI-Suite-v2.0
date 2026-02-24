import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5 flash for speed

// Enable CORS
app.use(cors());
// Accept JSON body
app.use(express.json({ limit: '50mb' }));

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

/**
 * Use Gemini to enhance the user prompt
 */
const getEnhancedPrompt = async (prompt, style) => {
  try {
    const systemPrompt = `
      Improve this text prompt for AI image generation.
      Make it detailed, cinematic, high resolution, and ultra-realistic.
      Incorporate the style: ${style}.
      Return ONLY the improved prompt text. Do not include any explanations or extra words.
      
      User Prompt: ${prompt}
    `;

    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Gemini Enhancement Error:', error);
    // Fallback to basic enhancement if Gemini fails
    return `${prompt}, ${style}, high resolution, ultra detailed, cinematic lighting`;
  }
};

/**
 * Use Gemini to generate Mermaid.js code
 */
const getMermaidCode = async (prompt) => {
  try {
    const systemPrompt = `
      Create a Mermaid.js diagram for: "${prompt}".
      Format: flowchart (graph TD).
      Requirement: Respond ONLY with the Mermaid code. 
      No backticks, no "mermaid" keyword, no preamble.
      Example:
      graph TD
      A[Start] --> B[Next]
    `;

    const result = await geminiModel.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text().trim();
    // Strip any potential markdown code blocks if the model ignored instructions
    text = text.replace(/^```mermaid\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '');
    return text;
  } catch (error) {
    console.error('Gemini Mermaid Error:', error);
    return "graph TD\nA[Error] --> B[Diagram Generation Failed]";
  }
};

// Health check
app.get('/', (req, res) => {
  res.send('TextToVisual AI Suite is running!');
});

// POST /generate (Image)
app.post('/generate', async (req, res) => {
  try {
    const { prompt, style } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    if (!HUGGINGFACE_API_KEY) return res.status(500).json({ error: 'HF Key missing' });

    console.log(`original prompt: ${prompt}`);
    const enhancedPrompt = await getEnhancedPrompt(prompt, style || 'realistic');
    console.log(`Enhanced prompt: ${enhancedPrompt}`);

    const hfResponse = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: enhancedPrompt }),
    });

    if (!hfResponse.ok) {
      const errorData = await hfResponse.json().catch(() => ({}));
      console.error('HF API Error Details:', JSON.stringify(errorData));
      return res.status(hfResponse.status).json({ error: 'HF API failed', details: errorData });
    }

    const buffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    res.json({
      enhancedPrompt,
      image: `data:image/jpeg;base64,${base64Image}`
    });

  } catch (error) {
    console.error('Server Internal Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /generate-diagram
app.post('/generate-diagram', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    console.log(`Generating diagram for: ${prompt}`);
    const mermaidCode = await getMermaidCode(prompt);

    res.json({ mermaidCode });
  } catch (error) {
    console.error('Diagram Error Detailed:', error);
    res.status(500).json({ error: 'Failed to generate diagram', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

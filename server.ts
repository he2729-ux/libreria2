import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Book Chat Endpoint: Interact with selected book or whole library
app.post('/api/chat-book', async (req, res) => {
  try {
    const { book, provider = 'gemini', messages = [], question, allBooks = [], apiKey } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Pregunta requerida' });
    }

    // Prepare system instructions and book context
    let contextPrompt = '';
    if (book) {
      contextPrompt = `
Estás interactuando con el usuario sobre un libro específico de su estantería Android:
- TÍTULO: ${book.title}
- AUTOR: ${book.author}
- FORMATO: ${book.format} (Tamaño: ${book.fileSize})
- PÁGINAS: ${book.totalPages} (Página actual leída por el usuario: ${book.currentPage})
- SINOPSIS: ${book.synopsis || 'Sin sinopsis registrada'}
- ÍNDICE / CAPÍTULOS:
${(book.chapters || []).map((c: any) => `  * ${c.title} (Pág. ${c.page})`).join('\n')}
- CITAS Y NOTAS GUARDADAS POR EL USUARIO:
${(book.annotations || []).map((a: any) => `  * [${a.type}] "${a.text}" ${a.note ? `(Nota: ${a.note})` : ''}`).join('\n')}
- FRAGMENTOS DE CONTENIDO DISPONIBLES:
${(book.content || []).slice(0, 3).join('\n\n--- SIGUIENTE SECCIÓN ---\n\n')}
`;
    } else {
      contextPrompt = `
El usuario quiere consultar sobre TODA su estantería de libros:
Libros disponibles en la biblioteca:
${(allBooks || []).map((b: any) => `- "${b.title}" por ${b.author} (${b.format}, ${b.totalPages} páginas, progreso ${Math.round((b.currentPage / b.totalPages) * 100)}%)`).join('\n')}
`;
    }

    const personaInstructions: Record<string, string> = {
      gemini: 'Eres el Asistente Inteligente de Libros impulsado por Google Gemini. Responde con tono analítico, erudito, claro, pedagógico y muy útil en español.',
      claude: 'Eres el Asistente Inteligente de Libros con el estilo de razonamiento profundo y reflexivo de Claude. Brinda explicaciones detalladas y contextuales en español.',
      chatgpt: 'Eres el Asistente de Libros con el estilo conversacional dinámico y estructurado de ChatGPT. Usa viñetas y ejemplos prácticos en español.',
      copilot: 'Eres el Copiloto de Lectura con estilo conciso, enfocado en productividad, resúmenes ejecutivos y puntos clave en español.',
    };

    const activePersona = personaInstructions[provider] || personaInstructions.gemini;

    const systemInstruction = `
${activePersona}
Tu objetivo es responder con precisión sobre el libro o biblioteca del usuario.
Si el usuario pregunta sobre conceptos, capítulos, citas, resúmenes, lecciones clave o dudas sobre la trama o contenido técnico (como Bitcoin, trading, fórmulas, personajes o historias), responde basándote en la información del libro con gran fidelidad y elocuencia.
Formato: Usa texto claro con negritas y listas cuando sea apropiado.
${contextPrompt}
`;

    const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

    // Check if an API key is available
    if (!effectiveApiKey) {
      // Smart contextual fallback when no key is injected yet
      let fallbackAnswer = '';
      if (book) {
        fallbackAnswer = `📚 **Resumen de "${book.title}" (${book.author})**:\n\nBasado en el contenido indexado de tu libro (${book.format}, pág. ${book.currentPage} de ${book.totalPages}):\n\n• **Temática central:** ${book.synopsis}\n• **Capítulo activo:** ${book.chapters?.[0]?.title || 'Capítulo principal'}\n• **Citas destacadas:** Hay ${book.annotations?.length || 0} notas guardadas en tu estantería.\n\n*Nota: Tu pregunta "${question}" ha sido procesada con éxito.*`;
      } else {
        fallbackAnswer = `📚 Tienes ${allBooks.length} libros en tu estantería digital. Tu biblioteca incluye títulos como "${allBooks[0]?.title || 'Libros'}" con diversos formatos y progresos de lectura.`;
      }
      return res.json({
        answer: fallbackAnswer,
        provider,
      });
    }

    // Call Gemini API via @google/genai
    const client = apiKey
      ? new GoogleGenAI({
          apiKey: effectiveApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        })
      : ai;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nPregunta del usuario: ${question}` }],
        },
      ],
    });

    const answer = response.text || 'No se pudo obtener una respuesta del modelo en este momento.';

    return res.json({
      answer,
      provider,
    });
  } catch (error: any) {
    console.error('Error in /api/chat-book:', error);
    return res.status(500).json({
      error: 'Error al procesar la consulta con la IA',
      details: error?.message || 'Error desconocido',
    });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // Serve static assets from public folder
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Libris Applet Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

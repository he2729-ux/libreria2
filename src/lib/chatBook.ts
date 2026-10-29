// Cliente de chat con IA que corre 100% en el dispositivo (sin servidor Express).
// Llama directamente a la API de Gemini usando la clave guardada por el usuario.

const personas: Record<string, string> = {
  gemini: 'Eres el Asistente Inteligente de Libros impulsado por Google Gemini. Responde con tono analítico, erudito, claro, pedagógico y muy útil en español.',
  claude: 'Eres el Asistente Inteligente de Libros con el estilo de razonamiento profundo y reflexivo de Claude. Brinda explicaciones detalladas y contextuales en español.',
  chatgpt: 'Eres el Asistente de Libros con el estilo conversacional dinámico y estructurado de ChatGPT. Usa viñetas y ejemplos prácticos en español.',
  copilot: 'Eres el Copiloto de Lectura con estilo conciso, enfocado en productividad, resúmenes ejecutivos y puntos clave en español.',
};

export async function chatBook(p: {
  book?: any;
  allBooks: any[];
  provider: string;
  apiKey?: string;
  question: string;
}): Promise<string> {
  const { book, allBooks, provider, apiKey, question } = p;

  const context = book
    ? `Libro del usuario:
- TÍTULO: ${book.title}
- AUTOR: ${book.author}
- FORMATO: ${book.format} (Tamaño: ${book.fileSize})
- PÁGINAS: ${book.totalPages} (Página actual: ${book.currentPage})
- SINOPSIS: ${book.synopsis || 'Sin sinopsis'}
- ÍNDICE:
${(book.chapters || []).map((c: any) => `  * ${c.title} (Pág. ${c.page})`).join('\n')}
- NOTAS DEL USUARIO:
${(book.annotations || []).map((a: any) => `  * [${a.type}] "${a.text}" ${a.note ? `(Nota: ${a.note})` : ''}`).join('\n')}
- CONTENIDO:
${(book.content || []).slice(0, 3).join('\n\n--- SIGUIENTE SECCIÓN ---\n\n')}`
    : `Biblioteca completa del usuario:
${allBooks.map((b: any) => `- "${b.title}" por ${b.author} (${b.format}, ${b.totalPages} págs, progreso ${Math.round((b.currentPage / b.totalPages) * 100)}%)`).join('\n')}`;

  if (!apiKey) {
    return book
      ? `📚 **"${book.title}" (${book.author})**\n\n• **Temática:** ${book.synopsis}\n• **Notas guardadas:** ${book.annotations?.length || 0}\n\n*Para respuestas reales de IA, agrega tu clave de Gemini en Conectar cuenta.*`
      : `📚 Tienes ${allBooks.length} libros en tu estantería. *Agrega tu clave de Gemini para consultar con IA.*`;
  }

  const system = `${personas[provider] || personas.gemini}\nResponde con precisión sobre el libro o biblioteca del usuario. Usa negritas y listas cuando ayude.\n${context}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${system}\n\nPregunta del usuario: ${question}` }] }],
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Error ${res.status}`);
  return data?.candidates?.[0]?.content?.parts?.map((x: any) => x.text).join('') || 'No se pudo obtener respuesta del modelo.';
}

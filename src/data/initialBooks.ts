import { Book, DictionaryItem } from '../types/book';

export const INITIAL_CATEGORIES = [
  'Finanzas y Trading',
  'Tecnología y Cripto',
  'Cómics y Manga',
  'Infantil y Juvenil',
  'Filosofía y Ensayo',
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'satoshi-blockchain',
    title: 'Libro-de-Satoshi-Blockchain-Espana-v1-junio-2018',
    author: 'Phil Champagne',
    coverUrl: '/src/assets/images/book_cover_satoshi_1793155016013.jpg',
    format: 'PDF',
    fileSize: '11 MB',
    totalPages: 348,
    currentPage: 146,
    readTimeMinutes: 285,
    addedDate: '15/06/2024',
    lastReadDate: 'Hace 2 horas',
    isFavorite: true,
    isCompleted: false,
    rating: 5,
    shelf: 'reading',
    category: 'Tecnología y Cripto',
    synopsis: 'Una recopilación exhaustiva de los correos electrónicos, publicaciones en foros y documentación técnica escrita por el creador anónimo de Bitcoin, Satoshi Nakamoto.',
    isKidsSafe: false,
    language: 'es',
    chapters: [
      { id: 'c1', title: 'Capítulo 1: La génesis del dinero digital', page: 1, level: 1 },
      { id: 'c2', title: 'Capítulo 2: El Libro Blanco de Bitcoin', page: 34, level: 1 },
      { id: 'c3', title: 'Capítulo 3: Criptografía de clave pública y firmas ECDSA', page: 88, level: 1 },
      { id: 'c4', title: 'Capítulo 4: La red peer-to-peer y el consenso Nakamoto', page: 142, level: 1 },
      { id: 'c5', title: 'Capítulo 5: Prueba de Trabajo y dificultad adaptativa', page: 210, level: 1 },
      { id: 'c6', title: 'Capítulo 6: La desaparición de Satoshi y el legado', page: 290, level: 1 }
    ],
    annotations: [
      {
        id: 'ann-1',
        bookId: 'satoshi-blockchain',
        type: 'quote',
        color: 'yellow',
        text: 'Una versión puramente de igual a igual de efectivo electrónico permitiría que los pagos en línea se enviaran directamente de una parte a otra sin pasar por una institución financiera.',
        page: 35,
        chapter: 'Capítulo 2: El Libro Blanco de Bitcoin',
        createdAt: '18/06/2024'
      },
      {
        id: 'ann-2',
        bookId: 'satoshi-blockchain',
        type: 'note',
        color: 'emerald',
        text: 'El problema del doble gasto resuelto mediante una red de sellado de tiempo distribuida basada en hash.',
        note: 'Revisar la sección matemática de árboles de Merkle.',
        page: 145,
        chapter: 'Capítulo 4: La red peer-to-peer',
        createdAt: '22/06/2024'
      }
    ],
    content: [
      `# Capítulo 4: La red peer-to-peer y el consenso Nakamoto

En noviembre de 2008, Satoshi Nakamoto publicó el artículo fundacional en la lista de correo de criptografía de Cypherpunks. La tesis fundamental no residía únicamente en la criptografía, sino en la convergencia de la teoría de juegos, incentivos económicos y estructuras descentralizadas.

### 4.1 La arquitectura de nodos independientes

La red consiste en miles de computadoras conectadas que validan cada bloque según un conjunto estricto de reglas de consenso matemático:

1. **Transacciones verificables**: Cada transacción contiene entradas que hacen referencia a salidas de transacciones no gastadas (UTXO).
2. **Propagación Gossip**: Cada nodo retransmite transacciones válidas a sus pares vecinos de inmediato.
3. **El Árbol de Merkle**: Estructura de datos binaria que permite certificar la inclusión de transacciones con coste logarítmico O(log n).

> "La raíz del problema con la moneda convencional es toda la confianza que se requiere para que funcione. Se debe confiar en el banco central para que no devalúe la moneda, pero la historia de las monedas fiduciarias está llena de incumplimientos de esa confianza."
> — *Satoshi Nakamoto, Foro P2P Foundation, 11 de febrero de 2009.*

### 4.2 La Prueba de Trabajo (Proof of Work)

Para implementar un servidor de marcas de tiempo distribuido sobre una base de igual a igual, se requirió un sistema de prueba de trabajo similar al Hashcash de Adam Back. En lugar de periódicos o agentes centralizados, la red busca un valor que, al ser hasheado con SHA-256 dos veces, comience con un número determinado de bits en cero.

\`\`\`
Hash = SHA256(SHA256(Bloque_Cabecera + Nonce)) < Objetivo_Dificultad
\`\`\`

La prueba de trabajo también resuelve la representación en la toma de decisiones basada en la mayoría. Si la mayoría se basara en "una dirección IP, un voto", cualquiera que pudiera asignar muchas IP podría subvertirla. La prueba de trabajo es esencialmente **una CPU, un voto**.`,

      `### 4.3 Ajuste de Dificultad Dinámica

El protocolo contiene un mecanismo cibernético que ajusta automáticamente la dificultad cada 2016 bloques (aproximadamente dos semanas).

Si los bloques se generan con una cadencia menor a 10 minutos debido a la incorporación de nuevo hardware de minería, la dificultad aumenta proporcionalmente. Si la potencia de cómputo desciende, la dificultad disminuye para garantizar que el reloj monetario prosiga con regularidad cósmica.

* "Es la primera vez en la historia humana en la que la escasez absoluta de un bien puede garantizarse mediante algoritmos y leyes criptográficas inalterables."

En el siguiente capítulo analizaremos la anatomía del bloque génesis minado el 3 de enero de 2009 con el titular emblemático de The Times.`
    ]
  },
  {
    id: 'metodo-wyckoff',
    title: 'El Método Wyckoff- Enrique Diaz',
    author: 'Enrique Díaz Valdecantos / Rubén Villahermosa',
    coverUrl: '/src/assets/images/book_cover_wyckoff_1793155017087.jpg',
    format: 'PDF',
    fileSize: '5.4 MB',
    totalPages: 260,
    currentPage: 204,
    readTimeMinutes: 340,
    addedDate: '10/01/2024',
    lastReadDate: 'Ayer, 18:30',
    isFavorite: true,
    isCompleted: false,
    rating: 5,
    shelf: 'reading',
    category: 'Finanzas y Trading',
    synopsis: 'Claves para entender los fundamentos del trading, la acción del precio y el análisis de volumen con las fases de acumulación y distribución de Richard Wyckoff.',
    isKidsSafe: false,
    language: 'es',
    chapters: [
      { id: 'w1', title: '1. Introducción al Enfoque Wyckoff', page: 1, level: 1 },
      { id: 'w2', title: '2. Las Tres Leyes Fundamentales', page: 28, level: 1 },
      { id: 'w3', title: '3. Procesos de Acumulación', page: 75, level: 1 },
      { id: 'w4', title: '4. Fase C: El Spring y el Test', page: 130, level: 1 },
      { id: 'w5', title: '5. Fase D: Salto del Arroyo (JAC)', page: 195, level: 1 },
      { id: 'w6', title: '6. Gestión de Riesgo y Operativa Real', page: 230, level: 1 }
    ],
    annotations: [
      {
        id: 'ann-3',
        bookId: 'metodo-wyckoff',
        type: 'quote',
        color: 'rose',
        text: 'La ley de oferta y demanda determina la dirección del precio. Cuando la demanda supera a la oferta, los precios suben; cuando la oferta supera a la demanda, los precios caen.',
        page: 30,
        chapter: '2. Las Tres Leyes Fundamentales',
        createdAt: '12/01/2024'
      }
    ],
    content: [
      `# Fase D: El Salto del Arroyo (Jump Across the Creek) y Signo de Fortaleza

En la metodología Wyckoff, la Fase D marca el inicio formal de la tendencia alcista dentro del rango de acumulación. Después de que el "Smart Money" ha absorbido todo el papel flotante en la Fase C mediante el Spring o Sacudida, el camino de menor resistencia queda despejado.

### Conceptos Clave en Fase D:

* **SOS (Sign of Strength)**: Movimiento alcista con amplio rango de velas y notable incremento de volumen que denota la presencia institucional activa.
* **Creek (El Arroyo)**: Zona de resistencia estructural superior que conecta los máximos de la consolidación.
* **JAC (Jump Across the Creek)**: Salto decidido por encima de dicha resistencia.
* **LPS (Last Point of Support)**: Corrección de bajo volumen hacia la resistencia previa ahora convertida en soporte (Pullback de testeo).

### Identificación Práctica en Gráficos

1. Observe la contracción de volumen en las correcciones bajistas.
2. Compruebe que la oferta residual se agota antes del despegue.
3. El gatillo de entrada más seguro se ubica en el LPS tras el salto del arroyo.`
    ]
  },
  {
    id: 'habitos-operadores',
    title: 'Los 10 Habitos de los Operadores mas Eficientes- Jared Martinez',
    author: 'Jared Martinez (FX Chief)',
    coverUrl: '/public/assets/aistudio/WhatsApp_Image_2026-10-27_at_20.02.27_7d208b76.jpeg',
    format: 'PDF',
    fileSize: '705 kB',
    totalPages: 180,
    currentPage: 45,
    readTimeMinutes: 90,
    addedDate: '20/03/2024',
    lastReadDate: 'Hace 3 días',
    isFavorite: false,
    isCompleted: false,
    rating: 4,
    shelf: 'reading',
    category: 'Finanzas y Trading',
    synopsis: 'Estrategias de disciplina psicológica, gestión del capital y consistencia en los mercados de divisas y derivados financieros.',
    isKidsSafe: false,
    language: 'es',
    chapters: [
      { id: 'h1', title: 'Hábito 1: Controlar el riesgo antes que la ganancia', page: 1, level: 1 },
      { id: 'h2', title: 'Hábito 2: Escribir un plan de trading innegociable', page: 25, level: 1 },
      { id: 'h3', title: 'Hábito 3: La regla del 2% por operación', page: 60, level: 1 },
      { id: 'h4', title: 'Hábito 4: Dominar la paciencia del cazador', page: 110, level: 1 }
    ],
    annotations: [],
    content: [
      `# Hábito 2: Escribir un plan de trading innegociable

Un operador sin plan es simplemente un apostador con una pantalla de gráficos. Cada mañana, antes de que abra la sesión de Londres o Nueva York, su rutina debe seguir una secuencia estricta:

* **Revisión del calendario macroeconómico**: Identificar publicaciones de alta volatilidad (IPC, NFP, Tipos de Interés).
* **Definición previa de stop loss**: Si no sabe exactamente dónde admitirá que su hipótesis es errónea antes de abrir la orden, no opere.
* **Diario de operaciones**: Registrar el estado emocional al entrar y salir del mercado.`
    ]
  },
  {
    id: 'analisis-tecnico-patrones',
    title: 'AnalisisTecnico patrones',
    author: 'Afi Guías / BMN',
    coverUrl: '/src/assets/images/book_cover_wyckoff_1793155017087.jpg',
    format: 'PDF',
    fileSize: '2.6 MB',
    totalPages: 112,
    currentPage: 12,
    readTimeMinutes: 40,
    addedDate: '02/05/2024',
    lastReadDate: 'Hace 1 semana',
    isFavorite: false,
    isCompleted: false,
    rating: 4,
    shelf: 'to-read',
    synopsis: 'Catálogo de formaciones chartistas: hombro-cabeza-hombro, triángulos simétricos, dobles suelos y canales tendenciales.',
    isKidsSafe: false,
    language: 'es',
    chapters: [
      { id: 'at1', title: 'Capítulo 1: Soporte y Resistencia', page: 1, level: 1 },
      { id: 'at2', title: 'Capítulo 2: Figuras de Vuelta', page: 24, level: 1 },
      { id: 'at3', title: 'Capítulo 3: Figuras de Continuidad', page: 56, level: 1 }
    ],
    annotations: [],
    content: [
      `# Figuras de Cambio de Tendencia

El **Hombro-Cabeza-Hombro (HCH)** es una de las formaciones más fiables del análisis técnico occidental. 

Se compone de un primer máximo relativo (hombro izquierdo), un segundo máximo superior con volumen decreciente (cabeza), y un tercer máximo que no logra superar al anterior (hombro derecho). La línea que une los valles se denomina línea clavicular o *neckline*.`
    ]
  },
  {
    id: 'neon-horizon-manga',
    title: 'Neon Horizon - Cyberpunk Manga Vol. 1',
    author: 'Ryu Takahashi',
    coverUrl: '/src/assets/images/book_cover_manga_1793155018953.jpg',
    format: 'CBR',
    fileSize: '38 MB',
    totalPages: 194,
    currentPage: 88,
    readTimeMinutes: 120,
    addedDate: '12/07/2024',
    lastReadDate: 'Ayer',
    isFavorite: true,
    isCompleted: false,
    rating: 5,
    shelf: 'comics',
    category: 'Cómics y Manga',
    synopsis: 'Cómic en formato CBR/CBZ optimizado para lectura de derecha a izquierda (RTL), alta resolución y modo noche.',
    isKidsSafe: false,
    language: 'ja',
    chapters: [
      { id: 'm1', title: 'Acto I: Luces de Neón en Shinjuku', page: 1, level: 1 },
      { id: 'm2', title: 'Acto II: El Blade Runner de Akira', page: 50, level: 1 },
      { id: 'm3', title: 'Acto III: Batalla sobre el Expreso Magnético', page: 110, level: 1 }
    ],
    annotations: [
      {
        id: 'ann-m1',
        bookId: 'neon-horizon-manga',
        type: 'bookmark',
        color: 'blue',
        text: 'Página de doble viñeta con combate en la azotea',
        page: 88,
        chapter: 'Acto II: El Blade Runner de Akira',
        createdAt: '26/10/2024'
      }
    ],
    content: [
      `# Acto II: El Blade Runner de Akira
*(Lectura recomendada de Derecha a Izquierda - Modo Manga RTL activable en configuración)*

La lluvia ácida repiqueteaba sobre el visor holográfico de Kenji. El callejón del distrito 9 hervía con el olor a fideos ramen baratos y vapor presurizado de los conductos subterráneos.

En la pantalla del terminal de pulsera parpadeó una advertencia en carmesí:
**[ALERTA: INTROMISIÓN EN LA RED NEURONAL DETECTADA]**

Kenji activó la espada de plasma. El zumbido ionizado iluminó las paredes metálicas con reflejos azul cobalto.`
    ]
  },
  {
    id: 'pequeno-astronauta-kids',
    title: 'El Pequeño Astronauta y la Estrella Viajera',
    author: 'María García',
    coverUrl: '/src/assets/images/book_cover_kids_1793155017232.jpg',
    format: 'EPUB',
    fileSize: '4.2 MB',
    totalPages: 48,
    currentPage: 48,
    readTimeMinutes: 65,
    addedDate: '01/08/2024',
    lastReadDate: 'Hace 5 días',
    isFavorite: true,
    isCompleted: true,
    rating: 5,
    shelf: 'completed',
    category: 'Infantil y Juvenil',
    synopsis: 'Un tierno cuento con hermosas ilustraciones espaciales y texto grande.',
    language: 'es',
    chapters: [
      { id: 'k1', title: 'El despegue del cohete plateado', page: 1, level: 1 },
      { id: 'k2', title: 'Un amigo con orejitas en la Luna', page: 16, level: 1 },
      { id: 'k3', title: 'El baile de los planetas', page: 32, level: 1 }
    ],
    annotations: [
      {
        id: 'ann-k1',
        bookId: 'pequeno-astronauta-kids',
        type: 'quote',
        color: 'amber',
        text: 'Incluso la estrella más pequeñita ilumina la noche si no deja de brillar con ilusión.',
        page: 47,
        chapter: 'El baile de los planetas',
        createdAt: '05/08/2024'
      }
    ],
    content: [
      `# El despegue del cohete plateado 🚀

Lucas miraba por la ventanilla redonda de su nave estelar. La Tierra se veía como una canica azul y blanca flotando en un mar de terciopelo oscuro salpicado de destellos dorados.

A su lado, su fiel perrito cósmico "Chispa" movía la cola al ver pasar un asteroide cubierto de polvo de estrellas brillantes.

—¡Próxima parada, la Luna de Caramelo! —anunció Lucas mientras ajustaba su casco espacial.`
    ]
  }
];

export const INITIAL_DICT_CATEGORIES = [
  'Diccionario General',
  'Pendientes',
  'Términos Financieros',
  'Criptografía y Blockchain',
];

export const INITIAL_DICTIONARY: DictionaryItem[] = [
  {
    id: 'dict-1',
    term: 'Mempool',
    definition: 'Zona de memoria temporal de los nodos donde se acumulan las transacciones de Bitcoin antes de ser empaquetadas en un bloque por los mineros.',
    category: 'Criptografía y Blockchain',
    color: 'yellow',
    bookTitle: 'Libro-de-Satoshi-Blockchain-Espana-v1-junio-2018',
    isPending: false,
    createdAt: '18/06/2024'
  },
  {
    id: 'dict-2',
    term: 'Spring (Wyckoff)',
    definition: 'Sacudida bajista intencionada que perfora un soporte previo para liquidar órdenes de stop loss antes de iniciar la subida enérgica de Fase C.',
    category: 'Términos Financieros',
    color: 'emerald',
    bookTitle: 'El Método Wyckoff- Enrique Diaz',
    isPending: false,
    createdAt: '14/01/2024'
  },
  {
    id: 'dict-3',
    term: 'Satoshi (サトシ)',
    definition: 'Unidad mínima indivisible de Bitcoin equivalente a 0.00000001 BTC. También nombre de su inventor.',
    category: 'Criptografía y Blockchain',
    color: 'blue',
    bookTitle: 'Libro-de-Satoshi-Blockchain-Espana-v1-junio-2018',
    isPending: false,
    createdAt: '19/06/2024'
  },
  {
    id: 'dict-4',
    term: 'Pullback',
    definition: 'Movimiento de retroceso temporal del precio hacia un nivel de soporte o resistencia previamente roto.',
    category: 'Términos Financieros',
    color: 'amber',
    bookTitle: 'El Método Wyckoff- Enrique Diaz',
    isPending: false,
    createdAt: '15/01/2024'
  },
  {
    id: 'dict-5',
    term: 'Halving',
    definition: '',
    category: 'Pendientes',
    color: 'rose',
    bookTitle: 'Libro-de-Satoshi-Blockchain-Espana-v1-junio-2018',
    isPending: true,
    createdAt: '28/10/2026'
  }
];

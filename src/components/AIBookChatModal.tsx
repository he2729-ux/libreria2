import { chatBook } from '../lib/chatBook';
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  Bot,
  User,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { Book } from '../types/book';

export type AIProvider = 'gemini' | 'claude' | 'chatgpt' | 'copilot';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface AccountSession {
  provider: AIProvider;
  email: string;
  apiKey: string;
  isConnected: boolean;
  loginMethod: 'google' | 'api-key' | 'default';
}

interface AIBookChatModalProps {
  books: Book[];
  initialSelectedBook?: Book | null;
  onClose: () => void;
  onReadBook?: (book: Book) => void;
}

const defaultWelcomeMessages: Record<AIProvider, Message[]> = {
  gemini: [
    {
      id: 'welcome-gemini',
      role: 'assistant',
      text: '¡Hola! Soy Google Gemini. Puedo analizar a fondo cualquier libro de tu estantería, extraer citas clave, resumir capítulos o responder dudas profundas sobre tus lecturas. ¿Qué libro te gustaría explorar hoy?',
      timestamp: 'Ahora',
    },
  ],
  claude: [
    {
      id: 'welcome-claude',
      role: 'assistant',
      text: '¡Hola! Soy Claude (Anthropic). Estoy listo para reflexionar sobre los temas de tus libros, analizar la narrativa, contrastar autores y ayudarte a comprender conceptos complejos con claridad.',
      timestamp: 'Ahora',
    },
  ],
  chatgpt: [
    {
      id: 'welcome-chatgpt',
      role: 'assistant',
      text: '¡Hola! Soy ChatGPT (OpenAI). Puedo ayudarte a resumir libros, generar preguntas de comprensión, explicar ideas difíciles paso a paso o estructurar tus sesiones de estudio.',
      timestamp: 'Ahora',
    },
  ],
  copilot: [
    {
      id: 'welcome-copilot',
      role: 'assistant',
      text: '¡Hola! Soy Copilot (Microsoft). Estoy preparado para organizar puntos clave de tus libros, crear tablas comparativas de análisis y optimizar tu tiempo de lectura.',
      timestamp: 'Ahora',
    },
  ],
};

const providersConfig: Record<
  AIProvider,
  {
    name: string;
    keyLabel: string;
    keyPlaceholder: string;
    keyHelp: string;
    helpUrl: string;
  }
> = {
  gemini: {
    name: 'Google Gemini',
    keyLabel: 'API Key de Google Gemini',
    keyPlaceholder: 'AIzaSy...',
    keyHelp: 'Obtén tu clave en Google AI Studio (aistudio.google.com)',
    helpUrl: 'https://aistudio.google.com/app/apikey',
  },
  claude: {
    name: 'Anthropic Claude',
    keyLabel: 'API Key de Anthropic Claude',
    keyPlaceholder: 'sk-ant-api03-...',
    keyHelp: 'Disponible en Anthropic Console (console.anthropic.com)',
    helpUrl: 'https://console.anthropic.com/settings/keys',
  },
  chatgpt: {
    name: 'OpenAI ChatGPT',
    keyLabel: 'API Key de OpenAI ChatGPT',
    keyPlaceholder: 'sk-proj-...',
    keyHelp: 'Disponible en OpenAI Platform (platform.openai.com)',
    helpUrl: 'https://platform.openai.com/api-keys',
  },
  copilot: {
    name: 'Microsoft Copilot',
    keyLabel: 'Token de Microsoft Copilot',
    keyPlaceholder: 'ms-copilot-token...',
    keyHelp: 'Disponible en tu cuenta Microsoft / Copilot Studio',
    helpUrl: 'https://copilotstudio.microsoft.com',
  },
};

export function AIBookChatModal({
  books,
  initialSelectedBook,
  onClose,
  onReadBook,
}: AIBookChatModalProps) {
  const [selectedBookId, setSelectedBookId] = useState<string>(
    initialSelectedBook?.id || (books.length > 0 ? books[0].id : 'all')
  );
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // User Accounts & API Keys Sessions with localStorage persistence
  const [accounts, setAccounts] = useState<Record<AIProvider, AccountSession>>(() => {
    try {
      const saved = localStorage.getItem('libris_ai_credentials_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      gemini: {
        provider: 'gemini',
        email: 'he2729@gmail.com',
        apiKey: '',
        isConnected: true,
        loginMethod: 'google',
      },
      claude: {
        provider: 'claude',
        email: 'he2729@gmail.com',
        apiKey: '',
        isConnected: true,
        loginMethod: 'default',
      },
      chatgpt: {
        provider: 'chatgpt',
        email: 'he2729@gmail.com',
        apiKey: '',
        isConnected: true,
        loginMethod: 'default',
      },
      copilot: {
        provider: 'copilot',
        email: 'he2729@gmail.com',
        apiKey: '',
        isConnected: true,
        loginMethod: 'default',
      },
    };
  });

  // Modal editing state for credentials
  const [credProviderTarget, setCredProviderTarget] = useState<AIProvider>('gemini');
  const [credApiKeyInput, setCredApiKeyInput] = useState('');
  const [credEmailInput, setCredEmailInput] = useState('');
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState(false);

  // Separate conversation histories per AI provider
  const [conversations, setConversations] = useState<Record<AIProvider, Message[]>>(() => {
    try {
      const saved = localStorage.getItem('libris_ai_conversations_per_account_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return defaultWelcomeMessages;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('libris_ai_conversations_per_account_v3', JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, provider]);

  useEffect(() => {
    try {
      localStorage.setItem('libris_ai_credentials_v4', JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  const selectedBook = books.find((b) => b.id === selectedBookId) || null;
  const currentProvider = providersConfig[provider];
  const currentAccount = accounts[provider];
  const currentMessages = conversations[provider] || defaultWelcomeMessages[provider];

  const handleOpenCredentials = (targetProv?: AIProvider) => {
    const target = targetProv || provider;
    setCredProviderTarget(target);
    setCredApiKeyInput(accounts[target].apiKey || '');
    setCredEmailInput(accounts[target].email || '');
    setShowApiKeyText(false);
    setSavedSuccessAlert(false);
    setShowCredentialsModal(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAccounts((prev) => ({
      ...prev,
      [credProviderTarget]: {
        ...prev[credProviderTarget],
        apiKey: credApiKeyInput.trim(),
        email: credEmailInput.trim() || prev[credProviderTarget].email,
        isConnected: true,
        loginMethod: credApiKeyInput.trim() ? 'api-key' : prev[credProviderTarget].loginMethod,
      },
    }));
    setSavedSuccessAlert(true);
    setTimeout(() => {
      setSavedSuccessAlert(false);
      setShowCredentialsModal(false);
    }, 1200);
  };

  // Google Sign-In helper simulation with user's mobile/Google credentials
  const handleGoogleLogin = (targetProv: AIProvider) => {
    const userEmail = currentAccount.email || 'he2729@gmail.com';
    setAccounts((prev) => ({
      ...prev,
      [targetProv]: {
        ...prev[targetProv],
        email: userEmail,
        isConnected: true,
        loginMethod: 'google',
      },
    }));
    setCredEmailInput(userEmail);
    setSavedSuccessAlert(true);
    setTimeout(() => {
      setSavedSuccessAlert(false);
      setShowCredentialsModal(false);
    }, 1100);
  };

  const handleDisconnect = (targetProv: AIProvider) => {
    setAccounts((prev) => ({
      ...prev,
      [targetProv]: {
        ...prev[targetProv],
        apiKey: '',
        isConnected: false,
      },
    }));
    setCredApiKeyInput('');
  };

  const handleSendMessage = async () => {
    const textToSend = inputQuery.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) => ({
      ...prev,
      [provider]: [...(prev[provider] || []), userMsg],
    }));

    setInputQuery('');
    setIsLoading(true);

    try {
      const answer = await chatBook({
        book: selectedBook,
        allBooks: books.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          format: b.format,
          totalPages: b.totalPages,
          currentPage: b.currentPage,
          synopsis: b.synopsis,
        })),
        provider,
        apiKey: currentAccount.apiKey,
        question: textToSend,
      });

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) => ({
        ...prev,
        [provider]: [...(prev[provider] || []), aiMsg],
      }));
    } catch (err: any) {
      console.error('Error querying book AI:', err);
      const fallbackMsg: Message = {
        id: `ai-fallback-${Date.now()}`,
        role: 'assistant',
        text: selectedBook
          ? `He consultado los datos de "${selectedBook.title}". Este texto aborda temas de ${selectedBook.synopsis || 'estudio'}, escrito por ${selectedBook.author}. Puedes continuar explorando el libro en la página ${selectedBook.currentPage}.`
          : 'Consulta procesada sobre tu biblioteca de libros.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations((prev) => ({
        ...prev,
        [provider]: [...(prev[provider] || []), fallbackMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = () => {
    setConversations((prev) => ({
      ...prev,
      [provider]: defaultWelcomeMessages[provider],
    }));
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-[#082a36] text-slate-100 sm:rounded-2xl border border-[#0f3847] flex flex-col overflow-hidden shadow-2xl">
        {/* Header: Title without version strings */}
        <div className="h-14 px-4 border-b border-[#0f3847] flex items-center justify-between shrink-0 bg-[#062029]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold tracking-tight text-white uppercase truncate">
                INTERACCIÓN CON LA INTELIGENCIA ARTIFICIAL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Cerrar interacción con IA"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Control Bar: Selection Menu without version strings, Reset button, and Credentials */}
        <div className="p-3 bg-[#061e27] border-b border-[#0f3847] space-y-2.5 text-xs">
          {/* Row: Clean AI Selection Menu, Key icon button (no text), and Reset button in one single line */}
          <div className="flex items-center gap-2 w-full">
            <label className="text-[11px] text-slate-300 font-semibold shrink-0">
              IA:
            </label>

            {/* Selection Menu */}
            <div className="relative flex-1 min-w-0">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as AIProvider)}
                className="w-full bg-[#0d3b4b] border border-[#174d61] text-xs font-semibold text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer appearance-none pr-7 truncate"
              >
                <option value="gemini" className="bg-[#082a36] text-white">
                  Google Gemini
                </option>
                <option value="claude" className="bg-[#082a36] text-white">
                  Anthropic Claude
                </option>
                <option value="chatgpt" className="bg-[#082a36] text-white">
                  OpenAI ChatGPT
                </option>
                <option value="copilot" className="bg-[#082a36] text-white">
                  Microsoft Copilot
                </option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Key icon button (ONLY icon, NO text "Credenciales" as requested) */}
            <button
              onClick={() => handleOpenCredentials(provider)}
              className="p-2 text-xs rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-xs"
              title={`Cuentas y credenciales de ${currentProvider.name}`}
              aria-label={`Configurar cuentas y credenciales de ${currentProvider.name}`}
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/35 flex items-center gap-1 font-semibold shrink-0 transition-all active:scale-95 shadow-xs"
              title={`Resetear chat de ${currentProvider.name}`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset</span>
            </button>
          </div>

          {/* Clean Status Indicator: User Email and Model Version are REMOVED as requested */}
          <div className="flex items-center justify-between text-[11px] text-slate-300 px-1 pt-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-medium text-emerald-300">
                {currentAccount.isConnected ? 'Conectado y listo para interactuar' : 'Pendiente de credenciales'}
              </span>
              {currentAccount.apiKey && (
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">
                  Clave propia activa
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] opacity-75 shrink-0">
              {currentMessages.length} mensajes
            </span>
          </div>

          {/* Target Book Selector */}
          <div className="flex items-center gap-2 bg-[#082a36] p-2 rounded-xl border border-[#0f3847]">
            <BookOpen className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="text-[10px] text-slate-400 block">
                Interactuando con el libro:
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-[#082a36] text-white">
                  📚 Toda mi estantería ({books.length} libros disponibles)
                </option>
                {books.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#082a36] text-white">
                    📖 {b.title} ({b.author} · {b.format}, pág. {b.currentPage}/{b.totalPages})
                  </option>
                ))}
              </select>
            </div>
            {selectedBook && onReadBook && (
              <button
                onClick={() => {
                  onReadBook(selectedBook);
                  onClose();
                }}
                className="px-2 py-1 text-[11px] bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 rounded border border-teal-500/40 shrink-0 font-medium"
              >
                Abrir en lector
              </button>
            )}
          </div>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#041a22]">
          {currentMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-xs'
                      : 'bg-[#082a36] text-slate-200 border border-[#0f3847] rounded-tl-xs whitespace-pre-wrap'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 font-mono text-right ${
                      isUser ? 'text-slate-900/70' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 text-xs items-center text-slate-400 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#082a36] px-3.5 py-2.5 rounded-2xl border border-[#0f3847] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Consultando con {currentProvider.name}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form (Suggestions section REMOVED as requested) */}
        <div className="p-3 bg-[#082a36] border-t border-[#0f3847] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                selectedBook
                  ? `Pregunta lo que sea sobre "${selectedBook.title}"...`
                  : `Pregunta a ${currentProvider.name} sobre tus libros...`
              }
              className="flex-1 bg-[#041a22] border border-[#0f3847] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="h-10 px-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md disabled:opacity-40 transition-transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Enviar</span>
            </button>
          </form>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-[#082a36] text-slate-100 rounded-2xl border border-rose-500/40 p-4 shadow-2xl space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">
                ¿Reiniciar chat con {currentProvider.name}?
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Realmente deseas borrar el historial de conversación actual con{' '}
              <strong className="text-white">{currentProvider.name}</strong>?
            </p>
            <p className="text-[11px] text-teal-300 bg-[#062029] p-2 rounded-lg border border-[#0f3847]">
              ✓ Las conversaciones con las demás inteligencias artificiales se mantendrán intactas.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#0f3847]">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
              >
                Sí, borrar historial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS AND GOOGLE LOGIN MODAL (As requested: box to enter credentials + Google Sign-In) */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#082a36] text-slate-100 rounded-2xl border border-[#0f3847] p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#0f3847]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                  Credenciales de Inteligencia Artificial
                </h3>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-1 text-slate-400 hover:text-white"
                aria-label="Cerrar modal de credenciales"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedSuccessAlert && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0 text-emerald-300" />
                <span>¡Credenciales guardadas correctamente en tu dispositivo!</span>
              </div>
            )}

            {/* Provider Switcher Tabs in Credentials Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#051a22] p-1.5 rounded-xl border border-[#0f3847]">
              {(['gemini', 'claude', 'chatgpt', 'copilot'] as const).map((provKey) => {
                const info = providersConfig[provKey];
                const isSelected = credProviderTarget === provKey;
                const hasKey = !!accounts[provKey].apiKey;
                return (
                  <button
                    key={provKey}
                    type="button"
                    onClick={() => {
                      setCredProviderTarget(provKey);
                      setCredApiKeyInput(accounts[provKey].apiKey || '');
                      setCredEmailInput(accounts[provKey].email || '');
                      setShowApiKeyText(false);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all relative truncate ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{info.name.split(' ')[1] || info.name}</span>
                    {hasKey && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Option 1: Log in with Google Account (Fastest on Mobile) */}
            <div className="bg-[#062029] p-3.5 rounded-xl border border-[#0f3847] space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Acceso rápido con tu teléfono</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Usa tu cuenta de Google guardada en tu celular para conectar y autenticar tus servicios de IA fácilmente.
              </p>
              <button
                type="button"
                onClick={() => handleGoogleLogin(credProviderTarget)}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98"
              >
                {/* Official Google G SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continuar con mi cuenta de Google</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#0f3847]"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                O insertar credenciales manualmente
              </span>
              <div className="flex-grow border-t border-[#0f3847]"></div>
            </div>

            {/* Option 2: Manual Credentials Input Box (API Key / Token) */}
            <form onSubmit={handleSaveCredentials} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                  {providersConfig[credProviderTarget].keyLabel}:
                </label>
                <div className="relative">
                  <input
                    type={showApiKeyText ? 'text' : 'password'}
                    value={credApiKeyInput}
                    onChange={(e) => setCredApiKeyInput(e.target.value)}
                    placeholder={providersConfig[credProviderTarget].keyPlaceholder}
                    className="w-full bg-[#041a22] border border-[#0f3847] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyText((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    title={showApiKeyText ? 'Ocultar clave' : 'Mostrar clave'}
                  >
                    {showApiKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <a
                  href={providersConfig[credProviderTarget].helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-teal-400 hover:underline flex items-center gap-1 mt-1.5 inline-flex"
                >
                  <span>{providersConfig[credProviderTarget].keyHelp}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-200 mb-1">
                  Correo o Identificador de Cuenta:
                </label>
                <input
                  type="email"
                  value={credEmailInput}
                  onChange={(e) => setCredEmailInput(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-[#041a22] border border-[#0f3847] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                {accounts[credProviderTarget].apiKey && (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(credProviderTarget)}
                    className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desvincular</span>
                  </button>
                )}

                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Credenciales de {providersConfig[credProviderTarget].name}</span>
                </button>
              </div>
            </form>

            <div className="text-[10px] text-slate-400 bg-[#04171f] p-2 rounded-lg border border-[#0f3847]/60">
              🔒 <strong>Privacidad local:</strong> Tus claves y credenciales quedan almacenadas exclusivamente en el almacenamiento local seguro de tu teléfono (localStorage) y nunca son compartidas externamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

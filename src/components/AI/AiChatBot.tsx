'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Expense, CategoryBudget } from '../../lib/types';
import { generateAIResponse } from '../../lib/ai';
import { Bot, User, Send, Sparkles, Coins, Lock, Mic, MicOff, CheckCircle2, Zap, MessageSquare, Paperclip, X, Lightbulb, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth, useUser } from '@clerk/nextjs';

// ── Mobile-optimised AI message renderer ────────────────────────────────────
function MobileAIMessage({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  // Split content into blocks by double newline
  const rawBlocks = content.split(/\n{2,}/).filter(Boolean);

  // If the message is short, just render plain markdown
  if (rawBlocks.length <= 3 || content.length < 400) {
    return (
      <div className="prose prose-sm dark:prose-invert max-w-none text-[14px] leading-relaxed">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  // Detect tip/step blocks: lines starting with bold marker or number
  const isTipBlock = (block: string) =>
    /^\*\*[^\n*]+\*\*/.test(block.trim()) ||
    /^\d+\./.test(block.trim()) ||
    /^[-•]/.test(block.trim());

  const tipBlocks = rawBlocks.filter(isTipBlock);
  const introBlock = rawBlocks.find(b => !isTipBlock(b)) || '';
  const outroBlock = rawBlocks.slice().reverse().find(b => !isTipBlock(b) && b !== introBlock) || '';

  const SHOW_INITIAL = 2;
  const visibleTips = expanded ? tipBlocks : tipBlocks.slice(0, SHOW_INITIAL);

  const tipIcons = ['💡', '✂️', '🎯', '📉', '🛒', '💳', '🍽️', '📱', '🔁', '🏷️'];

  const renderTip = (block: string, i: number) => {
    // Extract bold title if present
    const titleMatch = block.match(/^\*\*([^*]+)\*\*[:\s]*([\s\S]*)$/);
    // Numbered step
    const stepMatch = block.match(/^(\d+)\.\s+([\s\S]*)$/);
    // Bullet
    const bulletMatch = block.match(/^[-•]\s+([\s\S]*)$/);

    if (titleMatch) {
      const [, title, body] = titleMatch;
      return (
        <div key={i} className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-800/60 px-4 py-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <span className="text-xl flex-shrink-0 mt-0.5">{tipIcons[i % tipIcons.length]}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug">{title.trim()}</p>
              {body.trim() && (
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  <ReactMarkdown>{body.trim()}</ReactMarkdown>
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (stepMatch) {
      const [, num, body] = stepMatch;
      return (
        <div key={i} className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{num}</span>
          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
            <ReactMarkdown>{body.trim()}</ReactMarkdown>
          </p>
        </div>
      );
    }

    if (bulletMatch) {
      return (
        <div key={i} className="flex items-start gap-2">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2" />
          <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
            <ReactMarkdown>{bulletMatch[1].trim()}</ReactMarkdown>
          </p>
        </div>
      );
    }

    return (
      <div key={i} className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3.5 py-2.5">
        <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
          <ReactMarkdown>{block.trim()}</ReactMarkdown>
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* Intro sentence */}
      {introBlock && (
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
          <ReactMarkdown>{introBlock}</ReactMarkdown>
        </p>
      )}

      {/* Tip cards */}
      <div className="space-y-2">
        {visibleTips.map((block, i) => renderTip(block, i))}
      </div>

      {/* Show more / less */}
      {tipBlocks.length > SHOW_INITIAL && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors mt-1"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> {tipBlocks.length - SHOW_INITIAL} more tips</>}
        </button>
      )}

      {/* Outro / summary */}
      {outroBlock && outroBlock !== introBlock && (
        <div className="flex items-start gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
          <TrendingDown className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <ReactMarkdown>{outroBlock}</ReactMarkdown>
          </p>
        </div>
      )}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────

interface AiChatBotProps {
  expenses: Expense[];
  budgets: CategoryBudget[];
  categories: Record<string, { color: string; bg: string; icon: string }>;
  initialPrompt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  actionExecuted?: string;
  modeUsed?: 'chat' | 'agent';
}

export const AiChatBot: React.FC<AiChatBotProps> = ({ expenses, budgets, initialPrompt }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'ai',
      content: 'Hello ! 👋 I am **SpendWise AI**.\n\nUse the toggle in the top right to switch modes:\n- 💬 **Chat Mode** (1 Credit): Ask any questions about your spending.\n- ⚡ **Agent Mode** (5 Credits): Speak or type commands in Hindi/English to automatically add expenses, goals, or budget caps!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [chatCost, setChatCost] = useState<number>(1);
  const [agentCost, setAgentCost] = useState<number>(5);
  const [fileCost, setFileCost] = useState<number>(10);
  const [attachedFile, setAttachedFile] = useState<{ name: string; mimeType: string; data: string; size: number } | null>(null);
  const [isAdminLocked, setIsAdminLocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { getToken } = useAuth();
  const { user } = useUser();
  const userImageUrl = user?.imageUrl;
  const userInitials = user?.firstName?.charAt(0)?.toUpperCase() || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || '?';

  useEffect(() => {
    const fetchCredits = async () => {
      const token = await getToken();
      if (!token) return;
      fetch('http://localhost:5000/api/chat/credits', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          if (d.credits !== undefined) setCredits(d.credits);
          if (d.isLocked !== undefined) setIsAdminLocked(d.isLocked);
          if (d.chatCost !== undefined) setChatCost(d.chatCost);
          if (d.agentCost !== undefined) setAgentCost(d.agentCost);
          if (d.fileCost !== undefined) setFileCost(d.fileCost);

          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs[0]?.id === 'init-1') {
              const cStr = d.chatCost !== undefined && d.chatCost < 1 ? `was 1 Cr, now ${d.chatCost} Cr` : `${d.chatCost ?? 1} Credit(s)`;
              const aStr = d.agentCost !== undefined && d.agentCost < 5 ? `was 5 Cr, now ${d.agentCost} Cr` : `${d.agentCost ?? 5} Credit(s)`;
              const fStr = d.fileCost !== undefined ? `${d.fileCost} Credit(s)` : `10 Credit(s)`;
              newMsgs[0].content = `Namaste! 🙏 I am **SpendWise AI**.\n\nUse the toggle in the top right to switch modes:\n- 💬 **Chat Mode** (${cStr}): Ask any questions about your spending.\n- ⚡ **Agent Mode** (${aStr}): Speak or type commands in Hindi/English to automatically add expenses, goals, or budget caps!\n- 📎 **File Upload** (${fStr}): In Agent Mode, you can attach a transaction file to extract bulk expenses.`;
            }
            return newMsgs;
          });
        })
        .catch(console.error);
    };
    fetchCredits();

    // Initialize Web Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-IN'; // Indian English transcribes spoken Hindi into Hinglish (Roman script)

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputValue(currentTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Pre-fill input if navigated from comparison table
  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt);
    }
  }, [initialPrompt]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: data.split(',')[1] || data, // get base64 part if data URL, or plain text if readAsText
        size: file.size
      });
    };

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      reader.readAsDataURL(file);
    } else {
      // For CSV or TXT, we can still read as Data URL to keep the API simple, 
      // or read as text. Reading as base64 Data URL handles all types uniformly.
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if ((!inputValue.trim() && !attachedFile) || isLoading) return;

    let content = inputValue.trim();
    if (!content && attachedFile) {
      content = `Attached file: ${attachedFile.name}`;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const fileDataToSend = attachedFile;
    setAttachedFile(null); // Clear file after sending
    setIsLoading(true);

    try {
      const token = await getToken();
      const result: any = await generateAIResponse(userMessage.content, expenses, budgets, isAgentMode, token, fileDataToSend);

      if (result.error) {
        const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'ai', content: `**Error**: ${result.error}` };
        setMessages(prev => [...prev, errorMsg]);
      } else if (result.text) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: result.text,
          actionExecuted: result.actionExecuted,
          modeUsed: isAgentMode ? 'agent' : 'chat',
        };
        setMessages(prev => [...prev, aiMessage]);
        if (result.creditsRemaining !== undefined) {
          setCredits(result.creditsRemaining);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] dark:bg-slate-950 overflow-hidden relative shadow-sm rounded-none">
      {/* WhatsApp style chat background pattern */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              SpendWise AI
            </h2>
            <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-0.5">
              Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 z-10">
          <button
            onClick={() => setIsAgentMode(!isAgentMode)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Mode"
          >
            {isAgentMode ? <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> : <MessageSquare className="w-4 h-4 text-indigo-500" />}
          </button>

          {credits !== null && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-white dark:bg-slate-800 ${credits > 0 ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900' : 'text-rose-600 dark:text-rose-400 border-rose-200'}`}>
              <Coins className="w-3.5 h-3.5" />
              {credits}
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {messages.map(msg => (
          <div key={msg.id} className="flex w-full">
            {msg.role === 'user' ? (
              /* User bubble — full width, right-aligned, WhatsApp green */
              <div className="flex gap-2 w-full flex-row-reverse">
                <div className="w-7 h-7 rounded-full flex-shrink-0 self-start mt-1 shadow-sm overflow-hidden">
                  {userImageUrl ? (
                    <img src={userImageUrl} alt="You" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#25D366] flex items-center justify-center text-white text-xs font-bold">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 px-3 py-2.5 rounded-2xl rounded-tr-none bg-[#DCF8C6] dark:bg-[#005C4B] text-slate-900 dark:text-[#E9EDEF] shadow-sm">
                  <p className="text-[14px] leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ) : (
              /* AI bubble — full width so cards don't squash */
              <div className="flex gap-2 w-full">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white self-start mt-1">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0 px-3 py-2.5 rounded-2xl rounded-tl-none bg-white dark:bg-[#202C33] text-slate-800 dark:text-[#E9EDEF] shadow-sm space-y-2">
                  {msg.actionExecuted && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{msg.actionExecuted}</span>
                    </div>
                  )}
                  <MobileAIMessage content={msg.content} />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="flex gap-3 max-w-[80%] flex-row">
              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {(credits !== null && credits <= 0) || isAdminLocked ? (
        <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900 z-10 flex flex-col items-center justify-center text-center space-y-2 py-8">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isAdminLocked ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">
            {isAdminLocked ? '🔒 AI Chat Disabled by Administrator' : 'Out of AI Credits'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {isAdminLocked
              ? 'The AI chatbot has been temporarily locked. Please contact the developer to restore access.'
              : 'You have used all your available AI credits. Please contact the developer to add more credits to your account.'}
          </p>
        </div>
      ) : (
        <div className="p-2 sm:p-3 bg-[#f0f2f5] dark:bg-[#202c33] z-10 flex flex-col gap-2">
          {attachedFile && (
            <div className="mx-2 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{attachedFile.name}</span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium shrink-0 ml-2 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                  Costs {fileCost} Cr
                </span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="relative flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-3xl shadow-sm px-1">
              {isAgentMode && (
                <>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,.pdf,.csv,.txt"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || credits === null}
                    className="p-2.5 ml-1 rounded-full text-[#8696a0] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title={`Attach File (${fileCost} Credits)`}
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </>
              )}
              
              <input
                type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={
                isListening
                  ? 'Listening...'
                  : isAgentMode
                    ? '⚡ Agent: Add expense...'
                    : '💬 Message'
              }
              disabled={isLoading || credits === null}
              className={`w-full pl-4 pr-10 py-2.5 sm:py-3 bg-transparent border-none text-slate-900 dark:text-[#d1d7db] text-[15px] focus:outline-none focus:ring-0 transition-all disabled:opacity-50 ${isListening ? 'text-rose-500 font-medium animate-pulse' : ''}`}
            />

            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading || credits === null}
              className={`absolute right-1.5 p-1.5 rounded-full transition-all ${isListening
                ? 'text-rose-500 animate-bounce'
                : 'text-[#8696a0] hover:text-[#54656f] dark:hover:text-[#d1d7db]'
                }`}
            >
              {isListening ? <MicOff className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Mic className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={isLoading || (!inputValue.trim() && !attachedFile) || credits === null}
            className={`w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-full flex items-center justify-center shrink-0 text-white shadow-sm transition-all disabled:opacity-50 ${isAgentMode
              ? 'bg-amber-500 hover:bg-amber-600'
              : 'bg-[#00a884] hover:bg-[#008f6f]'
              }`}
          >
            <Send className="w-[18px] h-[18px] sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
          </button>
        </div>
        </div>
      )}
    </div>
  );
};

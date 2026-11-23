import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';

interface TechAssistantWidgetProps {
  onNavigateToService?: (tab: 'repair' | 'upgrade', category?: string) => void;
  onNavigateToPrebuilts?: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const TechAssistantWidget: React.FC<TechAssistantWidgetProps> = ({
  onNavigateToService,
  onNavigateToPrebuilts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "👋 Hi! I'm your QTR Virtual Technician. Ask me anything about computer issues, whether a repair or upgrade is best, or check specs on our new **NITROFORGE X3060** prebuilt!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: newMessages.slice(-6)
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: "I'm having a brief connection hiccup. For urgent assistance, please call us directly at 0493 711 832 or drop in at 25 Emma St Caufield south 3162."
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "I couldn't reach the diagnostic server right now. Feel free to call us at 0493 711 832 or submit a service request directly!"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'model',
        text: "Chat cleared! How can I help you today with your laptop, desktop, or custom PC?"
      }
    ]);
  };

  return (
    <>
      {/* Floating Corner Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3 border border-blue-400/30 group"
          aria-label="Open QTR Tech AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-700 rounded-full" />
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-bold leading-tight">QTR Tech Assistant</div>
            <div className="text-[10px] text-blue-200">Ask a technician 24/7</div>
          </div>
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                  <span>QTR Tech AI</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  Instant diagnosis, repairs &amp; build advice
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Close assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSendMessage('Tell me about the new NITROFORGE X3060')}
              className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full font-medium transition-all text-[11px]"
            >
              🚀 NITROFORGE X3060 Specs
            </button>
            <button
              onClick={() => handleSendMessage('Can you upgrade my MacBook?')}
              className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full font-medium transition-all text-[11px]"
            >
              🍏 MacBook Upgrade Policy
            </button>
            <button
              onClick={() => handleSendMessage('How much is Express vs Regular service?')}
              className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full font-medium transition-all text-[11px]"
            >
              ⚡ Service Speeds
            </button>
            <button
              onClick={() => handleSendMessage('My PC turns on but gives no display')}
              className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full font-medium transition-all text-[11px]"
            >
              🖥️ No Display Signal
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-100/50 text-xs sm:text-sm">
            {messages.map((msg, index) => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={index}
                  className={`flex gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      isAi
                        ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal">{msg.text}</div>
                  </div>
                  {!isAi && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>QTR Technician is assessing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about repairs, upgrades, or prebuilts..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={loading || !input.trim()}
                onClick={() => handleSendMessage()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors shadow-xs"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Never share passwords in chat.</span>
              <span>25 Emma St Caufield south 3162</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

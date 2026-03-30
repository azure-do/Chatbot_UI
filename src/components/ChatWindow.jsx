import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CharacterDisplay from './CharacterDisplay';

const SUGGESTIONS = [
  '製品について教えてください',
  '私に合っていますか？',
  '購入したいです！',
  '返品できますか？',
  'おすすめは何ですか？',
  '営業時間を教えてください',
];

const ChatWindow = ({ messages, onSendMessage, isThinking, expression, isSpeaking, streamingMessageId, streamingText }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const suggestionsRef = useRef(null);
  const scrollPaused = useRef(false);
  const scrollDirection = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingText]);

  useEffect(() => {
    const el = suggestionsRef.current;
    if (!el) return undefined;

    let animationFrameId;
    let direction = 1;

    const step = () => {
      if (!el) return;
      if (scrollPaused.current) {
        animationFrameId = window.requestAnimationFrame(step);
        return;
      }

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      if (maxScroll <= 0) {
        animationFrameId = window.requestAnimationFrame(step);
        return;
      }

      const nextScroll = el.scrollLeft + direction;
      if (nextScroll <= 0) {
        direction = 1;
      } else if (nextScroll >= maxScroll) {
        direction = -1;
      }

      el.scrollLeft = Math.min(maxScroll, Math.max(0, el.scrollLeft + direction));
      animationFrameId = window.requestAnimationFrame(step);
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  // Get the display text for a message
  const getDisplayText = (msg) => {
    if (msg.id === streamingMessageId && streamingText) {
      return streamingText;
    }
    return msg.text;
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#fff7ef]">

      <div className="flex-1 overflow-y-auto scrollbar-hide relative bg-[#fff7ef]">

        <div className="sticky top-0 z-10 pointer-events-none flex justify-center bg-[#fff7ef]">
          <div className="h-40 sm:h-48 md:h-52 w-full max-w-xs sm:max-w-sm overflow-hidden">
            <CharacterDisplay
              expression={expression}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              compact={true}
            />
          </div>
        </div>

        <div className="px-3 sm:px-5 pb-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f4e3d2] flex items-center justify-center shadow-sm">
                    <Bot size={14} className="text-[#9b6a43]" />
                  </div>
                )}

                <div
                  className={`max-w-[78%] sm:max-w-[70%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-[28px] ${
                    msg.role === 'user'
                      ? 'bg-[#8e4a2f] text-white shadow-[0_16px_28px_rgba(142,74,47,0.18)]'
                      : 'bg-[#f5ece3] border border-[#ecdcd0] text-[#4d3523] shadow-[0_8px_20px_rgba(167,131,104,0.12)]'
                  }`}
                >
                  {getDisplayText(msg)}
                  {msg.id === streamingMessageId && streamingText && (
                    <span className="inline-block w-0.5 h-4 bg-[#a56a45] ml-0.5 animate-pulse" />
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#b56b3e] via-[#c07a49] to-[#d69968] flex items-center justify-center shadow-sm">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#f4e3d2] flex items-center justify-center shadow-sm">
                <Bot size={14} className="text-[#9b6a43] animate-pulse" />
              </div>
              <div className="bg-[#fbf0e6] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-[#d9b09b] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="shrink-0 px-3 sm:px-5 pt-3 pb-2 bg-[#fff7ef] border-t border-[#e7d0bc]">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#8f6246] mb-2">会話例</p>
        <div ref={suggestionsRef} className="flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => !isThinking && onSendMessage(s)}
              onMouseEnter={() => { scrollPaused.current = true; }}
              onMouseLeave={() => { scrollPaused.current = false; }}
              disabled={isThinking}
              className="shrink-0 cursor-pointer text-[10px] sm:text-xs bg-[#f9ede1] border border-[#e4d2c0] text-[#6a4a36] px-3 py-1.5 rounded-full transition-colors hover:border-[#cfa47d] hover:text-[#8a603f] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="shrink-0 px-3 sm:px-5 py-3 sm:py-4 border-t border-[#e7d0bc] bg-[#fff7ef] flex gap-2 items-center"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力…"
          disabled={isThinking}
          className="flex-1 min-w-0 bg-white border border-[#ebdfd3] rounded-full px-5 py-3 text-sm text-[#5d4032] shadow-sm focus:outline-none focus:ring-0 focus:border-[#d3b09a] transition-all placeholder:text-[#c4a48f] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isThinking || !inputText.trim()}
          className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-[0_14px_28px_rgba(115,55,32,0.24)] ${
            inputText.trim() && !isThinking
              ? 'bg-[#a75f35] text-white hover:bg-[#8a4d2a]'
              : 'bg-[#e5d6cb] text-[#a78c7d] cursor-not-allowed'
          }`}
          aria-label="送信"
        >
          <SendHorizontal size={18} className="translate-x-[1px]" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

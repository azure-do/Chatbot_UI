import React, { useState } from 'react';
import { X } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import { useChat } from '../hooks/useChat';
import { phaseToExpressionMap } from '../constants/phases';

const ChatPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { 
    messages, 
    currentPhase, 
    isThinking, 
    isSpeaking, 
    handleSendMessage,
    streamingMessageId,
    streamingText
  } = useChat();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6ede3] px-4 py-6 text-[#3d2b1a]">
      {!chatOpen ? (
        <div className="flex flex-col items-center justify-center w-full max-w-[420px] h-[70vh]">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="group relative inline-flex flex-col items-center justify-center w-full max-w-[360px] rounded-[36px] border border-[#d6b59b] bg-gradient-to-br from-[#a56330] to-[#7f4722] px-8 py-6 text-white shadow-[0_24px_60px_rgba(125,63,29,0.24)] transition-all hover:-translate-y-0.5 hover:shadow-[0_32px_80px_rgba(125,63,29,0.32)]"
          >
            <span className="text-lg font-semibold tracking-[0.04em]">チャットボットに相談</span>
            <span className="mt-2 text-sm text-[#ffe8ca]">ドキュメント風ボタンでチャットを開く</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col w-full max-w-[420px] h-[90vh] max-h-[780px] bg-[#fff7ef] rounded-[32px] shadow-[0_30px_80px_rgba(81,47,27,0.16)] overflow-hidden border border-[#e7d0bc]">

          <header className="shrink-0 px-5 py-4 bg-[#8d6131] border-b border-[#d6b59b] flex items-center gap-3 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0d2a8] shadow shadow-[#d4b089]/40" />
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-semibold tracking-[0.08em] truncate">チャットボット</h1>
              <p className="text-[11px] text-[#f8e4cd] uppercase tracking-[0.24em] truncate">
                お店全体の接客担当です
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
              aria-label="閉じる"
            >
              <X size={16} />
            </button>
          </header>

          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isThinking={isThinking}
              expression={phaseToExpressionMap[currentPhase]}
              isSpeaking={isSpeaking}
              streamingMessageId={streamingMessageId}
              streamingText={streamingText}
            />
          </div>

          <footer className="shrink-0 py-2 text-center text-[10px] text-[#94715b] border-t border-[#e7d0bc] bg-[#fff7ef]">
            Chatbotで提供
          </footer>
        </div>
      )}
    </div>
  );
};

export default ChatPage;

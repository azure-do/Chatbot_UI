import { useState, useCallback } from 'react';
import { PHASE_ORDER } from '../constants/phases';

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'assistant',
    text: 'こんにちは！AI Okānへようこそ。本日はどのようにお手伝いできますか？',
    phase: 'welcome',
  },
];

const PHASE_NAMES_JA = {
  welcome: 'ウェルカム',
  gathering: '情報収集',
  casual: 'カジュアル',
  explanation: '説明',
  proposal: '提案',
  closing: 'クロージング',
  celebration: 'お祝い',
};

const getNextPhase = (current) => {
  const idx = PHASE_ORDER.indexOf(current);
  if (idx === -1 || idx === PHASE_ORDER.length - 1) return current;
  return PHASE_ORDER[idx + 1];
};

const splitChunks = (text) => {
  // Split character by character for very slow streaming
  return text.split('');
};

const generateChatGPTStyleResponse = (userText) => {
  const normalized = userText.trim();
  if (!normalized) {
    return 'すみません、質問の内容がよくわかりませんでした。もう少し詳しく教えていただけますか？';
  }

  const responses = [];

  if (/価格|値段|費用|料金/.test(normalized)) {
    responses.push('ご質問ありがとうございます。価格についてですね。');
    responses.push('商品の価格はサイズや仕様によって異なります。');
    responses.push('具体的にどのような商品をお探しですか？');
    responses.push('詳しい情報をいただければ、最適なご提案ができます。');
  } else if (/在庫|いつ|納期|入荷/.test(normalized)) {
    responses.push('在庫状況についてのご質問ですね。');
    responses.push('現在の在庫状況は常に変動しています。');
    responses.push('ご希望の商品名や数量を教えていただければ、');
    responses.push('最新の在庫情報と納期をお伝えできます。');
  } else if (/使い方|方法|どう|使用/.test(normalized)) {
    responses.push('使い方についてのご質問ですね。');
    responses.push('まず基本的な手順からご説明いたします。');
    responses.push('具体的な用途や目的を教えていただくと、');
    responses.push('より適切な利用方法をご紹介できます。');
  } else if (/おすすめ|どれ|ベスト|選び方/.test(normalized)) {
    responses.push('おすすめについてのご質問ですね。');
    responses.push('選び方のポイントは、用途とご予算です。');
    responses.push('どのような場面で使用されるのか、');
    responses.push('また予算の目安を教えていただけますか？');
  } else if (/ありがとう|助か|感謝|ありがとうございます/.test(normalized)) {
    responses.push('こちらこそ、ご利用ありがとうございます。');
    responses.push('ご不明な点やご質問があれば、');
    responses.push('いつでもお気軽にお聞きください。');
    responses.push('本日はご利用いただきありがとうございました。');
  } else if (/返品|交換|キャンセル/.test(normalized)) {
    responses.push('返品・交換についてのご質問ですね。');
    responses.push('当店では、ご購入後30日以内の返品に対応しています。');
    responses.push('詳しい条件や手続きについては、');
    responses.push('お気軽にお問い合わせください。');
  } else if (/営業時間|営業|時間/.test(normalized)) {
    responses.push('営業時間についてのご質問ですね。');
    responses.push('当店の営業時間は、平日10:00～19:00です。');
    responses.push('土日祝日も営業しており、');
    responses.push('ご不明な点はいつでもお気軽にお聞きください。');
  } else {
    responses.push(`「${normalized}」についてですね。`);
    responses.push('ご質問の内容をしっかり理解させていただきました。');
    responses.push('詳しくご説明させていただきます。');
    responses.push('ご不明な点があれば、いつでもお気軽にお聞きください。');
  }

  return responses.join(' ');
};

export const useChat = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [currentPhase, setCurrentPhase] = useState('welcome');
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [streamingText, setStreamingText] = useState('');

  const streamMessage = useCallback((messageId, fullText, onComplete) => {
    let currentIndex = 0;
    const chunks = splitChunks(fullText);
    
    // Simulate thinking time before streaming starts
    const thinkingDelay = setTimeout(() => {
      const streamInterval = setInterval(() => {
        if (currentIndex < chunks.length) {
          const textToShow = chunks.slice(0, currentIndex + 1).join('');
          setStreamingText(textToShow);
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setStreamingMessageId(null);
          setStreamingText('');
          if (onComplete) onComplete();
        }
      }, 60); // Slower - 60ms per character

      return () => clearInterval(streamInterval);
    }, 2500); // 2.5 second thinking delay before streaming starts

    return () => clearTimeout(thinkingDelay);
  }, []);

  const handleSendMessage = (text) => {
    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const nextPhase = getNextPhase(currentPhase);
    const assistantMsg = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: '',
      phase: nextPhase,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setCurrentPhase(nextPhase);

    const assistantText = generateChatGPTStyleResponse(text);

    setIsThinking(false);
    setIsSpeaking(true);
    setStreamingMessageId(assistantMsg.id);

    streamMessage(assistantMsg.id, assistantText, () => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsg.id ? { ...msg, text: assistantText } : msg
        )
      );
      setIsSpeaking(false);
    });
  };

  return {
    messages,
    currentPhase,
    isThinking,
    isSpeaking,
    handleSendMessage,
    streamingMessageId,
    streamingText,
  };
};

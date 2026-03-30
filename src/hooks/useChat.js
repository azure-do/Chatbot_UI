import { useState, useCallback } from 'react';
import { PHASE_ORDER } from '../constants/phases';

const INITIAL_MESSAGES = [
  {
    id: '1',
    role: 'assistant',
    text: 'こんにちは！AI Okanへようこそ。本日はどのようにお手伝いできますか？',
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
  const chunks = text.match(/\S+|\s+/g) || [];
  return chunks.length > 1 ? chunks : text.split('');
};

const generateChatGPTStyleResponse = (userText) => {
  const normalized = userText.trim();
  if (!normalized) {
    return 'すみません、質問の内容がよくわかりませんでした。もう少し詳しく教えていただけますか？';
  }

  const baseAnswer = [];
  baseAnswer.push('お問い合わせありがとうございます。AI Okanです。');

  if (/価格|値段|費用|料金/.test(normalized)) {
    baseAnswer.push('商品の価格については、サイズや仕様によって変動します。具体的な候補があれば、さらに詳しくご案内いたします。');
  } else if (/在庫|いつ|納期|入荷/.test(normalized)) {
    baseAnswer.push('在庫状況や納期は、タイミングによって変わります。ご希望の商品名や数量を教えていただければ、最新情報をお伝えできます。');
  } else if (/使い方|方法|どう/.test(normalized)) {
    baseAnswer.push('使い方については、まず基本的な手順をご説明します。具体的な目的に合わせて、より適切な利用方法をご紹介できます。');
  } else if (/おすすめ|どれ|ベスト/.test(normalized)) {
    baseAnswer.push('おすすめの選び方に関しては、用途やご予算に合わせて判断するのがポイントです。お好みのスタイルや用途を教えてください。');
  } else if (/ありがとう|助か|感謝/.test(normalized)) {
    baseAnswer.push('こちらこそありがとうございます。ほかにも気になる点があれば、どうぞ遠慮なくお知らせください。');
  } else {
    baseAnswer.push(`「${normalized}」について、できるだけ丁寧にお答えします。`);
    baseAnswer.push('必要であれば、さらに詳しい情報や次のステップも追加でご案内いたします。');
  }

  baseAnswer.push('ご不明点があれば、いつでもお気軽にお聞きください。');
  return baseAnswer.join(' ');
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
    }, 60);

    return () => clearInterval(streamInterval);
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

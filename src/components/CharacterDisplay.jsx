import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CharacterDisplay
 *
 * compact = false (default standalone card)
 *   → renders a white rounded card with its own padding
 *
 * compact = true (embedded in ChatWindow banner)
 *   → fills 100 % of whatever parent box you put it in;
 *     no background/border of its own
 */
const CharacterDisplay = ({ expression, isThinking, isSpeaking, compact = false }) => {
  const expressionImages = {
    smile: '/smile.png',
    empathy: '/empathy.png',
    explanation: '/explanation.png',
    friendliness: '/friendliness.png',
    confidence: '/confidence.png',
    celebration: '/celebration.png',
  };

  useEffect(() => {
    Object.values(expressionImages).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const getExpressionImage = (exp) => {
    const src = expressionImages[exp] || expressionImages.smile;
    return (
      <img
        src={src}
        alt={exp}
        loading="eager"
        className="w-full h-full max-w-full max-h-full object-contain border-0 bg-transparent"
        style={{ mixBlendMode: 'multiply', backgroundColor: 'transparent' }}
        onError={(e) => {
          e.target.onerror = null;
          if (e.target.src.endsWith('/smile.png')) {
            e.target.style.display = 'none';
          } else {
            e.target.src = expressionImages.smile;
          }
        }}
      />
    );
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full ${
        compact ? '' : 'p-8 bg-white rounded-2xl shadow-lg border border-slate-200 aspect-square'
      }`}
    >
      {/* Image wrapper — in compact mode fills 100 % of parent */}
      <div className={`relative ${compact ? 'w-full h-full isolate bg-transparent' : 'w-48 h-48 isolate bg-transparent'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={isThinking ? 'thinking' : expression}
            initial={{ opacity: 0, scale: 0.88, y: 10 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: isThinking ? [0, -6, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{
              duration: 0.3,
              y: isThinking
                ? { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
                : { duration: 0.3 },
            }}
            className="w-full h-full"
          >
            {getExpressionImage(expression)}
          </motion.div>
        </AnimatePresence>

        {/* Thinking dots */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-3 -right-3 flex gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                className="w-2 h-2 bg-blue-400 rounded-full shadow"
              />
            ))}
          </motion.div>
        )}

        {/* Lip-sync bar */}
        {isSpeaking && !isThinking && (
          <motion.div
            animate={{ scaleY: [1, 1.8, 1] }}
            transition={{ repeat: Infinity, duration: 0.2 }}
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-700/15 rounded-full blur-[2px]"
          />
        )}
      </div>

      {/* Label — only in standalone (non-compact) mode */}
      {!compact && (
        <p className="mt-6 text-sm font-medium text-slate-500 uppercase tracking-widest">
          {isThinking ? 'AI Okān is thinking…' : `Status: ${expression}`}
        </p>
      )}
    </div>
  );
};

export default CharacterDisplay;

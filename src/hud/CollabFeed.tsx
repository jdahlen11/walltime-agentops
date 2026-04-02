import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useFeedStore } from '../store/feedStore';

export function CollabFeed() {
  const messages = useFeedStore(s => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(10, 14, 23, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        height: '200px',
      }}
    >
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse-soft 2s infinite' }}
        />
        <span className="text-xs font-bold text-slate-300">COLLAB FEED</span>
        <span className="text-xs text-slate-500 ml-auto">live</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-1.5 py-1 px-1 rounded"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <span
                className="text-xs font-bold shrink-0 mt-0.5"
                style={{ color: msg.agentColor, minWidth: '45px' }}
              >
                {msg.agentName}
              </span>
              <span className="text-xs text-slate-300 flex-1 leading-relaxed">{msg.text}</span>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    background: 'rgba(0, 212, 255, 0.1)',
                    color: '#00D4FF',
                    fontSize: '9px',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  #{msg.topic}
                </span>
                <span className="text-slate-600" style={{ fontSize: '9px' }}>
                  {format(msg.timestamp, 'HH:mm:ss')}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

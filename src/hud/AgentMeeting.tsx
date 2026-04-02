import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { AGENT_CONFIGS } from '../store/agentStore';
import { useFeedStore } from '../store/feedStore';

interface WhiteboardItem {
  id: string;
  text: string;
  priority: 'P0' | 'P1' | 'P2';
}

const INITIAL_WHITEBOARD: WhiteboardItem[] = [
  { id: 'w1', text: 'Cedars Accelerator — complete demo polish', priority: 'P0' },
  { id: 'w2', text: 'ESO meeting prep — April 16', priority: 'P0' },
  { id: 'w3', text: '$500K SAFE investor deck refresh', priority: 'P1' },
  { id: 'w4', text: 'Landing page (walltime.ai)', priority: 'P1' },
  { id: 'w5', text: 'RLS on active_walls table', priority: 'P2' },
  { id: 'w6', text: 'Supabase schema migration', priority: 'P2' },
];

const PRIORITY_COLORS: Record<string, string> = {
  P0: '#ef4444',
  P1: '#F59E0B',
  P2: '#3B82F6',
};

const PRIORITY_BG: Record<string, string> = {
  P0: 'rgba(239,68,68,0.1)',
  P1: 'rgba(245,158,11,0.1)',
  P2: 'rgba(59,130,246,0.1)',
};

function WaveBar({ delay }: { delay: number }) {
  return (
    <motion.div
      animate={{ scaleY: [1, 3, 1, 2, 1] }}
      transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
      style={{
        width: '3px',
        height: '12px',
        background: '#22c55e',
        borderRadius: '2px',
        transformOrigin: 'bottom',
      }}
    />
  );
}

interface AgentMeetingProps {
  onClose: () => void;
}

export function AgentMeeting({ onClose }: AgentMeetingProps) {
  const [speakingIdx, setSpeakingIdx] = useState(0);
  const [whiteboard, setWhiteboard] = useState<WhiteboardItem[]>(INITIAL_WHITEBOARD);
  const [newItemText, setNewItemText] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
  const messages = useFeedStore(s => s.messages);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeakingIdx(i => (i + 1) % AGENT_CONFIGS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const removeItem = (id: string) => {
    setWhiteboard(wb => wb.filter(i => i.id !== id));
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    setWhiteboard(wb => [...wb, {
      id: `w-${Date.now()}`,
      text: newItemText,
      priority: newItemPriority,
    }]);
    setNewItemText('');
  };

  const speakingAgent = AGENT_CONFIGS[speakingIdx];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-4 z-50 rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(8, 12, 22, 0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        boxShadow: '0 0 60px rgba(0, 212, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => <WaveBar key={i} delay={i * 0.15} />)}
          </div>
          <span className="text-lg font-bold text-white">Agent Briefing Room</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e40' }}
          >
            LIVE
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors p-1"
          style={{ pointerEvents: 'auto' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left: Agent Grid */}
        <div className="w-72 shrink-0 p-4 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Agents Online</div>
          <div className="grid grid-cols-2 gap-2">
            {AGENT_CONFIGS.map((cfg, i) => {
              const isSpeaking = i === speakingIdx;
              return (
                <motion.div
                  key={cfg.id}
                  animate={isSpeaking ? { borderColor: cfg.color } : {}}
                  className="rounded-xl p-3 flex flex-col items-center gap-2 relative"
                  style={{
                    background: isSpeaking ? `rgba(${hexRgb(cfg.color)}, 0.12)` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isSpeaking ? cfg.color : 'rgba(255,255,255,0.06)'}`,
                    boxShadow: isSpeaking ? `0 0 16px ${cfg.color}50` : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <span className="text-2xl">{cfg.emoji}</span>
                  <span className="text-xs font-bold text-white">{cfg.displayName}</span>
                  {isSpeaking && (
                    <div className="flex gap-0.5 items-end" style={{ height: '14px' }}>
                      {[0, 1, 2, 3, 4].map(j => <WaveBar key={j} delay={j * 0.1} />)}
                    </div>
                  )}
                  {isSpeaking && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute top-2 right-2"
                    >
                      <Mic size={10} color={cfg.color} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Center: Transcript */}
        <div className="flex-1 p-4 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Live Transcript</div>
          <div className="flex flex-col gap-2">
            {messages.slice(-12).map(msg => {
              const isCurrentSpeaker = msg.agentId === speakingAgent.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                  style={{ justifyContent: isCurrentSpeaker ? 'flex-end' : 'flex-start' }}
                >
                  <div
                    className="rounded-xl px-3 py-2 max-w-xs"
                    style={{
                      background: isCurrentSpeaker
                        ? `rgba(${hexRgb(msg.agentColor)}, 0.2)`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isCurrentSpeaker ? msg.agentColor + '50' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="text-xs font-bold mb-0.5" style={{ color: msg.agentColor }}>
                      {msg.agentName}
                    </div>
                    <div className="text-xs text-slate-300">{msg.text}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right: Whiteboard */}
        <div className="w-72 shrink-0 p-4 overflow-y-auto">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Mission Whiteboard</div>

          {(['P0', 'P1', 'P2'] as const).map(priority => (
            <div key={priority} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ background: PRIORITY_BG[priority], color: PRIORITY_COLORS[priority], border: `1px solid ${PRIORITY_COLORS[priority]}40` }}
                >
                  {priority}
                </span>
                <div className="flex-1 h-px" style={{ background: PRIORITY_COLORS[priority] + '30' }} />
              </div>
              <div className="flex flex-col gap-1.5">
                {whiteboard.filter(i => i.priority === priority).map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 rounded-lg px-3 py-2 group"
                    style={{ background: PRIORITY_BG[priority], border: `1px solid ${PRIORITY_COLORS[priority]}25` }}
                  >
                    <span className="text-xs text-slate-300 flex-1 leading-relaxed">{item.text}</span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                      style={{ pointerEvents: 'auto', fontSize: '12px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Add item */}
          <div className="mt-2">
            <input
              type="text"
              value={newItemText}
              onChange={e => setNewItemText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add task..."
              className="w-full text-xs rounded-lg px-3 py-2 mb-1.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                outline: 'none',
                pointerEvents: 'auto',
              }}
            />
            <div className="flex gap-1.5">
              {(['P0', 'P1', 'P2'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setNewItemPriority(p)}
                  className="text-xs px-2 py-1 rounded flex-1"
                  style={{
                    background: newItemPriority === p ? PRIORITY_BG[p] : 'rgba(255,255,255,0.03)',
                    color: newItemPriority === p ? PRIORITY_COLORS[p] : '#64748b',
                    border: `1px solid ${newItemPriority === p ? PRIORITY_COLORS[p] + '50' : 'rgba(255,255,255,0.06)'}`,
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={addItem}
                className="text-xs px-3 py-1 rounded"
                style={{
                  background: 'rgba(0, 212, 255, 0.15)',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.3)',
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function hexRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

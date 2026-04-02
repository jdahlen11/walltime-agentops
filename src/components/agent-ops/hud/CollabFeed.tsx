import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useCollabFeed } from '../hooks/useCollabFeed'

export default function CollabFeed() {
  const messages = useCollabFeed(s => s.messages)
  const push = useCollabFeed(s => s.push)
  useEffect(() => { const id = setInterval(push, 5000); return () => clearInterval(id) }, [push])

  return (
    <div style={{ position: 'absolute', bottom: 70, right: 12, width: 235, pointerEvents: 'none' }}>
      <div style={{ color: '#334155', fontSize: 8, letterSpacing: 2, fontFamily: 'monospace', textTransform: 'uppercase', marginBottom: 4 }}>Collab Feed</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 260, overflowY: 'auto' }}>
        <AnimatePresence mode="popLayout">
          {messages.map(m => (
            <motion.div key={m.id}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'rgba(10,14,23,0.82)', borderLeft: `2px solid ${m.color}`,
                borderRadius: 4, padding: '4px 8px',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: 9, fontFamily: 'monospace', lineHeight: 1.4 }}>{m.text}</div>
              <div style={{ color: '#1e293b', fontSize: 7, fontFamily: 'monospace', marginTop: 1 }}>{format(m.ts, 'HH:mm:ss')}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

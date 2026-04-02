import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFeedStore } from '../store/feedStore'
import { format } from 'date-fns'

export default function CollabFeed() {
  const messages = useFeedStore(s => s.messages)
  const addMessage = useFeedStore(s => s.addMessage)

  useEffect(() => {
    const id = setInterval(addMessage, 5000)
    return () => clearInterval(id)
  }, [addMessage])

  return (
    <div style={{
      position: 'absolute',
      bottom: 70,
      right: 12,
      width: 240,
      pointerEvents: 'none',
      fontFamily: 'monospace',
    }}>
      <div style={{
        color: '#475569',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
        paddingLeft: 2,
      }}>
        Collab Feed
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxHeight: 280,
        overflowY: 'auto',
      }}>
        <AnimatePresence mode="popLayout">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'rgba(10,10,20,0.82)',
                border: `1px solid rgba(${hexToRgb(msg.color)},0.2)`,
                borderLeft: `2px solid ${msg.color}`,
                borderRadius: 4,
                padding: '4px 8px',
              }}
            >
              <div style={{ color: '#cbd5e1', fontSize: 10, lineHeight: 1.4 }}>
                {msg.text}
              </div>
              <div style={{ color: '#334155', fontSize: 8, marginTop: 2 }}>
                {format(msg.timestamp, 'HH:mm:ss')}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

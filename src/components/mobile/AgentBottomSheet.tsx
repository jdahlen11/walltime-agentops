import { motion, AnimatePresence } from 'framer-motion'
import type { AgentView } from '../../lib/types'
import MobileAgentActivity from './MobileAgentActivity'

interface AgentBottomSheetProps {
  agent: AgentView | null
  onClose: () => void
}

export default function AgentBottomSheet({ agent, onClose }: AgentBottomSheetProps) {
  return (
    <AnimatePresence>
      {agent && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 90,
            }}
          />
          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 120) onClose()
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80vh',
              background: '#0F1419',
              borderRadius: '20px 20px 0 0',
              zIndex: 91,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag handle */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 0 4px',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.2)',
                }}
              />
            </div>
            {/* Content — activity log view replaces old AgentDetail */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MobileAgentActivity agent={agent} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState } from 'react'
import SessionSidebar from './SessionSidebar'
import ChatSection from './ChatSection'

function PanelIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.75" y="1.75" width="14.5" height="14.5" rx="2.75" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="6.5" y1="1.75" x2="6.5" y2="16.25" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default function ChatLayout({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(true)
  const toggle = () => setOpen(p => !p)

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

      {/* Sidebar */}
      <div
        className="shrink-0 overflow-hidden transition-all duration-200"
        style={{ width: open ? '280px' : '0px' }}
      >
        <SessionSidebar sessionId={sessionId} onToggle={toggle} />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Floating toggle when sidebar is closed */}
        {!open && (
          <button
            onClick={toggle}
            className="absolute top-3 left-3 z-10 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ color: '#6a7a60' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(184,137,42,0.1)'
              e.currentTarget.style.color = '#d4a84b'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#6a7a60'
            }}
            title="사이드바 열기"
          >
            <PanelIcon />
          </button>
        )}
        <ChatSection sessionId={sessionId} />
      </div>

    </div>
  )
}

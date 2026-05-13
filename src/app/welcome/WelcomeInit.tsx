'use client'

import { useEffect } from 'react'
import { markWelcomed } from './actions'

export default function WelcomeInit() {
  useEffect(() => {
    markWelcomed()
  }, [])
  return null
}

"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface TooltipState {
  content: ReactNode | null
  position: { x: number; y: number }
  visible: boolean
}

interface StatsTooltipContextType {
  tooltip: TooltipState
  showTooltip: (content: ReactNode, x: number, y: number) => void
  hideTooltip: () => void
}

const StatsTooltipContext = createContext<StatsTooltipContextType | undefined>(undefined)

export const StatsTooltipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    content: null,
    position: { x: 0, y: 0 },
    visible: false,
  })

  const showTooltip = (content: ReactNode, x: number, y: number) => {
    setTooltip({
      content,
      position: { x, y },
      visible: true,
    })
  }

  const hideTooltip = () => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }

  return (
    <StatsTooltipContext.Provider value={{ tooltip, showTooltip, hideTooltip }}>
      {children}
    </StatsTooltipContext.Provider>
  )
}

export const useStatsTooltip = () => {
  const context = useContext(StatsTooltipContext)
  if (!context) {
    // Fallback for components not wrapped in provider
    return {
      tooltip: { content: null, position: { x: 0, y: 0 }, visible: false },
      showTooltip: () => {},
      hideTooltip: () => {}
    }
  }
  return context
}
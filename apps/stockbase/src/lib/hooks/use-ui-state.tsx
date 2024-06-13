'use client'
import React, { ReactNode, useCallback, useState, createContext, useContext } from 'react'

const drawerWidth = 240
// Custom Hook for Drawer State
export function useDrawerState(): UiStateContextType {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const handleDrawerClose = useCallback(() => {
    setIsClosing(true)
    setMobileOpen(false)
  }, [])

  const handleDrawerTransitionEnd = useCallback(() => {
    setIsClosing(false)
  }, [])

  const handleDrawerToggle = useCallback(() => {
    if (!isClosing) {
      setMobileOpen((val) => !val)
    }
  }, [isClosing])

  return {
    mobileOpen,
    isClosing,
    handleDrawerClose,
    handleDrawerTransitionEnd,
    handleDrawerToggle,
    drawerWidth,
  }
}

export interface UiStateContextType {
  mobileOpen: boolean
  isClosing: boolean
  handleDrawerClose: () => void
  handleDrawerTransitionEnd: () => void
  handleDrawerToggle: () => void
  drawerWidth: number
}

// Create the context with a default value of undefined
export const UiStateContext = createContext<UiStateContextType | undefined>(undefined)

interface UiStateProviderProps {
  children: ReactNode
}

export function UiStateProvider({ children }: UiStateProviderProps): React.JSX.Element {
  const drawerState = useDrawerState()

  return <UiStateContext.Provider value={drawerState}>{children}</UiStateContext.Provider>
}

export const useUiStateContext = (): UiStateContextType => {
  const context = useContext(UiStateContext)
  if (context === undefined) {
    throw new Error('useUiStateContext must be used within a UiStateProvider')
  }
  return context
}

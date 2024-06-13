'use client'
import React, { useState } from 'react'
import './styles.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { StoreProvider } from './StoreProvider'
import theme from '../theme'
import SideNavigation from '../components/SideNavigation'
import { AppBar, Box, CssBaseline, IconButton, Toolbar, Typography } from '@mui/material'
import { MenuOutlined } from '@mui/icons-material'
import { UiStateProvider, useDrawerState, useUiStateContext } from '@/src/lib/hooks/use-ui-state'
import { MyAppBar } from '../components/AppBar'

export function MainContent({ children }: { children: React.ReactNode }): JSX.Element {
  // Example user data and authentication state
  const [isSignedIn, setIsSignedIn] = useState(false)
  const user = { firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' }

  // Theme toggle logic
  const [isDarkMode, setIsDarkMode] = useState(true)
  const customTheme = createTheme({
    ...theme,
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  })

  const toggleTheme = (): void => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <ThemeProvider theme={customTheme}>
      <html lang="en">
        <body>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <MyAppBar />
            <SideNavigation
              isSignedIn={isSignedIn}
              user={user}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
            />

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              {children}
            </Box>
          </Box>
        </body>
      </html>
    </ThemeProvider>
  )
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <UiStateProvider>
      <StoreProvider>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          {/* <ThemeProvider theme={customTheme}> */}
          <MainContent>{children}</MainContent>
          {/* </ThemeProvider> */}
        </AppRouterCacheProvider>
      </StoreProvider>
    </UiStateProvider>
  )
}
export default RootLayout

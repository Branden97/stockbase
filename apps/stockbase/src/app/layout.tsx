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
import { usePathname } from 'next/navigation'

export function MainContent({ children }: { children: React.ReactNode }): JSX.Element {
  // Example user data and authentication state
  const [isSignedIn, setIsSignedIn] = useState(false)
  const user = { firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' }

  const pathname = usePathname()
  const hideNavigation = pathname === '/login' || pathname === '/signup'

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
          <CssBaseline />
          {!hideNavigation && (
            <>
              <MyAppBar />
              <SideNavigation
                isSignedIn={isSignedIn}
                user={user}
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
              />
            </>
          )}

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: hideNavigation ? 0 : 3,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {!hideNavigation && <Toolbar />}
            {children}
          </Box>
        </body>
      </html>
    </ThemeProvider>
  )
}

type RootLayoutProps = {
  children: React.ReactNode
}

function RootLayout({ children }: RootLayoutProps): JSX.Element {
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

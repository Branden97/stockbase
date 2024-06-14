'use client'
import { Box, CssBaseline, Toolbar } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import * as navigation from 'next/navigation'
import React, { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { UiStateProvider } from '@/src/lib/hooks/use-ui-state'
import 'react-toastify/dist/ReactToastify.css'
import { MyAppBar } from '../components/AppBar'
import SideNavigation from '../components/SideNavigation'
import theme from '../theme'
import { StoreProvider } from './StoreProvider'
import './styles.css'

export function MainContent({ children }: { children: React.ReactNode }): JSX.Element {
  // Example user data and authentication state
  const [isSignedIn, setIsSignedIn] = useState(false)
  const user = { firstname: 'John', lastname: 'Doe', email: 'john.doe@example.com' }

  const pathname = navigation.usePathname()
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
          <ToastContainer limit={10} stacked theme={isDarkMode ? 'dark' : 'light'} />
          <CssBaseline />
          {!hideNavigation && (
            <>
              <MyAppBar />
              <SideNavigation
                isDarkMode={isDarkMode}
                isSignedIn={isSignedIn}
                toggleTheme={toggleTheme}
                user={user}
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

interface RootLayoutProps {
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

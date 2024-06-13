'use client'
import React, { useState } from 'react'
import './styles.css'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { StoreProvider } from './StoreProvider'
import theme from '../theme'
import SideNavigation from '../components/SideNavigation'
import { AppBar, Box, CssBaseline, Toolbar, Typography } from '@mui/material'

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <StoreProvider>
      <html lang="en">
      <body>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                <Typography variant="h6" noWrap component="div">
                  Clipped drawer
                </Typography>
              </Toolbar>
            </AppBar>
            <AppRouterCacheProvider options={{ enableCssLayer: true }}>
              <ThemeProvider theme={customTheme}>
                {/* <Box sx={{ display: 'flex', width: '500px' }}> */}
                  <SideNavigation
                    isSignedIn={isSignedIn}
                    user={user}
                    toggleTheme={toggleTheme}
                    isDarkMode={isDarkMode}
                  />
                {/* </Box> */}

                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                  <Toolbar />
                  {children}
                </Box>
              </ThemeProvider>
            </AppRouterCacheProvider>
          </Box>
        </body>
      </html>
    </StoreProvider>
  )
}

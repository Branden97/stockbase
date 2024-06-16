import React from 'react'
import { Box, Grid, Typography } from '@mui/material'

function LoginLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <Grid container style={{ height: '100vh' }}>
      <Grid
        item
        md={7}
        sm={4}
        style={{
          backgroundImage: 'url(/adam-smigielski-K5mPtONmpHM-unsplash.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        xs={false}
      />
      <Grid
        alignItems="center"
        component={Box}
        display="flex"
        flexDirection="column"
        item
        justifyContent="center"
        md={5}
        sm={8}
        xs={12}
      >
        <Box maxWidth={400} p={3} width="100%">
          <Typography variant="h4" component="h1" gutterBottom>
            Stockbase
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Login
          </Typography>
          {children}
        </Box>
      </Grid>
    </Grid>
  )
}

export default LoginLayout

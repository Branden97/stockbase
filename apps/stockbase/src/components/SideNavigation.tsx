/* eslint-disable react/function-component-definition -- ugh */
import React from 'react'
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Typography,
  Switch,
  Toolbar,
  Box,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SettingsIcon from '@mui/icons-material/Settings'
import SupportIcon from '@mui/icons-material/Support'
import LogoutIcon from '@mui/icons-material/Logout'
import { UiStateProvider, useDrawerState, useUiStateContext } from '@/src/lib/hooks/use-ui-state'

interface User {
  firstname: string
  lastname: string
  email: string
}

interface SideNavigationProps {
  isSignedIn: boolean
  user?: User
  toggleTheme: () => void
  isDarkMode: boolean
}

const SideNavigation: React.FC<SideNavigationProps> = ({
  isSignedIn,
  user,
  toggleTheme,
  isDarkMode,
}) => {
  const {
    mobileOpen,
    isClosing,
    handleDrawerClose,
    handleDrawerTransitionEnd,
    handleDrawerToggle,
    drawerWidth,
  } = useUiStateContext()
  const drawerContents = (
    <>
      <Toolbar />
      <List>
        <ListItem>
          <ListItemText primary="Light/Dark Mode" />
          <Switch checked={isDarkMode} onChange={toggleTheme} />
        </ListItem>
        <ListItem button>
          <HomeIcon />
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button>
          <AssessmentIcon />
          <ListItemText primary="Stocks" />
        </ListItem>
        <ListItem button>
          <ListAltIcon />
          <ListItemText primary="Watchlists" />
        </ListItem>
        <Divider />
        <ListItem button>
          <SupportIcon />
          <ListItemText primary="Support" />
        </ListItem>
        <ListItem button>
          <SettingsIcon />
          <ListItemText primary="Settings" />
        </ListItem>
        {!isSignedIn && (
          <ListItem>
            <Typography color="textSecondary" variant="body2">
              Sign up to access all features!
            </Typography>
          </ListItem>
        )}
        <Divider />
        {isSignedIn && user ? (
          <ListItem>
            <Avatar>
              {user.firstname[0]}
              {user.lastname[0]}
            </Avatar>
            <ListItemText primary={`${user.firstname} ${user.lastname}`} secondary={user.email} />
            <IconButton>
              <LogoutIcon />
            </IconButton>
          </ListItem>
        ) : null}
      </List>
    </>
  )
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onTransitionEnd={handleDrawerTransitionEnd}
        onClose={handleDrawerClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContents}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        {drawerContents}
      </Drawer>
    </Box>
  )
}

export default SideNavigation

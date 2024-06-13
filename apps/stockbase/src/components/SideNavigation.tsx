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
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import AssessmentIcon from '@mui/icons-material/Assessment'
import ListAltIcon from '@mui/icons-material/ListAlt'
import SettingsIcon from '@mui/icons-material/Settings'
import SupportIcon from '@mui/icons-material/Support'
import LogoutIcon from '@mui/icons-material/Logout'

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
const drawerWidth = 240
const SideNavigation: React.FC<SideNavigationProps> = ({
  isSignedIn,
  user,
  toggleTheme,
  isDarkMode,
}) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <List>
        <ListItem>
          <Typography variant="h6">Website Name</Typography>
        </ListItem>
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
    </Drawer>
  )
}

export default SideNavigation

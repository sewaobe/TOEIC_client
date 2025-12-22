import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

export default function NativeHumanLayout({ children }: Props) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white/80 to-indigo-50/60 flex flex-col overflow-y-auto">
            <AppBar position="static" color="inherit" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => setOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        Native Speaker Dashboard
                    </Typography>
                    <IconButton component={RouterLink} to="/profile" color="inherit" aria-label="profile">
                        <AccountCircleIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)}>
                    <List>
                        <ListItem component={RouterLink} to="/native/home">
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText primary="Home" />
                        </ListItem>
                        <ListItem component={RouterLink} to="/meet-room">
                            <ListItemIcon>
                                <CallIcon />
                            </ListItemIcon>
                            <ListItemText primary="Meet Room" />
                        </ListItem>
                        <ListItem component={RouterLink} to="/profile">
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flex: 1, minHeight: 0, maxHeight: "90vh" }} className="overflow-y-auto flex-1 no-scrollbar">
                {children}
            </Box>
        </div>
    );
}

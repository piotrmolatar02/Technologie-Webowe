import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import { useNavigate } from 'react-router-dom';

const pages = [];

function Navbar() {
   const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
   const navigate = useNavigate();

   const token = localStorage.getItem('token');
   const isLoggedIn = !!token;

   let isAdmin = false;
try {
  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    isAdmin = decoded.role === 'admin' || decoded.isAdmin === true;
  }
} catch (e) {
  isAdmin = false;
}

   const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
       setAnchorElNav(event.currentTarget);
   };

   const handleCloseNavMenu = () => {
       setAnchorElNav(null);
   };

   const handleLogout = () => {
       localStorage.removeItem('token');
       navigate('/login');
   };

   return (
       <AppBar position="static">
           <Container maxWidth={false} sx={{ backgroundColor: 'black' }}>
               <Toolbar disableGutters>
                   <Typography
                       variant="h6"
                       noWrap
                       sx={{
                           mr: 2,
                           display: { xs: 'none', md: 'flex' },
                           alignItems: 'center',
                           fontFamily: 'monospace',
                           fontWeight: 700,
                           letterSpacing: '.3rem',
                           color: 'inherit',
                           textDecoration: 'none',
                       }}
                   >
                       <LanguageIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                       IoT Dashboard
                   </Typography>

                   <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                       <IconButton
                           size="large"
                           aria-label="account of current user"
                           aria-controls="menu-appbar"
                           aria-haspopup="true"
                           onClick={handleOpenNavMenu}
                           color="inherit"
                       >
                           <MenuIcon />
                       </IconButton>
                       <Menu
                           id="menu-appbar"
                           anchorEl={anchorElNav}
                           anchorOrigin={{
                               vertical: 'bottom',
                               horizontal: 'left',
                           }}
                           keepMounted
                           transformOrigin={{
                               vertical: 'top',
                               horizontal: 'left',
                           }}
                           open={Boolean(anchorElNav)}
                           onClose={handleCloseNavMenu}
                           sx={{
                               display: { xs: 'block', md: 'none' },
                           }}
                       >
                           {pages.map((page) => (
                               <MenuItem key={page} onClick={handleCloseNavMenu}>
                                   <Typography textAlign="center">{page}</Typography>
                               </MenuItem>
                           ))}
                       </Menu>
                   </Box>
                   <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                       {pages.map((page) => (
                           <Button
                               key={page}
                               onClick={handleCloseNavMenu}
                               sx={{ my: 2, color: 'white', display: 'block' }}
                           >
                               {page}
                           </Button>
                       ))}
                   </Box>

                   <Box sx={{ flexGrow: 0 }}>
                       {!isLoggedIn && (
                           <>
                               <Button color="inherit" onClick={() => navigate('/login')}>
                                   Zaloguj
                               </Button>
                               <Button color="inherit" onClick={() => navigate('/register')}>
                                   Zarejestruj
                               </Button>
                           </>
                       )}
                       {isLoggedIn && isAdmin && (
                            <Button color="inherit" onClick={() => navigate('/admin')}>
                                Panel admina
                            </Button>
                        )}
                       {isLoggedIn && (
                           <Button color="inherit" onClick={handleLogout}>
                               Wyloguj
                           </Button>
                       )}
                   </Box>
               </Toolbar>
           </Container>
       </AppBar>
   );
}

export default Navbar;

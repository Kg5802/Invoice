import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  useMediaQuery,
} from "@mui/material";
import { Description, Logout } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const open = Boolean(anchorEl);

  const isMobile = useMediaQuery("(max-width:600px)");

  const checkUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, [location]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("company");
    localStorage.removeItem("user");
    setUser(null);
    handleClose();
    navigate("/");
  };

  // Header when user is NOT logged in
  if (!user) {
    return (
      <Box component="header">
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontWeight: 600,
            }}
          >
            <Description />
            InvoiceApp
          </Typography>
        </Box>
        <Divider />
      </Box>
    );
  }

  return (
    <Box component="header">
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        {/* Center Logo */}
        <Typography
          variant="h5"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 600,
          }}
        >
          <Description />
          InvoiceApp
        </Typography>

        {/* User Profile */}
        <Box
          onClick={handleClick}
          sx={{
            position: "absolute",
            right: 24,
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
          }}
        >
          <IconButton size="small">
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "black",
              }}
            >
              {user.firstName?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>

          {/* ✅ Hide name on mobile */}
          {!isMobile && (
            <Typography variant="body2" fontWeight={500} color="text.secondary">
              {user.firstName} {user.lastName}
            </Typography>
          )}
        </Box>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Box>
              <Typography variant="subtitle2">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <Logout fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>

      <Divider />
    </Box>
  );
}

export default Header;

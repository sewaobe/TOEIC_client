import { useState } from "react";
import { motion } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  Stack,
} from "@mui/material";
import DiamondIcon from "@mui/icons-material/Diamond";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../stores/store";
import { logout } from "../../stores/userSlice";
import authService from "../../services/authService";
import NotificationDropdown from "./NotificationDropdown";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Chương trình học", href: "/programs" },
  { label: "Đề thi online", href: "/tests" },
  { label: "Flash Card", href: "/flash-cards" },
  { label: "Luyện kỹ năng", href: "/practice-skill" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    handleMenuClose();
    navigate("/login");
  };

  const handleNavigate = (href: string, label: string) => {
    // Nếu là Trang chủ, tùy trạng thái login
    if (label === "Trang chủ") {
      navigate(user ? "/home" : "/");
    } else {
      navigate(href);
    }
  };

  // Kiểm tra xem có đang ở trang này không
  const isActive = (href: string, label: string) => {
    if (label === "Trang chủ") {
      // Trang chủ chỉ highlight khi ở /home, không highlight ở landing page (/)
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar className="flex justify-between">
          {/* Logo + tên website */}
          <div className="flex items-center gap-2 select-none">
            {/* 🎓 Icon động */}
            <motion.div
              initial={{ y: 0, rotate: 0 }}
              animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
              transition={{
                duration: 2.4,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 2,
              }}
              whileHover={{ rotate: -15, scale: 1.1 }}
              className="text-blue-600"
            >
              <SchoolIcon sx={{ fontSize: 36 }} />
            </motion.div>

            {/* 🌈 Chữ gradient */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(90deg, #2563eb, #06b6d4, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: 0.3,
              }}
            >
              TOEIC Smart
            </Typography>
          </div>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const active = isActive(item.href, item.label);
              return (
                <Button
                  key={item.label}
                  onClick={() => handleNavigate(item.href, item.label)}
                  sx={{
                    color: active
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    textTransform: "none",
                    fontWeight: active ? 700 : 600,
                    position: "relative",
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                    "&::after": active
                      ? {
                          content: '""',
                          position: "absolute",
                          bottom: 0,
                          left: "10%",
                          width: "80%",
                          height: "3px",
                          borderRadius: "3px 3px 0 0",
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }
                      : {},
                  }}
                >
                  {item.label}
                </Button>
              );
            })}

            {user && <NotificationDropdown />}
            {user ? (
              <Stack direction="row" alignItems="center">
                <Button
                  onClick={() => {
                    navigate("/credit");
                  }}
                  endIcon={<DiamondIcon />}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "linear-gradient(90deg, #7F00FF, #00D4FF)",
                    "&:hover": { opacity: 0.9 },
                  }}
                >
                  {0}
                </Button>
                <IconButton onClick={handleAvatarClick}>
                  <Avatar
                    src={user.profile.avatar}
                    alt={user.profile.fullname}
                    sx={{ bgcolor: theme.palette.primary.main }}
                  >
                    {!user.profile.avatar &&
                      user.profile.fullname?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  disableScrollLock
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right", // canh trái avatar
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right", // bung từ góc trái
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleMenuClose();
                    }}
                  >
                    Trang cá nhân
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/result-statistic");
                      handleMenuClose();
                    }}
                  >
                    Thống kê kết quả
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
                </Menu>
              </Stack>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  px: 3,
                }}
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Mobile menu icon */}
          <div className="md:hidden">
            <IconButton onClick={handleDrawerToggle}>
              <MenuIcon sx={{ color: theme.palette.text.primary }} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* Drawer (Mobile) */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          className="flex flex-col gap-4 p-6 w-64"
          role="presentation"
          onClick={handleDrawerToggle}
          sx={{ backgroundColor: theme.palette.background.paper }}
        >
          {user ? (
            <Box className="flex items-center gap-3 px-2">
              <Avatar
                src={user.profile.avatar}
                alt={user.profile.fullname}
                sx={{ bgcolor: theme.palette.primary.main }}
              >
                {!user.profile.avatar &&
                  user.profile.fullname?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography>{user.profile.fullname}</Typography>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: "bold",
                borderRadius: "20px",
              }}
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
          )}
          {user && (
            <Box sx={{ pl: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                Thông báo
              </Typography>
              <NotificationDropdown />
            </Box>
          )}

          {navLinks.map((item) => {
            const active = isActive(item.href, item.label);
            return (
              <Button
                key={item.label}
                onClick={() => handleNavigate(item.href, item.label)}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  textTransform: "none",
                  fontWeight: active ? 700 : 600,
                  bgcolor: active
                    ? `${theme.palette.primary.main}15`
                    : "transparent",
                  borderLeft: active
                    ? `4px solid ${theme.palette.primary.main}`
                    : "none",
                  "&:hover": {
                    color: theme.palette.primary.main,
                    bgcolor: `${theme.palette.primary.main}10`,
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Drawer>
    </>
  );
}

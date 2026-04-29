import { useEffect, useState } from "react";
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
import LockIcon from "@mui/icons-material/Lock";
import authService from "../../services/authService";

interface NavLink {
    label: string;
    href: string;
}

type User = {
    profile?: {
        avatar?: string;
        fullname?: string;
    };
};

const navLinks: NavLink[] = [
    { label: "Trang chủ", href: "/" },
    { label: "Chương trình học", href: "/programs" },
    { label: "Đề thi online", href: "/tests" },
    { label: "Flash Card", href: "/flash-cards" },
    { label: "Luyện kỹ năng", href: "/practice-skill" },
];

export default function LandingNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [user, setUser] = useState<User | null>(null);
    const theme = useTheme();

    const pathname = window.location.pathname;

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
        setUser(null);
        handleMenuClose();
        window.location.href = "/login";
    };

    const handleNavigate = (href: string, label: string) => {
        if (label === "Trang chủ") {
            window.location.href = user ? "/home" : "/";
            return;
        }
        window.location.href = href;
    };

    const isActive = (href: string, label: string) => {
        if (label === "Trang chủ") {
            return pathname === "/home";
        }
        return pathname.startsWith(href);
    };

    useEffect(() => {
        let done = false;

        const scrollEl = document.querySelector(".custom-scrollbar");

        const cleanup = () => {
            scrollEl?.removeEventListener("scroll", onTrigger);
            window.removeEventListener("click", onTrigger);
            window.removeEventListener("touchstart", onTrigger);
            window.removeEventListener("keydown", onTrigger);
        };

        const fetchUser = async () => {
            if (done) return;
            done = true;
            cleanup();
            try {
                const svc = await import("../../services/user.service");
                const res = await svc.default.getProfile();
                setUser(res.user);
            } catch {
                // not logged in
            }
        };

        const onTrigger = () => {
            void fetchUser();
        };

        scrollEl?.addEventListener("scroll", onTrigger, { passive: true });
        window.addEventListener("click", onTrigger, { passive: true });
        window.addEventListener("touchstart", onTrigger, { passive: true });
        window.addEventListener("keydown", onTrigger);

        return cleanup;
    }, []);

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
                    <div className="flex items-center gap-2 select-none">
                        <div className="text-blue-600 animate-school-icon hover:rotate-[-15deg] hover:scale-110 transition-transform duration-300">
                            <SchoolIcon className="text-[36px]" />
                        </div>
                        <Typography
                            variant="h6"
                            component="div"
                            className="font-bold bg-gradient-to-r from-blue-600 via-cyan-500 to-orange-500 bg-clip-text text-transparent tracking-[0.3px]"
                        >
                            TOEIC Smart
                        </Typography>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((item) => {
                            const active = isActive(item.href, item.label);
                            const isLocked = item.href === "/programs" && import.meta.env.PROD;

                            return (
                                <Button
                                    key={item.label}
                                    onClick={() => !isLocked && handleNavigate(item.href, item.label)}
                                    disabled={isLocked}
                                    sx={{
                                        color: active
                                            ? theme.palette.primary.main
                                            : theme.palette.text.primary,
                                        textTransform: "none",
                                        fontWeight: active ? 700 : 600,
                                        position: "relative",
                                        opacity: isLocked ? 0.6 : 1,
                                        cursor: isLocked ? "not-allowed" : "pointer",
                                        "&:hover": {
                                            color: isLocked ? "inherit" : theme.palette.primary.main,
                                        },
                                        "&::after": active && !isLocked
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
                                    {isLocked && (
                                        <LockIcon
                                            sx={{
                                                fontSize: "14px",
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                color: "gray",
                                            }}
                                        />
                                    )}
                                </Button>
                            );
                        })}

                        {user ? (
                            <Stack direction="row" alignItems="center">
                                <Button
                                    onClick={() => handleNavigate("/credit", "credit")}
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
                                        src={user.profile?.avatar}
                                        alt={user.profile?.fullname}
                                        sx={{ bgcolor: theme.palette.primary.main }}
                                    >
                                        {!user.profile?.avatar &&
                                            user.profile?.fullname?.charAt(0).toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    disableScrollLock
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    transformOrigin={{
                                        vertical: "top",
                                        horizontal: "right",
                                    }}
                                >
                                    <MenuItem
                                        onClick={() => {
                                            handleNavigate("/profile", "profile");
                                            handleMenuClose();
                                        }}
                                    >
                                        Trang cá nhân
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {
                                            handleNavigate("/result-statistic", "result-statistic");
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
                                onClick={() => handleNavigate("/login", "login")}
                            >
                                Đăng nhập
                            </Button>
                        )}
                    </div>

                    <div className="md:hidden">
                        <IconButton onClick={handleDrawerToggle}>
                            <MenuIcon sx={{ color: theme.palette.text.primary }} />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
                <Box
                    className="flex flex-col gap-4 p-6 w-64"
                    role="presentation"
                    onClick={handleDrawerToggle}
                    sx={{ backgroundColor: theme.palette.background.paper }}
                >
                    {user ? (
                        <Box className="flex items-center gap-3 px-2">
                            <Avatar
                                src={user.profile?.avatar}
                                alt={user.profile?.fullname}
                                sx={{ bgcolor: theme.palette.primary.main }}
                            >
                                {!user.profile?.avatar &&
                                    user.profile?.fullname?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography>{user.profile?.fullname}</Typography>
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
                            onClick={() => handleNavigate("/login", "login")}
                        >
                            Đăng nhập
                        </Button>
                    )}

                    {navLinks.map((item: NavLink) => {
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
import { createTheme } from '@mui/material/styles';

// Light Theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563EB', // Xanh Dương TOEIC
    },
    secondary: {
      main: '#F97316', // Cam Năng Lượng
    },
    success: {
      main: '#10B981', // Xanh Ngọc Tươi
    },
    background: {
      default: '#F9FAFB', // Nền sáng
      paper: '#FFFFFF', // Card / section
    },
    text: {
      primary: '#111827', // Đen đậm
      secondary: '#6B7280', // Xám phụ
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    button: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 },
  },
});

// Dark Theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60A5FA', // Xanh dương sáng hơn cho dark mode
    },
    secondary: {
      main: '#F59E0B', // Cam sáng
    },
    success: {
      main: '#34D399', // Xanh ngọc sáng
    },
    background: {
      default: '#111827', // Nền tối
      paper: '#1F2937', // Card tối
    },
    text: {
      primary: '#F9FAFB', // Trắng chính
      secondary: '#9CA3AF', // Xám sáng
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Montserrat, sans-serif', fontWeight: 700 },
    button: { fontFamily: 'Montserrat, sans-serif', fontWeight: 600 },
  },
});

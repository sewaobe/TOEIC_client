import { ReactNode, useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { lightTheme, darkTheme } from './theme';

interface Props {
  children: ReactNode;
}

export default function ThemeProviderWrapper({ children }: Props) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />

      {/* <div className='fixed top-4 right-4 flex items-center pt-32'>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color='primary'
            />
          }
          label={darkMode ? 'Dark' : 'Light'}
        />
      </div> */}

      {children}
    </ThemeProvider>
  );
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, lightTheme, darkTheme } from '@rainbow-me/rainbowkit';
import { config } from './wagmi.config';
import { ThemeProvider } from './contexts/ThemeContext';
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

const queryClient = new QueryClient();

const RainbowKitThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setCurrentTheme(savedTheme);

    const observer = new MutationObserver(() => {
      const theme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      if (theme) setCurrentTheme(theme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  const rainbowTheme = currentTheme === 'light'
    ? lightTheme({
        accentColor: '#0F766E',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
      })
    : darkTheme({
        accentColor: '#14B8A6',
        accentColorForeground: 'white',
        borderRadius: 'medium',
        fontStack: 'system',
      });

  return (
    <RainbowKitProvider theme={rainbowTheme}>
      {children}
    </RainbowKitProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitThemeWrapper>
            <App />
          </RainbowKitThemeWrapper>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>
);

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, baseSepolia, mainnet } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Estable.lat',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [
    base,
    baseSepolia,
    ...(import.meta.env.DEV ? [mainnet] : []),
  ],
  ssr: false,
});

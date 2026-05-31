import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import { ThemeProvider } from '@/components/theme-provider';
import { StoreProvider } from '@/store/store-provider';
import { AuthProvider } from '@/context/AuthContext';
import { TransitionProgressBar } from '@/components/TransitionProgressBar';
import RealTimeJobListener from '@/components/RealTimeJobListener';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Nexus Frontend',
  description: 'An AI-powered platform for contact intelligence, agent orchestration, and workflow automation.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <TransitionProgressBar />
              <RealTimeJobListener />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

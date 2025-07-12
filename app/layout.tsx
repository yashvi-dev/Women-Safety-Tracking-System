import { AuthProvider } from '@/contexts/auth-context';
import { SOSProvider } from '@/contexts/sos-context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata = {
  title: 'Women Safety Tracking System',
  description: 'A real-time safety tracking system for women'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SOSProvider>
              {children}
              <Toaster />
            </SOSProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
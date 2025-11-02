'use client';

import { useTheme } from '@/lib/hooks/useTheme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme(); // 应用主题

  return <>{children}</>;
}


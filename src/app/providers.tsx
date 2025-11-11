'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { medicalCyan, slate, mint, rose } from '@/theme/medicalPalette';

const theme = createTheme({
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  },
  radius: {
    xs: '6px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },
  spacing: {
    xs: '6px',
    sm: '10px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  colors: {
    medicalCyan,
    slate,
    mint,
    rose,
  },
  primaryColor: 'medicalCyan',
  primaryShade: { light: 6, dark: 5 },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    Card: {
      styles: {
        root: {
          border: '1px solid rgba(2, 55, 65, 0.08)',
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          borderRadius: '12px',
        },
      },
    },
  },
});

export function ThemeProviders({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}

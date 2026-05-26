/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#17201A',
    background: '#F8FAF8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF7F1',
    textSecondary: '#66736B',
    accent: '#94D7A8',
    accentSoft: '#DFF4E5',
    border: '#E2E8E2',
    successSoft: '#DFF4E5',
    successText: '#25623A',
    warningSoft: '#FEF3C7',
    warningText: '#92400E',
  },
  dark: {
    text: '#F2F7F3',
    background: '#101411',
    backgroundElement: '#181D19',
    backgroundSelected: '#203025',
    textSecondary: '#A8B3AB',
    accent: '#94D7A8',
    accentSoft: '#183424',
    border: '#2A342D',
    successSoft: '#183424',
    successText: '#AEEBC0',
    warningSoft: '#3C2F12',
    warningText: '#F7D774',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A2B2F',
    background: '#F5F1EA',
    backgroundElement: '#EEE9E1',
    backgroundSelected: '#E7DED2',
    textSecondary: '#7B746A',
    accent: '#AA4D2E',
    accentSoft: '#F2D5C8',
    border: '#DED5C9',
    successSoft: '#DCEBC9',
    successText: '#5B7740',
    warningSoft: '#F5D4C4',
    warningText: '#9C4D30',
  },
  dark: {
    text: '#F8F3EC',
    background: '#181513',
    backgroundElement: '#26211E',
    backgroundSelected: '#332C27',
    textSecondary: '#B5AA9E',
    accent: '#D88358',
    accentSoft: '#553526',
    border: '#403731',
    successSoft: '#31402B',
    successText: '#C8DEB0',
    warningSoft: '#4A2E23',
    warningText: '#F4C0A6',
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

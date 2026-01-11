import { useContext } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { ThemeContext } from '../src/context/ThemeContext';

export function useColorScheme() {
  const ctx = useContext(ThemeContext);
  const system = useRNColorScheme();
  if (ctx) {
    return ctx.mode === 'system' ? (system ?? 'light') : ctx.mode;
  }
  return system;
}

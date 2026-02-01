import { View, StyleSheet, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Flatten style to avoid React 19 + react-native-web compatibility issues
  const flattenedStyle = StyleSheet.flatten(style as StyleProp<ViewStyle>) || {};
  
  return <View style={{ backgroundColor, ...flattenedStyle }} {...otherProps} />;
}

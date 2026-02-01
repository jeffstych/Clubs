import { StyleSheet, Text, type TextProps, type StyleProp, type TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Get the base style for the type
  const getTypeStyle = (): TextStyle => {
    switch (type) {
      case 'title': return styles.title;
      case 'defaultSemiBold': return styles.defaultSemiBold;
      case 'subtitle': return styles.subtitle;
      case 'link': return styles.link;
      default: return styles.default;
    }
  };

  // Flatten style to avoid React 19 + react-native-web compatibility issues
  const flattenedStyle = StyleSheet.flatten(style as StyleProp<TextStyle>) || {};
  const baseStyle = getTypeStyle();

  return (
    <Text
      style={{ color, ...baseStyle, ...flattenedStyle }}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme, isDark } = useTheme();

  const getBg = () => {
    if (disabled) return isDark ? '#1E293B' : '#E2E8F0';
    switch (variant) {
      case 'primary':  return theme.primary;
      case 'secondary': return isDark ? '#1C3147' : theme.primaryLight || '#E6F7F4';
      case 'outline':  return 'transparent';
      case 'danger':   return theme.danger;
      case 'success':  return theme.success;
      default:         return theme.primary;
    }
  };

  const getBorder = () => {
    if (disabled) return isDark ? '#2D3748' : '#CBD5E1';
    if (variant === 'outline') return theme.primary;
    if (variant === 'secondary') return isDark ? '#1E4060' : '#B2EBF2';
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    switch (variant) {
      case 'outline':   return theme.primary;
      case 'secondary': return isDark ? theme.primary : '#0D6E5B';
      default:          return '#FFFFFF';
    }
  };

  const paddingV = size === 'small' ? 8 : size === 'large' ? 15 : 13;
  const paddingH = size === 'small' ? 14 : size === 'large' ? 24 : 18;
  const minH     = size === 'small' ? 38  : size === 'large' ? 52  : 48;
  const fontSize = size === 'small'
    ? Typography.fontSizes.sm
    : size === 'large'
    ? Typography.fontSizes.md + 1
    : Typography.fontSizes.base + 1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBg(),
          borderColor: getBorder(),
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1.5 : 0,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          minHeight: minH,
          elevation: disabled ? 0 : variant === 'primary' ? 3 : variant === 'danger' ? 2 : 0,
          shadowColor: variant === 'primary' ? theme.primary : '#000',
          shadowOpacity: disabled ? 0 : variant === 'primary' ? 0.22 : 0,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 6,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? theme.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            {
              color: getTextColor(),
              fontSize,
              fontWeight: size === 'large' ? Typography.fontWeights.bold : Typography.fontWeights.semibold,
            },
            textStyle,
          ]}>
          {icon ? `${icon} ` : ''}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textBase: {
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

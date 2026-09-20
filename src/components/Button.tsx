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

import { Colors, Radius, Typography } from '../theme/theme';

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
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.primary : Colors.textWhite}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.textBase,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            disabled && styles.textDisabled,
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
  primary: {
    backgroundColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: '#B2EBF2',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  success: {
    backgroundColor: Colors.success,
  },
  disabled: {
    backgroundColor: Colors.border,
    borderColor: Colors.borderLight,
    elevation: 0,
    shadowOpacity: 0,
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
  },
  size_medium: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    minHeight: 48,
  },
  size_large: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    minHeight: 52,
  },
  textBase: {
    fontWeight: Typography.fontWeights.semibold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  text_primary: {
    color: Colors.textWhite,
  },
  text_secondary: {
    color: Colors.primaryDark,
  },
  text_outline: {
    color: Colors.primary,
  },
  text_danger: {
    color: Colors.textWhite,
  },
  text_success: {
    color: Colors.textWhite,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  textSize_small: {
    fontSize: Typography.fontSizes.sm,
  },
  textSize_medium: {
    fontSize: Typography.fontSizes.base + 1,
  },
  textSize_large: {
    fontSize: Typography.fontSizes.md + 1,
    fontWeight: Typography.fontWeights.bold,
  },
});

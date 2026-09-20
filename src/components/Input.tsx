import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Radius, Typography } from '../theme/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const InputComponent = React.forwardRef<React.ComponentRef<typeof TextInput>, InputProps>((
  {
    label,
    error,
    hint,
    containerStyle,
    inputStyle,
    leftIcon,
    rightIcon,
    onRightIconPress,
    onFocus,
    onBlur,
    multiline,
    style,
    autoCorrect = false,
    spellCheck = false,
    ...rest
  },
  ref
) => {
  const { theme, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const formattedValue = rest.value !== undefined ? String(rest.value) : undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text> : null}
      <View
        collapsable={false}
        style={[
          styles.inputWrapper,
          multiline && styles.inputWrapperMultiline,
          {
            backgroundColor: isDark ? theme.card : theme.inputBg,
            borderColor: error ? theme.danger : isFocused ? theme.borderFocus : theme.border,
          },
        ]}>
        {leftIcon ? (
          typeof leftIcon === 'string' ? (
            <Text style={styles.icon}>{leftIcon}</Text>
          ) : (
            <View style={styles.iconContainer}>{leftIcon}</View>
          )
        ) : null}

        <TextInput
          {...rest}
          ref={ref}
          value={formattedValue}
          autoCorrect={autoCorrect}
          spellCheck={spellCheck}
          multiline={multiline}
          placeholderTextColor={theme.textMuted}
          underlineColorAndroid="transparent"
          textAlignVertical={multiline ? 'top' : 'center'}
          blurOnSubmit={multiline ? false : rest.blurOnSubmit}
          style={[
            styles.input,
            multiline ? styles.inputMultiline : styles.inputSingle,
            { color: theme.textPrimary },
            inputStyle,
            style,
          ]}
          onFocus={e => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />

        {rightIcon ? (
          <TouchableOpacity
            disabled={!onRightIconPress}
            onPress={onRightIconPress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.rightIconContainer}>
            {typeof rightIcon === 'string' ? (
              <Text style={[styles.rightIconText, { color: theme.textSecondary }]}>{rightIcon}</Text>
            ) : (
              rightIcon
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hintText, { color: theme.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

InputComponent.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: Radius.md + 2,
    paddingHorizontal: 14,
    height: 50,
  },
  inputWrapperMultiline: {
    height: undefined,
    minHeight: 50,
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 16,
    marginRight: 10,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconText: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    margin: 0,
    paddingHorizontal: 0,
  },
  inputSingle: {
    height: 48,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  inputMultiline: {
    minHeight: 48,
    paddingTop: 8,
  },
  errorText: {
    fontSize: Typography.fontSizes.xs + 1,
    marginTop: 4,
    fontWeight: Typography.fontWeights.medium,
  },
  hintText: {
    fontSize: Typography.fontSizes.xs + 1,
    marginTop: 4,
  },
});

export const Input = React.memo(InputComponent);

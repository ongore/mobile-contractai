import React, {useState, ReactNode} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {colors} from '@/theme/colors';
import {spacing, borderRadius} from '@/theme/spacing';
import {fontSize, fontWeight} from '@/theme/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required,
  multiline,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);

  const inputContainerStyles = [
    styles.inputContainer,
    focused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    multiline && styles.inputContainerMultiline,
  ];

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={inputContainerStyles}>
        {leftIcon != null && (
          <View style={styles.leftIconWrapper}>{leftIcon}</View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : null,
            rightIcon ? styles.inputWithRight : null,
            multiline && styles.inputMultiline,
          ]}
          placeholderTextColor={colors.muted}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          onFocus={e => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />

        {rightIcon != null && (
          <TouchableOpacity
            style={styles.rightIconWrapper}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[2],
  },
  label: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  required: {
    color: colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.background.primary,
  },
  inputContainerError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  input: {
    flex: 1,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    fontSize: fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  inputWithLeft: {
    paddingLeft: spacing[1],
  },
  inputWithRight: {
    paddingRight: spacing[1],
  },
  inputMultiline: {
    paddingTop: spacing[3],
    minHeight: 80,
  },
  leftIconWrapper: {
    paddingLeft: spacing[4],
    paddingRight: spacing[1],
  },
  rightIconWrapper: {
    paddingRight: spacing[4],
    paddingLeft: spacing[1],
  },
  error: {
    color: colors.danger,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  hint: {
    color: colors.muted,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});

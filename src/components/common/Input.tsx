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
          placeholderTextColor={colors.text.muted}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'auto'}
          selectionColor={colors.accent}
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
    color: '#8C8C8C',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.1,
  },
  required: {
    color: colors.text.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2DED8',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: '#FF5C28',
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFFFFF',
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
    color: '#111111',
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
    color: colors.text.danger,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  hint: {
    color: colors.text.muted,
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
});

import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  style,
  ...textInputProps
}: InputProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container]}>
      {label && (
        <Text style={[styles.label, { color: theme.textPrimary }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundTertiary,
            color: theme.textPrimary,
            borderColor: error ? theme.error : theme.border,
          },
          textInputProps.multiline && styles.multiline,
        ]}
        placeholderTextColor={theme.textMuted}
        {...textInputProps}
      />
      {error && (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      )}
      {helperText && !error && (
        <Text style={[styles.helperText, { color: theme.textMuted }]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  multiline: {
    height: 80,
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  helperText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});

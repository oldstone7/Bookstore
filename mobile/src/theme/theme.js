import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

const shadows = {
  small: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  shadows,

  // Common components
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.lg,
    ...shadows.small, // ✅ use the variable, not "this"
  },

  button: {
    primary: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.buttonPadding,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadiusMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: colors.secondary,
      paddingVertical: spacing.buttonPadding,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadiusMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      paddingVertical: spacing.buttonPadding,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.borderRadiusMd,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: spacing.borderRadiusMd,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
};

export default theme;

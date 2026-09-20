// ==============================================================================
// CoJourney Design System & Theme Tokens
// Matches Light & Dark reference designs (Teal / Cyan + Deep Navy / Slate)
// ==============================================================================

export interface ThemeColors {
  // Brand
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryUltraLight: string;
  accentCyan: string;

  // Background & Surfaces
  background: string;
  surface: string;
  card: string;
  inputBg: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textWhite: string;
  textTeal: string;

  // Borders
  border: string;
  borderLight: string;
  borderFocus: string;
  cardBorder: string;

  // Status & Feedback
  success: string;
  successLight: string;
  successText: string;
  warning: string;
  warningLight: string;
  warningText: string;
  danger: string;
  dangerLight: string;
  dangerText: string;
  info: string;
  infoLight: string;

  // Cooperation Modes
  walkGreen: string;
  walkBg: string;
  walkBorder: string;
  carryOrange: string;
  carryBg: string;
  carryBorder: string;
  shareVehicleBlue: string;
  shareVehicleBg: string;
  shareVehicleBorder: string;
  joinJourneyPurple: string;
  joinJourneyBg: string;
  joinJourneyBorder: string;

  // Navigation / Header
  headerBg: string;
  tabBarBg: string;
  tabBarBorder: string;
}

export const lightColors: ThemeColors = {
  primary: '#00A884',
  primaryDark: '#00897B',
  primaryLight: '#E6F7F4',
  primaryUltraLight: '#F2FBF9',
  accentCyan: '#00BFA5',

  background: '#FFFFFF',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  inputBg: '#F1F5F9',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
  textTeal: '#00A884',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#00A884',
  cardBorder: '#E2E8F0',

  success: '#10B981',
  successLight: '#DCFCE7',
  successText: '#15803D',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningText: '#B45309',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  dangerText: '#B91C1C',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  walkGreen: '#10B981',
  walkBg: '#E6F9F0',
  walkBorder: '#A7F3D0',
  carryOrange: '#F59E0B',
  carryBg: '#FEF6E7',
  carryBorder: '#FDE68A',
  shareVehicleBlue: '#0284C7',
  shareVehicleBg: '#EBF6FC',
  shareVehicleBorder: '#BAE6FD',
  joinJourneyPurple: '#8B5CF6',
  joinJourneyBg: '#F5F0FE',
  joinJourneyBorder: '#DDD6FE',

  headerBg: '#FFFFFF',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
};

export const darkColors: ThemeColors = {
  primary: '#00A884',
  primaryDark: '#00897B',
  primaryLight: '#102E28',
  primaryUltraLight: '#0D2420',
  accentCyan: '#00BFA5',

  background: '#0B1522',
  surface: '#101E30',
  card: '#132235',
  inputBg: '#182B42',

  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textWhite: '#FFFFFF',
  textTeal: '#00BFA5',

  border: '#1E324D',
  borderLight: '#16263B',
  borderFocus: '#00BFA5',
  cardBorder: '#1E324D',

  success: '#10B981',
  successLight: '#064E3B',
  successText: '#34D399',
  warning: '#F59E0B',
  warningLight: '#78350F',
  warningText: '#FBBF24',
  danger: '#EF4444',
  dangerLight: '#7F1D1D',
  dangerText: '#F87171',
  info: '#38BDF8',
  infoLight: '#0C4A6E',

  walkGreen: '#34D399',
  walkBg: '#0F2922',
  walkBorder: '#065F46',
  carryOrange: '#FBBF24',
  carryBg: '#2A2012',
  carryBorder: '#92400E',
  shareVehicleBlue: '#38BDF8',
  shareVehicleBg: '#11293F',
  shareVehicleBorder: '#075985',
  joinJourneyPurple: '#A78BFA',
  joinJourneyBg: '#24193D',
  joinJourneyBorder: '#5B21B6',

  headerBg: '#0B1522',
  tabBarBg: '#0B1522',
  tabBarBorder: '#1E324D',
};

// Default export alias for backward compatibility with static styles
export const Colors = {
  ...lightColors,
  navy: '#0B1522',
  navyCard: '#132235',
  navyBorder: '#1E324D',
  dark: '#0F172A',
  darkSurface: '#1E293B',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  fontWeights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const Shadows = {
  soft: {
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  card: {
    elevation: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  elevated: {
    elevation: 6,
    shadowColor: '#00A884',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
};

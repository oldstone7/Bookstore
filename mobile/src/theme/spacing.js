// Base unit is 4px
const baseUnit = 4;

export const spacing = {
  // Multiples of base unit
  xs: baseUnit * 1,  // 4px
  sm: baseUnit * 2,  // 8px
  md: baseUnit * 3,  // 12px
  lg: baseUnit * 4,  // 16px
  xl: baseUnit * 5,  // 20px
  '2xl': baseUnit * 6,  // 24px
  '3xl': baseUnit * 8,  // 32px
  '4xl': baseUnit * 10, // 40px
  '5xl': baseUnit * 12, // 48px
  '6xl': baseUnit * 16, // 64px
  
  // Common spacing
  screenPadding: baseUnit * 4, // 16px
  cardPadding: baseUnit * 3,   // 12px
  inputPadding: baseUnit * 3,  // 12px
  buttonPadding: baseUnit * 2, // 8px
  
  // Border radius
  borderRadiusSm: baseUnit,    // 4px
  borderRadiusMd: baseUnit * 2, // 8px
  borderRadiusLg: baseUnit * 3, // 12px
  borderRadiusXl: baseUnit * 4, // 16px
  
  // Icons
  iconSizeSm: baseUnit * 4,    // 16px
  iconSizeMd: baseUnit * 5,    // 20px
  iconSizeLg: baseUnit * 6,    // 24px
  
  // Helper function to calculate custom spacing
  get: (multiplier) => baseUnit * multiplier,
};

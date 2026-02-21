import { Dimensions, Platform } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PHONE_BASE = 375;
const TABLET_BREAKPOINT = 600;

export const isTablet = SCREEN_WIDTH >= TABLET_BREAKPOINT;

export const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / PHONE_BASE;
  if (isTablet) {
    return Math.round(size * Math.min(ratio, 1.6));
  }
  return Math.round(size * Math.min(ratio, 1.15));
};

export const verticalScale = (size: number): number => {
  const ratio = SCREEN_HEIGHT / 812;
  return Math.round(size * Math.min(ratio, 1.4));
};

export const moderateScale = (size: number, factor = 0.5): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

export const maxContentWidth = isTablet ? 560 : SCREEN_WIDTH;

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

export const fontScale = (size: number): number => {
  if (isTablet) {
    return Math.round(size * Math.min(SCREEN_WIDTH / PHONE_BASE, 1.45));
  }
  return Math.round(size * Math.min(SCREEN_WIDTH / PHONE_BASE, 1.1));
};

export const numPadButtonSize = (): number => {
  if (isTablet) {
    return Math.min(Math.round((SCREEN_WIDTH - 120) / 3), 100);
  }
  return Math.min(Math.round((SCREEN_WIDTH - 80) / 3), 72);
};

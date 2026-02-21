import React, { useRef, useEffect, useCallback, createContext, useContext } from "react";
import { Animated, Dimensions, Platform, Easing, ViewStyle } from "react-native";

const DURATION = 280;

const SlideContext = createContext<{ animateOut: () => Promise<void> }>({
  animateOut: () => Promise.resolve(),
});

export function useSlideBack() {
  return useContext(SlideContext);
}

export function useWebSlideTransition() {
  const windowWidth = Dimensions.get("window").width;
  const translateX = useRef(
    new Animated.Value(Platform.OS === "web" ? windowWidth : 0)
  ).current;

  useEffect(() => {
    if (Platform.OS !== "web") return;
    Animated.timing(translateX, {
      toValue: 0,
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const animateOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (Platform.OS !== "web") {
        resolve();
        return;
      }
      Animated.timing(translateX, {
        toValue: windowWidth,
        duration: DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }).start(() => resolve());
    });
  }, []);

  const slideStyle: Animated.WithAnimatedObject<ViewStyle> =
    Platform.OS === "web"
      ? { flex: 1, transform: [{ translateX }] }
      : { flex: 1 };

  return { slideStyle, animateOut };
}

export function WebSlideView({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { slideStyle, animateOut } = useWebSlideTransition();

  return (
    <SlideContext.Provider value={{ animateOut }}>
      <Animated.View style={[slideStyle, style]}>{children}</Animated.View>
    </SlideContext.Provider>
  );
}

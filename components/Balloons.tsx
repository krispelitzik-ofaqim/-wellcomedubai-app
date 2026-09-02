import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';

const BALLOON_COLORS = ['#E76F51', '#E9C46A', '#2A9D8F', '#1A6B8A', '#B85C8E', '#5B9DC7', '#EF476F', '#06D6A0', '#F4A261', '#7B4FA0'];

function Balloon({ w, h }: { w: number; h: number }) {
  const y = useRef(new Animated.Value(h + 80)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const startX = useRef(20 + Math.random() * (w - 40)).current;
  const size = useRef(30 + Math.random() * 22).current;
  const color = useRef(BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)]).current;
  const delay = useRef(Math.random() * 4000).current;
  const dur = useRef(6000 + Math.random() * 4000).current;
  const swayAmt = useRef(14 + Math.random() * 22).current;
  const swayDir = useRef(Math.random() < 0.5 ? 1 : -1).current;
  useEffect(() => {
    const rise = Animated.loop(Animated.timing(y, { toValue: -size * 3, duration: dur, delay, easing: Easing.linear, useNativeDriver: true }));
    const rock = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 1400 + Math.random() * 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(sway, { toValue: -1, duration: 1400 + Math.random() * 900, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    rise.start(); rock.start();
    return () => { rise.stop(); rock.stop(); };
  }, []);
  const translateX = sway.interpolate({ inputRange: [-1, 1], outputRange: [-swayAmt * swayDir, swayAmt * swayDir] });
  const rotate = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-8deg', '8deg'] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: startX, top: 0, transform: [{ translateX }, { translateY: y }, { rotate }] }}>
      {/* balloon body */}
      <View style={{ width: size, height: size * 1.25, borderRadius: size / 2, backgroundColor: color }} />
      {/* highlight */}
      <View style={{ position: 'absolute', top: size * 0.18, left: size * 0.24, width: size * 0.22, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: 'rgba(255,255,255,0.45)' }} />
      {/* knot */}
      <View style={{ alignSelf: 'center', width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color, marginTop: -1 }} />
      {/* string */}
      <View style={{ alignSelf: 'center', width: 1, height: size * 0.9, backgroundColor: 'rgba(0,0,0,0.25)' }} />
    </Animated.View>
  );
}

// Colorful balloons that rise and gently sway for `duration` ms, then remove themselves.
// Full-screen, non-interactive — layer it above content like Confetti.
export function Balloons({ duration = 30000, count = 14, width, height }: { duration?: number; count?: number; width?: number; height?: number }) {
  const [on, setOn] = useState(true);
  const win = Dimensions.get('window');
  const w = width ?? win.width;
  const h = height ?? win.height;
  useEffect(() => {
    if (duration >= 1e8) return;
    const tmr = setTimeout(() => setOn(false), duration);
    return () => clearTimeout(tmr);
  }, [duration]);
  if (!on) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: w, height: h, zIndex: 9998 }}>
      {Array.from({ length: count }).map((_, i) => <Balloon key={i} w={w} h={h} />)}
    </View>
  );
}

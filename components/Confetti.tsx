import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';

const COLORS = ['#E9C46A', '#E76F51', '#2A9D8F', '#1A6B8A', '#F4A261', '#B85C8E', '#5B9DC7', '#FFD166', '#EF476F', '#06D6A0'];

function Piece({ w, h, emojis }: { w: number; h: number; emojis?: string[] }) {
  const y = useRef(new Animated.Value(-40)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const startX = useRef(Math.random() * w).current;
  const drift = useRef((Math.random() - 0.5) * 120).current;
  const size = useRef(6 + Math.random() * 9).current;
  const color = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]).current;
  const emoji = useRef(emojis && emojis.length ? emojis[Math.floor(Math.random() * emojis.length)] : '').current;
  const delay = useRef(Math.random() * 2500).current;
  const dur = useRef(2800 + Math.random() * 3200).current;
  const round = useRef(Math.random() < 0.35).current;
  useEffect(() => {
    const fall = Animated.loop(Animated.timing(y, { toValue: h + 40, duration: dur, delay, easing: Easing.linear, useNativeDriver: true }));
    const spin = Animated.loop(Animated.timing(rot, { toValue: 1, duration: 900 + Math.random() * 1200, easing: Easing.linear, useNativeDriver: true }));
    fall.start(); spin.start();
    return () => { fall.stop(); spin.stop(); };
  }, []);
  const translateX = y.interpolate({ inputRange: [-40, h + 40], outputRange: [startX, startX + drift] });
  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  if (emoji) {
    return (
      <Animated.Text pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, fontSize: 16 + size * 1.4, transform: [{ translateX }, { translateY: y }, { rotate }] }}>{emoji}</Animated.Text>
    );
  }
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width: size, height: round ? size : size * 0.55, borderRadius: round ? size / 2 : 0, backgroundColor: color, transform: [{ translateX }, { translateY: y }, { rotate }] }}
    />
  );
}

// Heavy confetti (or emoji rain) for `duration` ms, then removes itself. Full-screen, non-interactive.
// Pass `emojis` (e.g. ['❤️','💕']) to rain emoji instead of colored confetti.
export function Confetti({ duration = 30000, count = 160, emojis, width, height }: { duration?: number; count?: number; emojis?: string[]; width?: number; height?: number }) {
  const [on, setOn] = useState(true);
  const win = Dimensions.get('window');
  const w = width ?? win.width;
  const h = height ?? win.height;
  useEffect(() => {
    if (duration >= 1e8) return;              // effectively continuous — never auto-stop
    const tmr = setTimeout(() => setOn(false), duration);
    return () => clearTimeout(tmr);
  }, [duration]);
  if (!on) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: w, height: h, zIndex: 9999 }}>
      {Array.from({ length: count }).map((_, i) => <Piece key={i} w={w} h={h} emojis={emojis} />)}
    </View>
  );
}

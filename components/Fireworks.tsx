import { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';

const FW_COLORS = ['#E9C46A', '#E76F51', '#2A9D8F', '#5B9DC7', '#B85C8E', '#EF476F', '#06D6A0', '#FFD166', '#F4A261'];
const PARTICLES = 16;

function Burst({ w, h, seed }: { w: number; h: number; seed: number }) {
  const p = useRef(new Animated.Value(0)).current;
  const cx = useRef(w * (0.15 + Math.random() * 0.7)).current;
  const cy = useRef(h * (0.08 + Math.random() * 0.32)).current;
  const color = useRef(FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)]).current;
  const radius = useRef(70 + Math.random() * 70).current;
  const delay = useRef(seed * 600 + Math.random() * 1200).current;
  const burstDur = useRef(850 + Math.random() * 500).current;
  const pauseDur = useRef(1400 + Math.random() * 2600).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(p, { toValue: 1, duration: burstDur, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.delay(pauseDur),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);
  const opacity = p.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 0] });
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: cx, top: cy }}>
      {Array.from({ length: PARTICLES }).map((_, i) => {
        const angle = (i / PARTICLES) * Math.PI * 2;
        const r = radius * (0.8 + (i % 3) * 0.1);
        const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * r] });
        const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * r] });
        const dot = 4 + (i % 2) * 2;
        return (
          <Animated.View
            key={i}
            style={{ position: 'absolute', width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color, opacity, transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}
          />
        );
      })}
    </View>
  );
}

// Recurring firework bursts across the upper part of the screen for `duration` ms.
// Full-screen, non-interactive — layer above content.
export function Fireworks({ duration = 30000, count = 5, width, height }: { duration?: number; count?: number; width?: number; height?: number }) {
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
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: w, height: h, zIndex: 9997 }}>
      {Array.from({ length: count }).map((_, i) => <Burst key={i} w={w} h={h} seed={i} />)}
    </View>
  );
}

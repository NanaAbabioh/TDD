// Characters, objects and icons, drawn in code as soft vector shapes.
// Original designs: round, friendly and easy to tell apart by silhouette.

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Pattern,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import type { Theme } from '../activity/tasks';
import { CORAL, CREAM, INK, SUN } from './theme';

export type Mood = 'idle' | 'happy' | 'waiting';

const DINOS = [
  { light: '#86DC7C', dark: '#4FB062', belly: '#F4F6C8', accent: '#F6A04D', iris: '#2F7A45' },
  { light: '#FFC078', dark: '#F08A3E', belly: '#FFF2D6', accent: '#E9685C', iris: '#9A4B1E' },
  { light: '#8CC8FB', dark: '#4F93E0', belly: '#EAF6FF', accent: '#FFD166', iris: '#2A5EA8' },
  { light: '#C7A2EE', dark: '#9167CC', belly: '#F5ECFF', accent: '#FF8FB1', iris: '#5E3A99' },
  { light: '#FFA3B4', dark: '#E96C88', belly: '#FFECEF', accent: '#FFD166', iris: '#A83A5C' },
];

// Each dinosaur is its own kind, told apart by silhouette as well as colour:
// 0 spiky rex, 1 horned frill, 2 plated back, 3 swept crest, 4 finned swimmer.
function Headgear({ kind, accent }: { kind: number; accent: string }) {
  if (kind === 0) {
    return (
      <G fill={accent}>
        <Path d="M36 27 L43 8 L52 22 Z" />
        <Path d="M51 20 L60 0 L69 20 Z" />
        <Path d="M68 22 L77 8 L84 27 Z" />
      </G>
    );
  }
  if (kind === 1) {
    return (
      <G>
        <Ellipse cx={60} cy={38} rx={45} ry={31} fill={accent} />
        <G fill="#fff" opacity={0.45}>
          <Circle cx={20} cy={30} r={4} />
          <Circle cx={34} cy={13} r={4} />
          <Circle cx={60} cy={8} r={4} />
          <Circle cx={86} cy={13} r={4} />
          <Circle cx={100} cy={30} r={4} />
        </G>
        <Path d="M38 26 Q30 4 43 8 Q47 18 49 25 Z" fill={CREAM} />
        <Path d="M82 26 Q90 4 77 8 Q73 18 71 25 Z" fill={CREAM} />
      </G>
    );
  }
  if (kind === 2) {
    return (
      <G fill={accent}>
        <Path d="M33 26 Q36 8 46 12 Q52 18 50 26 Z" />
        <Path d="M48 20 Q54 -2 66 2 Q74 10 72 20 Z" />
        <Path d="M70 26 Q72 10 82 12 Q90 18 87 28 Z" />
      </G>
    );
  }
  if (kind === 3) {
    return <Path d="M52 22 Q62 -8 98 2 Q82 10 78 28 Z" fill={accent} />;
  }
  return (
    <G fill={accent}>
      <Path d="M30 40 Q8 34 14 14 Q26 22 36 28 Z" />
      <Path d="M90 40 Q112 34 106 14 Q94 22 84 28 Z" />
      <Path d="M54 20 Q60 6 66 20 Z" />
    </G>
  );
}

// What each kind carries on its tail.
function TailTip({ kind, accent, dark }: { kind: number; accent: string; dark: string }) {
  if (kind === 0) {
    return (
      <G fill={accent}>
        <Path d="M102 73 L113 66 L109 79 Z" />
        <Path d="M106 86 L117 84 L109 94 Z" />
      </G>
    );
  }
  if (kind === 2) {
    return (
      <G fill={CREAM} stroke="#D9CBB4" strokeWidth={1}>
        <Path d="M107 71 L103 56 L113 66 Z" />
        <Path d="M111 72 L122 63 L115 77 Z" />
      </G>
    );
  }
  if (kind === 3) {
    return (
      <G stroke={accent} strokeWidth={3.5} strokeLinecap="round">
        <Path d="M96 84 L104 78" />
        <Path d="M92 92 L102 90" />
      </G>
    );
  }
  if (kind === 4) return <Path d="M104 72 Q122 58 116 82 Q112 76 106 80 Z" fill={accent} />;
  return <Circle cx={108} cy={72} r={5} fill={dark} />;
}

// Freckles, stripes or spots on the top of the head.
function Markings({ kind, dark }: { kind: number; dark: string }) {
  if (kind === 3) {
    return (
      <G stroke={dark} strokeWidth={3.5} strokeLinecap="round" opacity={0.6}>
        <Path d="M30 30 L37 24" />
        <Path d="M27 39 L33 35" />
        <Path d="M84 22 L90 28" />
      </G>
    );
  }
  if (kind === 1) return null;
  return (
    <G fill={dark} opacity={0.55}>
      <Circle cx={kind === 2 ? 86 : 33} cy={34} r={3.2} />
      <Circle cx={kind === 2 ? 80 : 40} cy={26} r={2.4} />
      <Circle cx={kind === 2 ? 91 : 28} cy={43} r={2} />
    </G>
  );
}

export function Foot({ x, dark, toe }: { x: number; dark: string; toe: string }) {
  return (
    <G>
      <Ellipse cx={x} cy={109} rx={13} ry={7} fill={dark} />
      <Circle cx={x - 8} cy={111} r={2.6} fill={toe} />
      <Circle cx={x} cy={113} r={2.6} fill={toe} />
      <Circle cx={x + 8} cy={111} r={2.6} fill={toe} />
    </G>
  );
}

export function Eye({ x, iris, look }: { x: number; iris: string; look: number }) {
  return (
    <G>
      <Circle cx={x} cy={44} r={10.5} fill="#fff" />
      <Circle cx={x + 1} cy={45 + look} r={7} fill={iris} />
      <Circle cx={x + 1} cy={45 + look} r={4} fill={INK} />
      <Circle cx={x + 3.5} cy={42 + look} r={2.4} fill="#fff" />
      <Circle cx={x - 1.5} cy={48 + look} r={1.1} fill="#fff" opacity={0.8} />
    </G>
  );
}

export function Dino({
  size,
  variant,
  mood,
  blink,
}: {
  size: number;
  variant: number;
  mood: Mood;
  blink?: boolean;
}) {
  const kind = variant % DINOS.length;
  const c = DINOS[kind];
  const skin = `url(#dino-${kind})`;
  const closed = blink || mood === 'happy';
  const cheer = mood === 'happy';
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`dino-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="1" stopColor={c.dark} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={60} cy={113} rx={36} ry={6} fill="#000" opacity={0.14} />
      <Path d="M80 96 Q116 100 110 68 Q102 86 78 82 Z" fill={c.dark} />
      <TailTip kind={kind} accent={c.accent} dark={c.dark} />
      <Foot x={45} dark={c.dark} toe={c.belly} />
      <Foot x={75} dark={c.dark} toe={c.belly} />
      <Ellipse cx={60} cy={87} rx={28} ry={24} fill={skin} />
      <Ellipse cx={60} cy={91} rx={17} ry={16} fill={c.belly} />
      <G stroke={c.dark} strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.28}>
        <Path d="M49 85 Q60 89 71 85" />
        <Path d="M46 92 Q60 97 74 92" />
        <Path d="M49 99 Q60 103 71 99" />
      </G>
      {/* Arms hang by the sides, and go up when cheering. */}
      <G fill={c.dark}>
        <Ellipse cx={cheer ? 29 : 34} cy={cheer ? 72 : 84} rx={6} ry={10} transform={cheer ? 'rotate(-38 29 72)' : 'rotate(24 34 84)'} />
        <Ellipse cx={cheer ? 91 : 86} cy={cheer ? 72 : 84} rx={6} ry={10} transform={cheer ? 'rotate(38 91 72)' : 'rotate(-24 86 84)'} />
      </G>
      <Headgear kind={kind} accent={c.accent} />
      <Ellipse cx={60} cy={46} rx={37} ry={30} fill={skin} />
      <Path d="M30 34 Q44 18 62 18" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.3} />
      <Markings kind={kind} dark={c.dark} />
      <Circle cx={35} cy={58} r={7} fill="#FF7E8A" opacity={0.42} />
      <Circle cx={85} cy={58} r={7} fill="#FF7E8A" opacity={0.42} />
      {closed ? (
        <G stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
          <Path d={cheer ? 'M38 46 Q46 38 54 46' : 'M38 44 Q46 50 54 44'} />
          <Path d={cheer ? 'M66 46 Q74 38 82 46' : 'M66 44 Q74 50 82 44'} />
        </G>
      ) : (
        <G>
          <Eye x={46} iris={c.iris} look={mood === 'waiting' ? 2.5 : 0} />
          <Eye x={74} iris={c.iris} look={mood === 'waiting' ? 2.5 : 0} />
        </G>
      )}
      {mood === 'waiting' && (
        <G stroke={INK} strokeWidth={2.8} strokeLinecap="round" opacity={0.75}>
          <Path d="M38 29 L51 32" />
          <Path d="M82 29 L69 32" />
        </G>
      )}
      {kind === 1 ? (
        <Path d="M55 55 L60 43 L65 55 Z" fill={CREAM} stroke="#E3CDB4" strokeWidth={1.2} strokeLinejoin="round" />
      ) : (
        <G fill={INK} opacity={0.55}>
          <Circle cx={55} cy={58} r={1.5} />
          <Circle cx={65} cy={58} r={1.5} />
        </G>
      )}
      {cheer && (
        <G>
          <Path d="M49 62 Q60 79 71 62 Z" fill="#7A2E46" />
          <Ellipse cx={60} cy={70.5} rx={5.5} ry={3.2} fill="#FF8FA3" />
          {kind === 0 && <Path d="M53 62 L56 67 L59 62 Z M61 62 L64 67 L67 62 Z" fill="#fff" />}
        </G>
      )}
      {mood === 'idle' && (
        <G>
          <Path d="M52 64 Q60 70 68 64" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
          {kind === 0 && <Path d="M63 66.5 L65.5 71 L68 65.5 Z" fill="#fff" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />}
        </G>
      )}
      {mood === 'waiting' && <Ellipse cx={60} cy={66} rx={3.6} ry={4} fill="#7A2E46" />}
    </Svg>
  );
}

function Leaf({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8FE07A" />
          <Stop offset="1" stopColor="#3FA65A" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={50} cy={93} rx={26} ry={5} fill="#000" opacity={0.13} />
      <G transform="rotate(-16 50 50)">
        <Path d="M50 5 C 86 22, 90 62, 50 90 C 10 62, 14 22, 50 5 Z" fill="url(#leaf)" stroke="#2C7F47" strokeWidth={3} strokeLinejoin="round" />
        <Path d="M50 14 L50 96" stroke="#2C7F47" strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M50 36 L66 26 M50 52 L70 42 M50 68 L66 60 M50 36 L34 26 M50 52 L30 42 M50 68 L34 60" stroke="#2C7F47" strokeWidth={2.5} strokeLinecap="round" opacity={0.7} />
        <Path d="M33 30 C 25 44, 27 58, 35 68" stroke="#fff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.38} />
      </G>
    </Svg>
  );
}

function Cup({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="cup" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FF8C6B" />
          <Stop offset="1" stopColor="#E9573A" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={50} cy={93} rx={24} ry={5} fill="#000" opacity={0.13} />
      <Rect x={55} y={2} width={7} height={34} rx={3.5} fill={SUN} stroke="#D9A320" strokeWidth={1.5} transform="rotate(14 58 20)" />
      <Path d="M27 26 L73 26 L67 88 Q50 94 33 88 Z" fill="url(#cup)" stroke="#C2472D" strokeWidth={3} strokeLinejoin="round" />
      <Path d="M29 46 L71 46 L69.5 62 L30.5 62 Z" fill="#FFF3E6" />
      <Circle cx={50} cy={54} r={4.5} fill={CORAL} />
      <Rect x={22} y={19} width={56} height={10} rx={5} fill="#FFF3E6" stroke="#E3CDB4" strokeWidth={2} />
      <Path d="M35 34 L38 82" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.3} />
    </Svg>
  );
}

function Rider({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="coat" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#6FA0F5" />
          <Stop offset="1" stopColor="#3F6FD3" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={50} cy={94} rx={26} ry={5} fill="#000" opacity={0.13} />
      <Path d="M24 94 Q24 60 50 60 Q76 60 76 94 Z" fill="url(#coat)" stroke="#2F57A8" strokeWidth={3} strokeLinejoin="round" />
      <Path d="M35 63 Q50 74 65 63 L65 70 Q50 81 35 70 Z" fill={SUN} />
      <Circle cx={50} cy={41} r={22} fill="#EBB98F" stroke="#C98E62" strokeWidth={2.5} />
      <Path d="M28 35 Q50 3 72 35 Z" fill={CORAL} />
      <Rect x={24} y={31} width={52} height={8} rx={4} fill="#E2573A" />
      <Circle cx={50} cy={13} r={5.5} fill="#fff" />
      <Circle cx={42} cy={44} r={3.4} fill={INK} />
      <Circle cx={58} cy={44} r={3.4} fill={INK} />
      <Circle cx={43} cy={43} r={1.1} fill="#fff" />
      <Circle cx={59} cy={43} r={1.1} fill="#fff" />
      <Circle cx={35} cy={50} r={4.5} fill="#FF7E8A" opacity={0.45} />
      <Circle cx={65} cy={50} r={4.5} fill="#FF7E8A" opacity={0.45} />
      <Path d="M43 52 Q50 58 57 52" stroke={INK} strokeWidth={2.8} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function ItemArt({ theme, size }: { theme: Theme; size: number }) {
  if (theme === 'cups') return <Cup size={size} />;
  if (theme === 'train') return <Rider size={size} />;
  return <Leaf size={size} />;
}

export function Plate({ size, waiting }: { size: number; waiting: boolean }) {
  return (
    <Svg width={size} height={size * 0.56} viewBox="0 0 100 56">
      <Ellipse cx={50} cy={33} rx={46} ry={18} fill="#000" opacity={0.12} />
      <Ellipse cx={50} cy={27} rx={46} ry={19} fill="#fff" stroke={waiting ? CORAL : '#D9CBB4'} strokeWidth={waiting ? 5 : 2.5} strokeDasharray={waiting ? '10 7' : undefined} />
      <Ellipse cx={50} cy={27} rx={31} ry={11.5} fill="none" stroke={waiting ? '#FFD3C7' : '#EFE5D2'} strokeWidth={3} />
    </Svg>
  );
}

// One seat of the carriage: a window with a seat back the rider sits against.
export function Seat({ size, waiting }: { size: number; waiting: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={0} y={8} width={100} height={84} fill="#E9573A" />
      <Rect x={0} y={4} width={100} height={12} rx={6} fill="#B93F26" />
      <Rect x={0} y={80} width={100} height={12} fill="#B93F26" />
      <Rect x={13} y={24} width={74} height={52} rx={12} fill="#D8F0FA" stroke={waiting ? CREAM : '#8A2C1A'} strokeWidth={waiting ? 6 : 4} strokeDasharray={waiting ? '10 7' : undefined} />
      <Rect x={27} y={48} width={46} height={28} rx={9} fill="#5B8DEF" opacity={0.55} />
    </Svg>
  );
}

// Seen from above: a woven basket with a rope rim and a handle at each end.
function Basket({ w, h }: { w: number; h: number }) {
  const side = 14;
  const bodyW = w - side * 2;
  const bodyH = h - 8;
  const r = Math.min(bodyH * 0.34, 44);
  const rim = Math.min(16, bodyH * 0.13);
  return (
    <Svg width={w} height={h}>
      <Defs>
        <Pattern id="weave" x={0} y={0} width={26} height={26} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={26} height={26} fill="#F2C778" />
          <Rect x={0} y={0} width={13} height={13} fill="#E2AC55" />
          <Rect x={13} y={13} width={13} height={13} fill="#E2AC55" />
          <Path d="M2 6.5 H11 M15 19.5 H24 M19.5 2 V11 M6.5 15 V24" stroke="#C48B38" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
        </Pattern>
      </Defs>
      <Path d={`M${side + 4} ${bodyH * 0.3} Q ${-side * 0.5} ${bodyH / 2} ${side + 4} ${bodyH * 0.7}`} stroke="#9C6424" strokeWidth={9} strokeLinecap="round" fill="none" />
      <Path d={`M${w - side - 4} ${bodyH * 0.3} Q ${w + side * 0.5} ${bodyH / 2} ${w - side - 4} ${bodyH * 0.7}`} stroke="#9C6424" strokeWidth={9} strokeLinecap="round" fill="none" />
      <Rect x={side + 3} y={9} width={bodyW - 6} height={bodyH - 2} rx={r} fill="#000" opacity={0.16} />
      <Rect x={side} y={0} width={bodyW} height={bodyH} rx={r} fill="#C98A3A" stroke="#8F5A20" strokeWidth={3} />
      <Rect x={side + rim} y={rim} width={bodyW - rim * 2} height={bodyH - rim * 2} rx={Math.max(10, r - rim)} fill="url(#weave)" stroke="#A8702B" strokeWidth={3} />
      <Rect x={side + rim / 2} y={rim / 2} width={bodyW - rim} height={bodyH - rim} rx={r - rim / 2} fill="none" stroke="#F4D08D" strokeWidth={rim * 0.42} strokeDasharray="11 9" strokeLinecap="round" />
    </Svg>
  );
}

function Tray({ w, h }: { w: number; h: number }) {
  const inset = Math.min(14, h * 0.1);
  return (
    <Svg width={w} height={h}>
      <Defs>
        <Pattern id="gingham" x={0} y={0} width={28} height={28} patternUnits="userSpaceOnUse">
          <Rect x={0} y={0} width={28} height={28} fill="#FFFDF7" />
          <Rect x={0} y={0} width={14} height={28} fill="#F0584A" opacity={0.45} />
          <Rect x={0} y={0} width={28} height={14} fill="#F0584A" opacity={0.45} />
        </Pattern>
        <LinearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#E0A76C" />
          <Stop offset="1" stopColor="#B97A45" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h} rx={16} fill="url(#gingham)" stroke="#E7D9C4" strokeWidth={2} />
      <Rect x={inset + 3} y={inset + 6} width={w - inset * 2 - 6} height={h - inset * 2 - 4} rx={22} fill="#000" opacity={0.15} />
      <Rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2 - 4} rx={22} fill="url(#wood)" stroke="#8E5A30" strokeWidth={3} />
      <Rect x={inset + 12} y={inset + 12} width={w - inset * 2 - 24} height={h - inset * 2 - 28} rx={14} fill="#F1CFA2" />
      <G stroke="#D9AE7C" strokeWidth={2} strokeLinecap="round" opacity={0.7}>
        <Line x1={inset + 30} y1={h * 0.36} x2={w - inset - 30} y2={h * 0.36} />
        <Line x1={inset + 46} y1={h * 0.62} x2={w - inset - 46} y2={h * 0.62} />
      </G>
    </Svg>
  );
}

function Wagon({ w, h }: { w: number; h: number }) {
  const wheel = Math.min(h * 0.17, 24);
  const railY = h - 5;
  const bodyTop = h * 0.1;
  const bodyBottom = railY - wheel * 1.25;
  const planks = Math.floor((w - 24) / 34);
  return (
    <Svg width={w} height={h}>
      <Defs>
        <LinearGradient id="wagon" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5CC8BD" />
          <Stop offset="1" stopColor="#2F938A" />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={railY - 2} width={w} height={5} rx={2.5} fill="#7A6A58" />
      {Array.from({ length: Math.floor(w / 30) }, (_, i) => (
        <Rect key={i} x={10 + i * 30} y={railY + 1} width={12} height={4} rx={2} fill="#A08B73" />
      ))}
      <Rect x={2} y={bodyBottom - 10} width={8} height={7} rx={3} fill={INK} />
      <Rect x={w - 10} y={bodyBottom - 10} width={8} height={7} rx={3} fill={INK} />
      <Rect x={8} y={bodyTop} width={w - 16} height={bodyBottom - bodyTop} rx={14} fill="url(#wagon)" stroke="#1F6F68" strokeWidth={3} />
      <G stroke="#1F6F68" strokeWidth={2} opacity={0.35}>
        {Array.from({ length: planks }, (_, i) => {
          const x = 12 + ((i + 1) * (w - 24)) / (planks + 1);
          return <Line key={i} x1={x} y1={bodyTop + 12} x2={x} y2={bodyBottom - 6} />;
        })}
      </G>
      <Rect x={8} y={bodyTop} width={w - 16} height={12} rx={6} fill="#1F6F68" />
      <Rect x={10} y={bodyBottom - 26} width={w - 20} height={10} fill={CREAM} opacity={0.85} />
      <Rect x={18} y={bodyBottom - 2} width={w - 36} height={8} rx={4} fill={INK} />
      {[w * 0.2, w * 0.8].map((cx) => (
        <G key={cx}>
          <Circle cx={cx} cy={railY - wheel - 2} r={wheel} fill={INK} />
          <Circle cx={cx} cy={railY - wheel - 2} r={wheel * 0.55} fill="#C9CED8" />
          <Circle cx={cx} cy={railY - wheel - 2} r={wheel * 0.18} fill={INK} />
        </G>
      ))}
    </Svg>
  );
}

// The basket, tray or wagon the child fills, drawn to fit its drop area.
export function ContainerArt({ theme, width, height }: { theme: Theme; width: number; height: number }) {
  if (theme === 'train') return <Wagon w={width} h={height} />;
  if (theme === 'cups') return <Tray w={width} h={height} />;
  return <Basket w={width} h={height} />;
}

export function BellIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={13} r={7} fill={INK} />
      <Path d="M50 16 Q23 22 23 56 L14 73 Q50 82 86 73 L77 56 Q77 22 50 16 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <Path d="M36 34 Q33 44 34 56" stroke={SUN} strokeWidth={6} strokeLinecap="round" fill="none" />
      <Circle cx={50} cy={86} r={8} fill={INK} />
    </Svg>
  );
}

export function SpeakerIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M14 38 L34 38 L58 18 L58 82 L34 62 L14 62 Z" fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Path d="M70 36 Q82 50 70 64 M80 24 Q100 50 80 76" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function HomeIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M24 48 L24 84 L76 84 L76 48" fill={INK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <Path d="M10 52 L50 16 L90 52" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={42} y={60} width={16} height={24} rx={4} fill="#fff" />
    </Svg>
  );
}

export function PlayIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Polygon points="36,22 82,50 36,78" fill="#fff" stroke="#fff" strokeWidth={10} strokeLinejoin="round" />
    </Svg>
  );
}

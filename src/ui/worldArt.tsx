// Artwork for the train and dragon worlds, in the same soft vector style
// as the dinosaurs.

import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import type { Treasure } from '../activity/dragonGame';
import { Eye, Foot, Mood } from './art';
import { CORAL, CREAM, INK, SUN } from './theme';

// A friendly steam engine facing right. Drawn 140 wide by 120 tall.
export const ENGINE_RATIO = 140 / 120;

export function Engine({ height, happy }: { height: number; happy: boolean }) {
  return (
    <Svg width={height * ENGINE_RATIO} height={height} viewBox="0 0 140 120">
      <Defs>
        <LinearGradient id="boiler" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FF8C6B" />
          <Stop offset="1" stopColor="#E2533A" />
        </LinearGradient>
        <LinearGradient id="cab" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5FA8F5" />
          <Stop offset="1" stopColor="#3B78D8" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={70} cy={114} rx={58} ry={5} fill="#000" opacity={0.14} />
      <Circle cx={96} cy={12} r={7} fill="#fff" opacity={0.85} />
      <Circle cx={108} cy={5} r={5} fill="#fff" opacity={0.7} />
      <Rect x={90} y={24} width={14} height={30} rx={3} fill={INK} />
      <Rect x={85} y={19} width={24} height={10} rx={5} fill={INK} />
      <Rect x={12} y={30} width={46} height={62} rx={10} fill="url(#cab)" stroke="#2C5CAE" strokeWidth={3} />
      <Rect x={6} y={22} width={58} height={13} rx={6.5} fill={INK} />
      <Rect x={21} y={41} width={28} height={24} rx={7} fill="#D8F0FA" stroke="#2C5CAE" strokeWidth={3} />
      <Rect x={46} y={50} width={76} height={42} rx={20} fill="url(#boiler)" stroke="#B93F26" strokeWidth={3} />
      <Circle cx={70} cy={50} r={9} fill={SUN} stroke="#D9981A" strokeWidth={2.5} />
      <Rect x={56} y={58} width={8} height={30} rx={4} fill={SUN} opacity={0.9} />
      <Circle cx={104} cy={68} r={8.5} fill="#fff" />
      <Circle cx={105.5} cy={69} r={4.6} fill={INK} />
      <Circle cx={107} cy={67} r={1.7} fill="#fff" />
      {happy ? (
        <Path d="M96 80 Q105 91 114 80 Z" fill="#7A2E46" />
      ) : (
        <Path d="M97 81 Q105 87 113 81" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      )}
      <Circle cx={95} cy={77} r={4.5} fill="#FFD3C7" opacity={0.7} />
      <Path d="M120 90 L138 102 L118 102 Z" fill={INK} />
      <Rect x={8} y={88} width={114} height={9} rx={4.5} fill={INK} />
      {[
        { x: 34, r: 16 },
        { x: 78, r: 12 },
        { x: 106, r: 12 },
      ].map((wheel) => (
        <G key={wheel.x}>
          <Circle cx={wheel.x} cy={112 - wheel.r} r={wheel.r} fill={INK} />
          <Circle cx={wheel.x} cy={112 - wheel.r} r={wheel.r * 0.58} fill={SUN} />
          <Circle cx={wheel.x} cy={112 - wheel.r} r={wheel.r * 0.2} fill={INK} />
        </G>
      ))}
    </Svg>
  );
}

const DRAGON = { light: '#FF9C8A', dark: '#E0544C', belly: '#FFE9A8', wing: '#9A72D6', iris: '#B5651D' };

export function Dragon({ size, mood, blink }: { size: number; mood: Mood; blink?: boolean }) {
  const c = DRAGON;
  const cheer = mood === 'happy';
  const closed = blink || cheer;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id="dragon-skin" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="1" stopColor={c.dark} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={60} cy={113} rx={38} ry={6} fill="#000" opacity={0.16} />
      {/* Wings lift when the dragon cheers. */}
      <G transform={cheer ? 'translate(0 -8)' : undefined}>
        <Path d="M38 80 Q2 66 4 34 Q14 48 22 44 Q22 56 30 54 Q30 66 40 66 Z" fill={c.wing} stroke="#7550B8" strokeWidth={2} strokeLinejoin="round" />
        <Path d="M82 80 Q118 66 116 34 Q106 48 98 44 Q98 56 90 54 Q90 66 80 66 Z" fill={c.wing} stroke="#7550B8" strokeWidth={2} strokeLinejoin="round" />
      </G>
      <Path d="M80 96 Q116 100 110 72 Q102 86 78 82 Z" fill={c.dark} />
      <Path d="M110 74 L99 64 L119 56 L117 76 Z" fill={SUN} stroke="#D9981A" strokeWidth={1.5} strokeLinejoin="round" />
      <Foot x={45} dark={c.dark} toe={CREAM} />
      <Foot x={75} dark={c.dark} toe={CREAM} />
      <Ellipse cx={60} cy={87} rx={28} ry={24} fill="url(#dragon-skin)" />
      <Ellipse cx={60} cy={91} rx={17} ry={16} fill={c.belly} />
      <G stroke="#E2B95A" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.7}>
        <Path d="M49 85 Q60 89 71 85" />
        <Path d="M46 92 Q60 97 74 92" />
        <Path d="M49 99 Q60 103 71 99" />
      </G>
      <G fill={c.dark}>
        <Ellipse cx={cheer ? 29 : 34} cy={cheer ? 72 : 84} rx={6} ry={10} transform={cheer ? 'rotate(-38 29 72)' : 'rotate(24 34 84)'} />
        <Ellipse cx={cheer ? 91 : 86} cy={cheer ? 72 : 84} rx={6} ry={10} transform={cheer ? 'rotate(38 91 72)' : 'rotate(-24 86 84)'} />
      </G>
      <Path d="M28 42 Q8 38 12 20 Q22 28 34 32 Z" fill={c.wing} />
      <Path d="M92 42 Q112 38 108 20 Q98 28 86 32 Z" fill={c.wing} />
      <Path d="M40 26 Q32 2 46 8 Q49 18 51 25 Z" fill={CREAM} stroke="#E3CDB4" strokeWidth={1.5} />
      <Path d="M80 26 Q88 2 74 8 Q71 18 69 25 Z" fill={CREAM} stroke="#E3CDB4" strokeWidth={1.5} />
      <Ellipse cx={60} cy={46} rx={37} ry={30} fill="url(#dragon-skin)" />
      <Path d="M30 34 Q44 18 62 18" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.3} />
      <Ellipse cx={60} cy={61} rx={19} ry={12} fill={c.light} />
      <Circle cx={33} cy={57} r={6.5} fill="#FFD166" opacity={0.5} />
      <Circle cx={87} cy={57} r={6.5} fill="#FFD166" opacity={0.5} />
      {closed ? (
        <G stroke={INK} strokeWidth={3.5} strokeLinecap="round" fill="none">
          <Path d={cheer ? 'M38 44 Q46 36 54 44' : 'M38 42 Q46 48 54 42'} />
          <Path d={cheer ? 'M66 44 Q74 36 82 44' : 'M66 42 Q74 48 82 42'} />
        </G>
      ) : (
        <G transform="translate(0 -2)">
          <Eye x={46} iris={c.iris} look={mood === 'waiting' ? 2.5 : 0} />
          <Eye x={74} iris={c.iris} look={mood === 'waiting' ? 2.5 : 0} />
        </G>
      )}
      <G fill={INK} opacity={0.6}>
        <Ellipse cx={54} cy={57} rx={1.8} ry={2.4} />
        <Ellipse cx={66} cy={57} rx={1.8} ry={2.4} />
      </G>
      {cheer && (
        <G>
          <Path d="M49 63 Q60 79 71 63 Z" fill="#7A2E46" />
          <Ellipse cx={60} cy={71} rx={5.5} ry={3} fill="#FF8FA3" />
          <Path d="M52 63 L55 68 L58 63 Z M62 63 L65 68 L68 63 Z" fill="#fff" />
        </G>
      )}
      {mood === 'idle' && (
        <G>
          <Path d="M51 65 Q60 71 69 65" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M54 66.5 L56.5 71 L59 67 Z" fill="#fff" stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
        </G>
      )}
      {mood === 'waiting' && <Ellipse cx={60} cy={67} rx={3.6} ry={4} fill="#7A2E46" />}
    </Svg>
  );
}

function Coin({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFE27A" />
          <Stop offset="1" stopColor="#F2A93B" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={50} cy={90} rx={30} ry={6} fill="#000" opacity={0.15} />
      <Circle cx={50} cy={48} r={40} fill="url(#gold)" stroke="#B9741C" strokeWidth={4} />
      <Circle cx={50} cy={48} r={29} fill="none" stroke="#D8922A" strokeWidth={4} />
      <Polygon points="50,28 55.5,41 69,42 58.5,51 62,65 50,57 38,65 41.5,51 31,42 44.5,41" fill="#FFF3C4" stroke="#D8922A" strokeWidth={2} strokeLinejoin="round" />
      <Path d="M24 32 Q32 18 46 14" stroke="#fff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.6} />
    </Svg>
  );
}

function Gem({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#8DEBE0" />
          <Stop offset="1" stopColor="#2FA7B8" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={50} cy={92} rx={28} ry={5} fill="#000" opacity={0.15} />
      <Polygon points="28,14 72,14 92,40 50,88 8,40" fill="url(#gem)" stroke="#1E7C8C" strokeWidth={4} strokeLinejoin="round" />
      <Path d="M8 40 L92 40 M28 14 L38 40 L50 88 L62 40 L72 14 M38 40 L50 14 L62 40" stroke="#1E7C8C" strokeWidth={2.5} strokeLinejoin="round" fill="none" opacity={0.6} />
      <Polygon points="30,17 49,17 39,37" fill="#fff" opacity={0.45} />
    </Svg>
  );
}

export function TreasureArt({ treasure, size }: { treasure: Treasure; size: number }) {
  return treasure === 'gems' ? <Gem size={size} /> : <Coin size={size} />;
}

// A glass-fronted chest, so the ten pieces inside stay visible.
export function Chest({ width, treasure }: { width: number; treasure: Treasure }) {
  const fill = treasure === 'gems' ? '#4FC4CF' : '#F6B93B';
  const edge = treasure === 'gems' ? '#1E7C8C' : '#B9741C';
  return (
    <Svg width={width} height={width * 0.78} viewBox="0 0 100 78">
      <Ellipse cx={50} cy={73} rx={44} ry={5} fill="#000" opacity={0.16} />
      <Path d="M8 28 Q8 4 50 4 Q92 4 92 28 Z" fill="#B97A45" stroke="#7A4A22" strokeWidth={3} strokeLinejoin="round" />
      <Path d="M30 6 L30 28 M70 6 L70 28" stroke={SUN} strokeWidth={5} />
      <Rect x={6} y={26} width={88} height={44} rx={7} fill="#FFF8E3" stroke="#7A4A22" strokeWidth={3} />
      {Array.from({ length: 10 }, (_, i) => (
        <Circle key={i} cx={17 + (i % 5) * 16.5} cy={39 + Math.floor(i / 5) * 18} r={6.6} fill={fill} stroke={edge} strokeWidth={1.8} />
      ))}
      <Rect x={6} y={26} width={88} height={7} fill={SUN} stroke="#7A4A22" strokeWidth={2} />
      <Rect x={44} y={22} width={12} height={15} rx={3} fill={SUN} stroke="#7A4A22" strokeWidth={2} />
    </Svg>
  );
}

// The heap the child takes treasure from.
export function Pile({ size, treasure }: { size: number; treasure: Treasure }) {
  const spots = [
    [22, 78], [44, 80], [66, 80], [84, 76],
    [32, 62], [54, 64], [74, 62],
    [42, 46], [62, 46],
    [52, 30],
  ];
  const piece = size * 0.3;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={52} cy={90} rx={46} ry={8} fill="#000" opacity={0.15} />
      {spots.map(([x, y], i) => (
        <G key={i} transform={`translate(${x - 15} ${y - 15}) scale(0.3)`}>
          {treasure === 'gems' ? (
            <Polygon points="28,14 72,14 92,40 50,88 8,40" fill="#4FC4CF" stroke="#1E7C8C" strokeWidth={6} strokeLinejoin="round" />
          ) : (
            <>
              <Circle cx={50} cy={48} r={40} fill="#F6B93B" stroke="#B9741C" strokeWidth={6} />
              <Circle cx={50} cy={48} r={24} fill="none" stroke="#FFE27A" strokeWidth={7} />
            </>
          )}
        </G>
      ))}
      {piece > 0 && <Circle cx={30} cy={56} r={3} fill="#fff" opacity={0.8} />}
      <Circle cx={72} cy={36} r={2.4} fill="#fff" opacity={0.8} />
    </Svg>
  );
}

export function ArrowIcon({ size, back }: { size: number; back?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G transform={back ? 'rotate(180 50 50)' : undefined}>
        <Path d="M18 50 L70 50 M52 26 L78 50 L52 74" stroke={back ? INK : '#fff'} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
    </Svg>
  );
}

export function LidIcon({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M14 46 Q14 16 50 16 Q86 16 86 46 Z" fill="#B97A45" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <Rect x={12} y={46} width={76} height={36} rx={7} fill={CREAM} stroke={INK} strokeWidth={5} />
      <Rect x={42} y={40} width={16} height={20} rx={4} fill={CORAL} stroke={INK} strokeWidth={4} />
    </Svg>
  );
}

// Where the number path ends: a little station for the train, a nest for the dragon.
export function GoalIcon({ size, nest }: { size: number; nest: boolean }) {
  if (nest) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Ellipse cx={38} cy={50} rx={13} ry={17} fill={CREAM} stroke="#D9CBB4" strokeWidth={3} />
        <Ellipse cx={62} cy={50} rx={13} ry={17} fill="#FFE9A8" stroke="#E2B95A" strokeWidth={3} />
        <Path d="M10 56 Q50 104 90 56 Q70 68 50 66 Q30 68 10 56 Z" fill="#B97A45" stroke="#7A4A22" strokeWidth={4} strokeLinejoin="round" />
        <Path d="M22 68 L38 74 M46 76 L62 76 M70 73 L80 66" stroke="#7A4A22" strokeWidth={3} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={18} y={44} width={64} height={44} rx={5} fill={CREAM} stroke={INK} strokeWidth={4} />
      <Path d="M8 48 L50 14 L92 48 Z" fill={CORAL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <Rect x={41} y={60} width={18} height={28} rx={4} fill="#5B8DEF" stroke={INK} strokeWidth={3} />
      <Circle cx={50} cy={36} r={7} fill="#fff" stroke={INK} strokeWidth={3} />
    </Svg>
  );
}

// The picture on the number path's door: three tiles counting up.
export function PathArt({ size }: { size: number }) {
  const tiles = [
    { x: 6, y: 58, n: '1', fill: '#FFE27A' },
    { x: 36, y: 34, n: '2', fill: '#FFC93C' },
    { x: 66, y: 10, n: '3', fill: '#FF9C6B' },
  ];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M20 72 L50 48 L80 24" stroke={INK} strokeWidth={5} strokeDasharray="2 9" strokeLinecap="round" fill="none" opacity={0.5} />
      {tiles.map((tile) => (
        <G key={tile.n}>
          <Rect x={tile.x + 2} y={tile.y + 5} width={28} height={28} rx={8} fill={INK} opacity={0.25} />
          <Rect x={tile.x} y={tile.y} width={28} height={28} rx={8} fill={tile.fill} stroke={INK} strokeWidth={3.5} />
        </G>
      ))}
      <Path d="M17 67 L20 64 L20 80 M14 80 L26 80" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M44 44 Q50 36 56 43 Q56 48 44 57 L57 57" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M74 17 Q86 14 85 22 Q84 26 79 26 Q87 27 86 33 Q84 39 74 36" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

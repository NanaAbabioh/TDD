// Presentation of one task: the picnic (or train) scene, its feedback and
// the evidence it collects. The maths lives in the model and the task rules.

import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Task, evaluate, startCollection } from '../activity/tasks';
import {
  CONTAINER,
  Item,
  Place,
  SUPPLY,
  countIn,
  firstEmptyReceiver,
  itemsIn,
  moveItem,
  receiver,
  receiverItem,
} from '../model/collection';
import type { Attempt } from '../record/learningRecord';
import type { Settings } from '../record/storage';
import { feedbackLine, numberWord, promptLine, stillLine } from '../voice/lines';
import { playSound } from '../voice/sounds';
import { hush, say } from '../voice/speak';
import { BellIcon, ContainerArt, HomeIcon, ItemArt, Mood, Plate, Seat, SpeakerIcon } from './art';
import { ChunkyButton } from './ChunkyButton';
import { Confetti } from './Confetti';
import { DinoActor } from './DinoActor';
import { Point, layoutScene } from './layout';
import { NumberPop } from './NumberPop';
import { Piece, Release } from './Piece';
import { CORAL, CREAM, FONT, INK, SUN } from './theme';
import { World } from './World';

type Phase = 'play' | 'feedback' | 'celebrate' | 'spread';

type Props = {
  task: Task;
  session: number;
  settings: Settings;
  progress: { position: number; length: number };
  onFinish: (attempt?: Attempt) => void;
  onExit: () => void;
};

export function Scene({ task, session, settings, progress, onFinish, onExit }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const layout = useMemo(
    () => layoutScene(width, height, insets, task),
    [width, height, insets, task],
  );

  const [collection, setCollection] = useState(() => startCollection(task));
  const [phase, setPhase] = useState<Phase>('play');
  // After the first commit, items are shown paired one-to-one with the receivers.
  const [paired, setPaired] = useState(false);
  const [helpShown, setHelpShown] = useState(false);
  const [caption, setCaption] = useState('');

  const stats = useRef({
    commits: 0,
    firstGiven: 0,
    firstCorrect: false,
    changesBeforeCommit: 0,
    idleDrags: 0,
    replays: 0,
  }).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]).current;
  const later = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));

  const speak = (text: string) => {
    setCaption(text);
    say(text, settings.voice);
  };

  useEffect(() => {
    later(500, () => speak(promptLine(task)));
    return () => {
      timers.forEach(clearTimeout);
      hush();
    };
  }, []);

  const makingSet = task.skill === 'make-set';
  const matching = task.skill === 'match';
  const supports = task.support === 'supported' || helpShown;
  const receiversVisible = matching || (makingSet && (supports || paired || phase !== 'play'));
  const showSlots = makingSet && supports && !paired && phase !== 'spread';
  const containerItems = itemsIn(collection, 'container');

  const spotFor = (item: Item): Point => {
    if (item.place.kind === 'supply') return layout.supplySpot(item.id);
    if (item.place.kind === 'receiver') return layout.plateSpot(item.place.index);
    const order = containerItems.findIndex((other) => other.id === item.id);
    if (phase === 'spread') return layout.spreadSpot(order);
    if (!paired) return layout.containerSpot(order);
    return order < task.quantity
      ? layout.plateSpot(order)
      : layout.containerSpot(order - task.quantity);
  };

  const isLeftOver = (item: Item) =>
    paired && item.place.kind === 'container' && containerItems.indexOf(item) >= task.quantity;

  const isWaiting = (index: number) => {
    if (matching) return stats.commits > 0 && !receiverItem(collection, index);
    return paired && index >= containerItems.length;
  };

  const move = (id: number, to: Place | undefined, dragged: boolean) => {
    const next = to ? moveItem(collection, id, to) : collection;
    if (next === collection) {
      if (dragged) stats.idleDrags++;
      return;
    }
    if (to?.kind === 'supply' && stats.commits === 0) stats.changesBeforeCommit++;
    setCollection(next);
    if (makingSet && supports && to?.kind === 'container') {
      speak(numberWord(countIn(next, 'container')));
    }
  };

  const nearestReceiver = (point: Point): Place | undefined => {
    let best: number | undefined;
    let bestDistance = layout.receiver * 0.9;
    for (let index = 0; index < task.quantity; index++) {
      const spot = layout.plateSpot(index);
      const distance = Math.hypot(spot.x - point.x, spot.y - point.y);
      if (distance < bestDistance) {
        best = index;
        bestDistance = distance;
      }
    }
    return best === undefined ? undefined : receiver(best);
  };

  const release = (item: Item, { tap, x, y }: Release) => {
    if (phase !== 'play') return;
    if (tap) {
      if (item.place.kind !== 'supply') return move(item.id, SUPPLY, false);
      if (!matching) return move(item.id, CONTAINER, false);
      const empty = firstEmptyReceiver(collection);
      return move(item.id, empty === undefined ? undefined : receiver(empty), false);
    }
    if (x < layout.divider) return move(item.id, SUPPLY, true);
    move(item.id, matching ? nearestReceiver({ x, y }) : CONTAINER, true);
  };

  const finish = () => {
    onFinish({
      at: Date.now(),
      session,
      skill: matching ? 'match' : 'make-set',
      quantity: task.quantity,
      theme: task.theme,
      arrangement: task.arrangement,
      support: task.support,
      firstGiven: stats.firstGiven,
      firstCorrect: stats.firstCorrect,
      commits: stats.commits,
      help: helpShown ? 'shown' : 'none',
      changesBeforeCommit: stats.changesBeforeCommit,
      idleDrags: stats.idleDrags,
      replays: stats.replays,
    });
  };

  // The child decides when the amount is complete by ringing the bell.
  const commit = () => {
    if (phase !== 'play') return;
    if (task.skill === 'explore') return onFinish();

    const result = evaluate(task, collection);
    stats.commits++;
    if (stats.commits === 1) {
      stats.firstGiven = result.given;
      stats.firstCorrect = result.correct;
    }
    // The sound lands first, then the voice says what the pairing shows.
    playSound(result.correct ? 'success' : 'retry', settings.sound);
    const line = feedbackLine(task, result, progress.position + task.quantity);
    later(result.correct ? 500 : 350, () => speak(line));
    if (makingSet) setPaired(true);

    if (!result.correct) {
      // Two misses: add the spaces and the counting rather than repeating the same demand.
      if (stats.commits >= 2) setHelpShown(true);
      setPhase('feedback');
      later(1200, () => setPhase('play'));
      return;
    }
    setPhase('celebrate');
    later(4200, () => {
      if (!makingSet) return finish();
      // Same items, new arrangement: the amount has not changed.
      setPaired(false);
      setPhase('spread');
      speak(stillLine(task));
      later(2600, finish);
    });
  };

  const replay = () => {
    stats.replays++;
    speak(promptLine(task));
  };

  const moodFor = (index: number): Mood => {
    if (phase === 'celebrate' || phase === 'spread') return 'happy';
    return isWaiting(index) ? 'waiting' : 'idle';
  };
  const calm = settings.reducedMotion;

  // Whenever the game counts aloud, each counted item wears its number, so the
  // spoken word, the numeral and the object arrive together.
  const tagSize = layout.item * 0.8;
  const countTag = (item: Item): number | undefined => {
    if (!makingSet || !supports || phase === 'spread' || item.place.kind !== 'container') {
      return undefined;
    }
    return containerItems.indexOf(item) + 1;
  };
  const basket = layout.container;
  const total =
    makingSet && phase === 'celebrate'
      ? {
          x: basket.x + basket.w / 2,
          y: basket.y + basket.h / 2 - 4,
          size: Math.min(basket.h * 0.6, 96),
          burst: 1.7,
        }
      : makingSet && phase === 'spread'
        ? { x: basket.x + layout.item * 0.5, y: basket.y + 6, size: layout.item * 0.95, burst: 1.8 }
        : undefined;
  const rowCentre = layout.receiverSpot((task.quantity - 1) / 2);

  return (
    <Animated.View entering={calm ? undefined : FadeIn.duration(280)} style={styles.fill}>
      <World theme={task.theme} width={width} height={height} reducedMotion={calm} />

      <View
        style={[
          styles.mat,
          {
            left: layout.supply.x,
            top: layout.supply.y,
            width: layout.supply.w,
            height: layout.supply.h,
          },
        ]}
      />
      {!matching && (
        <View style={{ position: 'absolute', left: layout.container.x, top: layout.container.y }}>
          <ContainerArt theme={task.theme} width={layout.container.w} height={layout.container.h} />
        </View>
      )}

      {showSlots &&
        Array.from({ length: task.quantity }, (_, order) => {
          const spot = layout.containerSpot(order);
          const size = layout.item * 1.06;
          return (
            <View
              key={order}
              style={[
                styles.slot,
                { left: spot.x - size / 2, top: spot.y - size / 2, width: size, height: size },
              ]}
            />
          );
        })}

      {receiversVisible &&
        Array.from({ length: task.quantity }, (_, index) => {
          const spot = layout.receiverSpot(index);
          const plate = layout.plateSpot(index);
          const size = layout.receiver;
          const arrive = calm ? undefined : FadeInDown.duration(320).delay(index * 70);
          if (task.theme === 'train') {
            return (
              <Animated.View
                key={index}
                entering={arrive}
                style={[styles.untouchable, { position: 'absolute', left: spot.x - size / 2, top: spot.y - size / 2 }]}
              >
                <Seat size={size} waiting={isWaiting(index)} />
              </Animated.View>
            );
          }
          const plateSize = layout.item * 1.35;
          return (
            <Animated.View key={index} entering={arrive} style={[StyleSheet.absoluteFill, styles.untouchable]}>
              <View style={{ position: 'absolute', left: spot.x - size / 2, top: spot.y - size / 2 }}>
                <DinoActor size={size} variant={index} mood={moodFor(index)} reducedMotion={calm} />
              </View>
              <View style={{ position: 'absolute', left: plate.x - plateSize / 2, top: plate.y - plateSize * 0.12 }}>
                <Plate size={plateSize} waiting={isWaiting(index)} />
              </View>
            </Animated.View>
          );
        })}

      {collection.items
        .slice()
        .sort((a, b) => a.id - b.id)
        .map((item) => {
          const spot = spotFor(item);
          return (
            <Piece
              key={item.id}
              x={spot.x}
              y={spot.y}
              size={layout.item}
              disabled={phase !== 'play'}
              reducedMotion={calm}
              onRelease={(event) => release(item, event)}
            >
              {isLeftOver(item) && <View style={styles.leftOver} />}
              <View style={styles.above}>
                <ItemArt theme={task.theme} size={layout.item} />
              </View>
            </Piece>
          );
        })}

      {/* Count numerals sit above each counted item, in a layer over the pieces. */}
      {containerItems.map((item) => {
        const tag = countTag(item);
        if (tag === undefined) return null;
        const spot = spotFor(item);
        return (
          <NumberPop
            key={`${item.id}-${tag}`}
            value={tag}
            size={tagSize}
            burst={2}
            reducedMotion={calm}
            tone={isLeftOver(item) ? 'alert' : 'sun'}
            style={{ left: spot.x - tagSize / 2, top: spot.y - layout.item * 0.5 - tagSize * 0.55 }}
          />
        );
      })}

      {/* The numeral for the finished set, shown as the voice names it. */}
      {total && (
        <NumberPop
          key={phase}
          value={task.quantity}
          size={total.size}
          burst={total.burst}
          reducedMotion={calm}
          style={{ left: total.x - total.size / 2, top: total.y - total.size / 2 }}
        />
      )}

      {phase === 'celebrate' && !calm && (
        <Confetti x={rowCentre.x} y={rowCentre.y} spread={height * 0.5} />
      )}

      <View style={[styles.topBar, { top: insets.top + 6, left: layout.supply.x }]}>
        <ChunkyButton size={40} color="#fff" shade="#CFC7DE" label="Home" onPress={onExit}>
          <HomeIcon size={22} />
        </ChunkyButton>
        <ChunkyButton size={48} color="#fff" shade="#CFC7DE" label="Say it again" onPress={replay}>
          <SpeakerIcon size={28} />
        </ChunkyButton>
        <View style={styles.pips}>
          {Array.from({ length: progress.length }, (_, index) => (
            <View key={index} style={[styles.pip, index < progress.position && styles.pipDone]} />
          ))}
        </View>
      </View>
      {/* Captions are for the adult; the child hears the line and reads the scene. */}
      {caption !== '' && (
        <View
          style={[
            styles.captionRow,
            { left: layout.supply.x, width: layout.supply.w, bottom: insets.bottom + 8 },
          ]}
        >
          <Text style={styles.caption} numberOfLines={2}>
            {caption}
          </Text>
        </View>
      )}

      <ChunkyButton
        size={layout.bell.size}
        color={SUN}
        shade="#D9981A"
        label="Ready"
        onPress={commit}
        disabled={phase !== 'play'}
        style={{
          position: 'absolute',
          left: layout.bell.x - layout.bell.size / 2,
          top: layout.bell.y - layout.bell.size / 2 - 6,
        }}
      >
        <BellIcon size={layout.bell.size * 0.62} />
      </ChunkyButton>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: '#DFF7EC' },
  mat: {
    position: 'absolute',
    borderRadius: 28,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.85)',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  slot: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: CREAM,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  leftOver: {
    position: 'absolute',
    left: -7,
    top: -7,
    right: -7,
    bottom: -7,
    borderRadius: 999,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: CORAL,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  topBar: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 10 },
  pips: {
    flexDirection: 'row',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  pip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#C9C2D9',
    backgroundColor: '#fff',
  },
  pipDone: { borderColor: INK, backgroundColor: SUN },
  captionRow: { position: 'absolute', alignItems: 'center', pointerEvents: 'none' },
  caption: {
    fontFamily: FONT.medium,
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'center',
    color: INK,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  untouchable: { pointerEvents: 'none' },
  // Keeps the item drawn over its left-over ring.
  above: { position: 'relative' },
});

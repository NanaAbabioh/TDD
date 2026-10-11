// Where things sit on a landscape phone screen. Sizes follow the screen so
// targets stay large on a small phone and scale up on a tablet.

import type { Task } from '../activity/tasks';
import { uiScale } from './scale';

export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };
export type Insets = { top: number; left: number; right: number; bottom: number };

export type SceneLayout = {
  item: number;
  receiver: number;
  supply: Rect;
  container: Rect;
  // Drops left of this line go back to the supply.
  divider: number;
  bell: Point & { size: number };
  supplySpot: (id: number) => Point;
  receiverSpot: (index: number) => Point;
  plateSpot: (index: number) => Point;
  containerSpot: (order: number) => Point;
  spreadSpot: (order: number) => Point;
};

const PAD = 12;
const COLUMNS = 5;
// Rows fill left to right, so the count tags read 1, 2, 3 in order.

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// A steady pseudo-random number in [-1, 1] for an item, so scattered piles look the same each render.
function jitter(id: number, salt: number): number {
  const raw = Math.sin((id + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return (raw - Math.floor(raw)) * 2 - 1;
}

export function layoutScene(width: number, height: number, insets: Insets, task: Task): SceneLayout {
  // Fixed-size parts grow on a tablet.
  const s = uiScale(width, height);
  const TOP_BAR = 52 * s;
  const BELL = 76 * s;
  // Room under the supply mat for the adult's caption.
  const CAPTION = 44 * s;
  const left = insets.left + PAD;
  const right = width - insets.right - PAD;
  const top = insets.top + PAD;
  const bottom = height - insets.bottom - PAD;

  const supply: Rect = {
    x: left,
    y: top + TOP_BAR,
    w: (right - left) * 0.34,
    h: bottom - top - TOP_BAR - CAPTION,
  };
  const areaX = supply.x + supply.w + 16;
  const areaW = right - areaX;
  const count = Math.max(task.quantity, 1);

  // Fewer dinosaurs stand taller; five still fit side by side.
  const receiver = Math.min(height * 0.33, areaW / (Math.max(count, 3) + 0.4));
  const item = clamp(Math.min(height * 0.15, receiver * 0.6), 40, 84 * s);
  const receiverY = top + receiver / 2;
  const receiverGap = receiver * 1.04;
  const receiverX = (index: number) =>
    areaX + areaW / 2 + (index - (count - 1) / 2) * receiverGap;
  // Train riders sit in their seat; picnic items sit on a plate below the dinosaur.
  const plateY =
    task.theme === 'train' ? receiverY + receiver * 0.08 : receiverY + receiver / 2 + item * 0.45;

  const containerY = top + receiver + item * 1.2;
  const container: Rect = {
    x: areaX,
    y: containerY,
    w: areaW - BELL - 20,
    // Sized to its rows, so the basket does not balloon on a tall screen.
    h: Math.min(bottom - containerY, item * (task.supplyCount > COLUMNS ? 3.1 : 2.3)),
  };
  const gap = Math.min(item * 1.12, container.w / COLUMNS);
  const centerX = container.x + container.w / 2;
  const twoRows = task.supplyCount > COLUMNS;
  const rowY = (row: number) =>
    twoRows
      ? container.y + container.h / 2 + (row - 0.5) * Math.min(item, container.h * 0.46)
      : container.y + container.h / 2;

  const cellW = supply.w / 3;
  const cellH = supply.h / 3;

  return {
    item,
    receiver,
    supply,
    container,
    divider: areaX - 8,
    bell: { x: right - BELL / 2, y: bottom - BELL / 2, size: BELL },
    supplySpot: (id) => {
      const loose = task.arrangement === 'scattered' ? 0.16 : 0;
      return {
        x: supply.x + cellW * ((id % 3) + 0.5) + jitter(id, 1) * cellW * loose,
        y: supply.y + cellH * (Math.floor(id / 3) + 0.5) + jitter(id, 2) * cellH * loose,
      };
    },
    receiverSpot: (index) => ({ x: receiverX(index), y: receiverY }),
    plateSpot: (index) => ({ x: receiverX(index), y: plateY }),
    containerSpot: (order) => ({
      x: centerX + ((order % COLUMNS) - (COLUMNS - 1) / 2) * gap,
      y: rowY(Math.floor(order / COLUMNS)),
    }),
    spreadSpot: (order) => ({
      x: centerX + (order - (count - 1) / 2) * gap,
      y: container.y + container.h / 2 + (order % 2 === 0 ? -1 : 1) * item * 0.4,
    }),
  };
}

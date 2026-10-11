// The number path's mathematical model: a grid of numbered tiles with one
// path through it that counts 0, 1, 2 ... up to the last number. Every step
// of the path is to a neighbouring tile, and from any tile on the path only
// one neighbour holds the next number.

export type Maze = {
  cols: number;
  rows: number;
  // The number shown on each tile, row by row.
  values: number[];
  // Tile indexes in counting order: path[k] is the tile holding k.
  path: number[];
};

export type Tap = 'next' | 'wrong' | 'far';

// Small seeded generator, so a maze can be rebuilt from its seed.
function random(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function neighbours(maze: { cols: number; rows: number }, cell: number): number[] {
  const col = cell % maze.cols;
  const row = Math.floor(cell / maze.cols);
  const around: number[] = [];
  if (row > 0) around.push(cell - maze.cols);
  if (row < maze.rows - 1) around.push(cell + maze.cols);
  if (col > 0) around.push(cell - 1);
  if (col < maze.cols - 1) around.push(cell + 1);
  return around;
}

// A path that works its way from the left edge to the right edge: in each
// column it runs up or down some tiles, then steps right.
function tracePath(cols: number, rows: number, length: number, rand: () => number): number[] | undefined {
  const path: number[] = [];
  let row = Math.floor(rand() * rows);
  let remaining = length;
  for (let col = 0; col < cols; col++) {
    const columnsAfter = cols - col - 1;
    const up = row + 1;
    const down = rows - row;
    const most = Math.min(Math.max(up, down), remaining - columnsAfter);
    const least = Math.max(1, remaining - columnsAfter * rows);
    if (least > most) return undefined;
    const run = least + Math.floor(rand() * (most - least + 1));
    const canUp = up >= run;
    const canDown = down >= run;
    const direction = canUp && canDown ? (rand() < 0.5 ? -1 : 1) : canUp ? -1 : 1;
    for (let i = 0; i < run; i++) path.push((row + direction * i) * cols + col);
    row += direction * (run - 1);
    remaining -= run;
  }
  return remaining === 0 ? path : undefined;
}

// 'near' fills the other tiles with close numbers (two more, one less) that
// are easy to mistake for the next one; otherwise they are clearly far away.
export function generateMaze(cols: number, rows: number, last: number, seed: number, near: boolean): Maze {
  const rand = random(seed);
  let path: number[] | undefined;
  for (let attempt = 0; attempt < 400 && !path; attempt++) {
    path = tracePath(cols, rows, last + 1, rand);
  }
  if (!path) throw new Error(`No path of ${last + 1} tiles fits a ${cols} by ${rows} grid`);

  const values = new Array<number>(cols * rows).fill(-1);
  path.forEach((cell, number) => {
    values[cell] = number;
  });

  const grid = { cols, rows };
  for (let cell = 0; cell < values.length; cell++) {
    if (values[cell] !== -1) continue;
    // Numbers already showing next to this tile, so neighbours do not repeat.
    const beside = neighbours(grid, cell)
      .map((other) => values[other])
      .filter((value) => value >= 0);
    const pathBeside = neighbours(grid, cell)
      .filter((other) => path.indexOf(other) !== -1)
      .map((other) => path.indexOf(other));
    // Never the number that comes next after a neighbouring path tile.
    const forbidden = new Set(pathBeside.map((number) => number + 1));
    const anchor = pathBeside.length > 0 ? pathBeside[Math.floor(rand() * pathBeside.length)] : Math.floor(rand() * last);
    const choices = near
      ? [anchor + 2, anchor + 3, anchor - 1, anchor - 2, anchor + 10]
      : [anchor + 5, anchor + 7, anchor + 9, anchor + 12, last + 3];
    const allowed = choices.filter((value) => value >= 0 && !forbidden.has(value) && !beside.includes(value));
    values[cell] = allowed.length > 0 ? allowed[Math.floor(rand() * allowed.length)] : last + 2 + cell;
  }
  return { cols, rows, values, path };
}

// What tapping a tile means when the path has reached the number 'reached'.
export function tapTile(maze: Maze, reached: number, cell: number): Tap {
  const head = maze.path[reached];
  if (!neighbours(maze, head).includes(cell)) return 'far';
  return maze.path[reached + 1] === cell ? 'next' : 'wrong';
}

export function lastNumber(maze: Maze): number {
  return maze.path.length - 1;
}

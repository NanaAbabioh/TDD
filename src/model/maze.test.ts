import { PATH_LEVELS, missesAllowed, nextPathTask, pathLevel } from '../activity/pathGame';
import type { Attempt } from '../record/learningRecord';
import { generateMaze, lastNumber, neighbours, tapTile } from './maze';

function done(last: number, support: 'supported' | 'independent'): Attempt {
  return {
    at: 0,
    session: 1,
    skill: 'path',
    quantity: last,
    theme: 'train',
    arrangement: 'x',
    support,
    firstGiven: last,
    firstCorrect: true,
    commits: last,
    help: 'none',
    changesBeforeCommit: 0,
    idleDrags: 0,
    replays: 0,
  };
}

describe('number path', () => {
  it('builds a path that counts from 0 to the last number through neighbouring tiles', () => {
    for (const level of PATH_LEVELS) {
      for (let seed = 1; seed <= 40; seed++) {
        for (const near of [false, true]) {
          const maze = generateMaze(level.cols, level.rows, level.last, seed, near);
          expect(lastNumber(maze)).toBe(level.last);
          expect(new Set(maze.path).size).toBe(level.last + 1);
          expect(maze.path[0] % level.cols).toBe(0);
          expect(maze.path[level.last] % level.cols).toBe(level.cols - 1);
          maze.path.forEach((cell, number) => {
            expect(maze.values[cell]).toBe(number);
            if (number > 0) expect(neighbours(maze, maze.path[number - 1])).toContain(cell);
          });
        }
      }
    }
  });

  it('never offers two neighbours holding the next number', () => {
    for (const level of PATH_LEVELS) {
      for (let seed = 1; seed <= 40; seed++) {
        const maze = generateMaze(level.cols, level.rows, level.last, seed, true);
        for (let reached = 0; reached < level.last; reached++) {
          const matching = neighbours(maze, maze.path[reached]).filter(
            (cell) => maze.values[cell] === reached + 1,
          );
          expect(matching).toEqual([maze.path[reached + 1]]);
        }
        expect(maze.values.every((value) => value >= 0)).toBe(true);
      }
    }
  });

  it('judges a tap as the next tile, a wrong neighbour, or too far away', () => {
    const maze = generateMaze(6, 3, 10, 3, true);
    expect(tapTile(maze, 4, maze.path[5])).toBe('next');
    const wrong = neighbours(maze, maze.path[4]).find((cell) => cell !== maze.path[5]);
    if (wrong !== undefined) expect(tapTile(maze, 4, wrong)).toBe('wrong');
    const far = maze.values.findIndex((_, cell) => !neighbours(maze, maze.path[0]).includes(cell) && cell !== maze.path[0]);
    expect(tapTile(maze, 0, far)).toBe('far');
  });

  it('moves up a level only after a path is found without help', () => {
    expect(pathLevel([]).last).toBe(5);
    expect(nextPathTask([], 1, 0)).toMatchObject({ last: 5, support: 'supported' });
    expect(nextPathTask([done(5, 'supported')], 1, 1)).toMatchObject({ last: 5, support: 'independent' });
    expect(pathLevel([done(5, 'independent')]).last).toBe(10);
    const all = PATH_LEVELS.map((level) => done(level.last, 'independent'));
    expect(pathLevel(all).last).toBe(50);
    expect(missesAllowed(5)).toBe(1);
    expect(missesAllowed(50)).toBe(5);
  });
});

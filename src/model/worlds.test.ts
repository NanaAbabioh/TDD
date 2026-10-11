import {
  Hoard,
  TRAY_SIZE,
  addCoin,
  allCoins,
  createHoard,
  hoardTotal,
  pack,
  removeCoin,
  unpack,
} from './hoard';
import { createTrack, step } from './track';

describe('track', () => {
  it('moves one stop at a time and counts each move', () => {
    let track = createTrack(5);
    for (let i = 0; i < 3; i++) track = step(track, 1);
    expect(track.position).toBe(3);
    expect(step(track, -1).position).toBe(2);
  });

  it('stops at both ends of the line', () => {
    const start = createTrack(5);
    expect(step(start, -1)).toBe(start);
    const end = createTrack(5, 5);
    expect(step(end, 1)).toBe(end);
    expect(createTrack(5, 99).position).toBe(5);
  });
});

describe('hoard', () => {
  const fill = (h: Hoard, coins: number) => {
    for (let i = 0; i < coins; i++) h = addCoin(h);
    return h;
  };

  it('never creates or loses a coin, whatever is tried', () => {
    const moves = [addCoin, addCoin, addCoin, removeCoin, pack, unpack, addCoin];
    let h = createHoard(24);
    for (let i = 0; i < 600; i++) {
      h = moves[(i * 7 + (i % 5)) % moves.length](h);
      expect(allCoins(h)).toBe(24);
      expect(h.tray).toBeGreaterThanOrEqual(0);
      expect(h.tray).toBeLessThanOrEqual(TRAY_SIZE);
    }
  });

  it('packs exactly ten coins into a chest, and only a full tray', () => {
    const nine = fill(createHoard(24), 9);
    expect(pack(nine)).toBe(nine);
    const ten = addCoin(nine);
    expect(addCoin(ten)).toBe(ten);
    const packed = pack(ten);
    expect(packed).toMatchObject({ tray: 0, chests: 1 });
    expect(hoardTotal(packed)).toBe(10);
  });

  it('opens a chest back into the same ten coins', () => {
    const packed = pack(fill(createHoard(24), 10));
    expect(unpack(packed)).toMatchObject({ tray: 10, chests: 0 });
    const withLoose = addCoin(packed);
    expect(unpack(withLoose)).toBe(withLoose);
  });

  it('shows a teen number as one chest and some more', () => {
    const thirteen = fill(pack(fill(createHoard(24), 10)), 3);
    expect(thirteen).toMatchObject({ chests: 1, tray: 3 });
    expect(hoardTotal(thirteen)).toBe(13);
  });
});

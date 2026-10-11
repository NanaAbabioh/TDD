// The dragon's mathematical model: loose coins on a ten-space tray, and
// chests that each hold exactly ten. Coins are never created or lost; a full
// tray and a chest are the same ten coins.

export type Hoard = { supply: number; tray: number; chests: number };

export const TRAY_SIZE = 10;

export function createHoard(supply: number): Hoard {
  return { supply, tray: 0, chests: 0 };
}

export function hoardTotal(h: Hoard): number {
  return h.chests * TRAY_SIZE + h.tray;
}

// Every coin in play, wherever it is.
export function allCoins(h: Hoard): number {
  return h.supply + hoardTotal(h);
}

// Each change returns the same hoard when it is not allowed.
export function addCoin(h: Hoard): Hoard {
  if (h.supply === 0 || h.tray === TRAY_SIZE) return h;
  return { ...h, supply: h.supply - 1, tray: h.tray + 1 };
}

export function removeCoin(h: Hoard): Hoard {
  if (h.tray === 0) return h;
  return { ...h, supply: h.supply + 1, tray: h.tray - 1 };
}

// Ten loose coins become one chest.
export function pack(h: Hoard): Hoard {
  if (h.tray !== TRAY_SIZE) return h;
  return { ...h, tray: 0, chests: h.chests + 1 };
}

// One chest becomes ten loose coins again.
export function unpack(h: Hoard): Hoard {
  if (h.chests === 0 || h.tray !== 0) return h;
  return { ...h, tray: TRAY_SIZE, chests: h.chests - 1 };
}

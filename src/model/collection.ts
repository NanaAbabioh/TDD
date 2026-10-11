// The mathematical model: a fixed set of objects and where each one is.
// Every change goes through moveItem, so objects can never be duplicated or lost.

export type Place =
  | { kind: 'supply' }
  | { kind: 'container' }
  | { kind: 'receiver'; index: number };

export type Item = { id: number; place: Place };

export type Collection = {
  // Array order is the order items last moved, so items in a place keep their arrival order.
  items: readonly Item[];
  receivers: number;
};

export type Distribution = {
  pairs: { itemId: number; receiver: number }[];
  leftover: number[];
  unserved: number[];
};

export const SUPPLY: Place = { kind: 'supply' };
export const CONTAINER: Place = { kind: 'container' };
export const receiver = (index: number): Place => ({ kind: 'receiver', index });

export function createCollection(supplyCount: number, receivers: number): Collection {
  const items = Array.from({ length: supplyCount }, (_, id) => ({ id, place: SUPPLY }));
  return { items, receivers };
}

export function samePlace(a: Place, b: Place): boolean {
  if (a.kind === 'receiver' && b.kind === 'receiver') return a.index === b.index;
  return a.kind === b.kind;
}

export function itemsIn(c: Collection, kind: Place['kind']): Item[] {
  return c.items.filter((item) => item.place.kind === kind);
}

export function countIn(c: Collection, kind: Place['kind']): number {
  return itemsIn(c, kind).length;
}

export function receiverItem(c: Collection, index: number): Item | undefined {
  return c.items.find((item) => item.place.kind === 'receiver' && item.place.index === index);
}

export function firstEmptyReceiver(c: Collection): number | undefined {
  for (let index = 0; index < c.receivers; index++) {
    if (!receiverItem(c, index)) return index;
  }
  return undefined;
}

// Returns the same collection when the move is not allowed: unknown item,
// no change of place, a receiver that does not exist, or one that already holds an item.
export function moveItem(c: Collection, id: number, to: Place): Collection {
  const item = c.items.find((candidate) => candidate.id === id);
  if (!item || samePlace(item.place, to)) return c;
  if (to.kind === 'receiver') {
    if (to.index < 0 || to.index >= c.receivers || receiverItem(c, to.index)) return c;
  }
  const others = c.items.filter((candidate) => candidate.id !== id);
  return { ...c, items: [...others, { id, place: to }] };
}

// Pairs container items with receivers one-to-one, in arrival order.
export function distribute(c: Collection): Distribution {
  const inContainer = itemsIn(c, 'container');
  const pairs = inContainer
    .slice(0, c.receivers)
    .map((item, index) => ({ itemId: item.id, receiver: index }));
  const leftover = inContainer.slice(c.receivers).map((item) => item.id);
  const unserved = Array.from({ length: c.receivers }, (_, index) => index).slice(pairs.length);
  return { pairs, leftover, unserved };
}

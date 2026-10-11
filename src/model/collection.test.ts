import {
  CONTAINER,
  Collection,
  SUPPLY,
  countIn,
  createCollection,
  distribute,
  firstEmptyReceiver,
  itemsIn,
  moveItem,
  receiver,
} from './collection';

function ids(c: Collection): number[] {
  return c.items.map((item) => item.id).sort((a, b) => a - b);
}

describe('collection', () => {
  it('starts with every item in the supply', () => {
    const c = createCollection(6, 3);
    expect(countIn(c, 'supply')).toBe(6);
    expect(countIn(c, 'container')).toBe(0);
  });

  it('never duplicates or loses an item, whatever moves are tried', () => {
    let c = createCollection(7, 3);
    const places = [SUPPLY, CONTAINER, receiver(0), receiver(1), receiver(2), receiver(9)];
    for (let step = 0; step < 500; step++) {
      c = moveItem(c, (step * 5) % 9, places[(step * 7) % places.length]);
      expect(ids(c)).toEqual([0, 1, 2, 3, 4, 5, 6]);
      expect(countIn(c, 'supply') + countIn(c, 'container') + countIn(c, 'receiver')).toBe(7);
    }
  });

  it('ignores moves that change nothing or name an unknown item', () => {
    const c = createCollection(3, 1);
    expect(moveItem(c, 0, SUPPLY)).toBe(c);
    expect(moveItem(c, 42, CONTAINER)).toBe(c);
  });

  it('lets a receiver hold only one item', () => {
    let c = createCollection(3, 2);
    c = moveItem(c, 0, receiver(0));
    expect(moveItem(c, 1, receiver(0))).toBe(c);
    expect(moveItem(c, 1, receiver(2))).toBe(c);
    expect(firstEmptyReceiver(c)).toBe(1);
    c = moveItem(c, 1, receiver(1));
    expect(firstEmptyReceiver(c)).toBeUndefined();
  });

  it('keeps container items in the order they arrived', () => {
    let c = createCollection(4, 0);
    for (const id of [2, 0, 3]) c = moveItem(c, id, CONTAINER);
    c = moveItem(c, 2, SUPPLY);
    c = moveItem(c, 2, CONTAINER);
    expect(itemsIn(c, 'container').map((item) => item.id)).toEqual([0, 3, 2]);
  });

  it('pairs items with receivers one-to-one and reports what is left over', () => {
    let c = createCollection(6, 3);
    for (const id of [0, 1, 2, 3]) c = moveItem(c, id, CONTAINER);
    const result = distribute(c);
    expect(result.pairs).toHaveLength(3);
    expect(result.leftover).toEqual([3]);
    expect(result.unserved).toEqual([]);
  });

  it('reports receivers that went without', () => {
    const c = moveItem(createCollection(6, 3), 0, CONTAINER);
    const result = distribute(c);
    expect(result.pairs).toHaveLength(1);
    expect(result.leftover).toEqual([]);
    expect(result.unserved).toEqual([1, 2]);
  });
});

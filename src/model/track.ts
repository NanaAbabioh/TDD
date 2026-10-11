// The train's mathematical model: a row of numbered stops and where the
// train is. The train only ever moves one whole stop at a time.

export type Track = { last: number; position: number };

export function createTrack(last: number, start = 0): Track {
  return { last, position: Math.min(Math.max(start, 0), last) };
}

// Returns the same track when the train is already at the end of the line.
export function step(track: Track, delta: 1 | -1): Track {
  const position = track.position + delta;
  if (position < 0 || position > track.last) return track;
  return { ...track, position };
}

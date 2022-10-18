export const calculateIntersection = (p1, p2, p3, p4) => {
  // p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y
  const { x: p0x, y: p0y } = p1;
  const { x: p1x, y: p1y } = p2;
  const { x: p2x, y: p2y } = p3;
  const { x: p3x, y: p3y } = p4;

  let d1x = p1x - p0x,
    d1y = p1y - p0y,
    d2x = p3x - p2x,
    d2y = p3y - p2y,
    // determinator
    d = d1x * d2y - d2x * d1y,
    px,
    py,
    s,
    t;

  // continue if intersecting/is not parallel
  if (d) {
    px = p0x - p2x;
    py = p0y - p2y;

    s = (d1x * py - d1y * px) / d;
    if (s >= 0 && s <= 1) {
      // if s was in range, calc t
      t = (d2x * py - d2y * px) / d;
      if (t >= 0 && t <= 1) {
        return { x: p0x + t * d1x, y: p0y + t * d1y };
      }
    }
  }

  return null;
};

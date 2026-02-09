const MIN_RADIUS = 7.5;
const MAX_RADIUS = 65;
const DEPTH = 2;
const NUM_POINTS = 2500;

const getGradientStop = (ratio) => {
  ratio = ratio > 1 ? 1 : ratio < 0 ? 0 : ratio;

  const LEFT_COLOR = "#ffffff";
  const RIGHT_COLOR = "#ffffff";

  const c0 = LEFT_COLOR.match(/.{1,2}/g).map(
    (oct) => parseInt(oct, 16) * (1 - ratio)
  );
  const c1 = RIGHT_COLOR.match(/.{1,2}/g).map(
    (oct) => parseInt(oct, 16) * ratio
  );
  const ci = [0, 1, 2].map((i) => Math.min(Math.round(c0[i] + c1[i]), 255));
  const color = ci
    .reduce((a, v) => (a << 8) + v, 0)
    .toString(16)
    .padStart(6, "0");

  return `#${color}`;
};

const calculateColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
};

const randomFromInterval = (min, max) => {
  return Math.random() * (max - min) + min;
};

export const pointsInner = Array.from(
  { length: NUM_POINTS },
  (v, k) => k + 1
).map((num) => {
  const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
  const randomAngle = Math.random() * Math.PI * 2;

  const x = Math.cos(randomAngle) * randomRadius;
  const y = Math.sin(randomAngle) * randomRadius;
  const z = randomFromInterval(-DEPTH, DEPTH);

  const color = calculateColor();

  return {
    idx: num,
    position: [x, y, z],
    color,
  };
});

export const pointsOuter = Array.from(
  { length: NUM_POINTS / 4 },
  (v, k) => k + 1
).map((num) => {
  const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
  const angle = Math.random() * Math.PI * 2;

  const x = Math.cos(angle) * randomRadius;
  const y = Math.sin(angle) * randomRadius;
  const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

  const color = calculateColor();

  return {
    idx: num,
    position: [x, y, z],
    color,
  };
});

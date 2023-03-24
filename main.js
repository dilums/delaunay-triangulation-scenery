const { sqrt, cos, sin, PI } = Math;
const TAU = 2 * PI;

const svg = d3.select("svg");
noise.seed(Math.random());

const skyColorSet = ["#bedcfa", "#93abd3", "#5c6e91", "#595b83", "#98acf8"];
const mountainColorSet = ["#c7956d", "#965d62", "#534e52"];
const treeColorSet = [
  "#61b15a",
  "#adce74",
  "#adce74",
  "#59886b",
  "#f1e189",
  "#7ea04d"
];
const cloudColorSet = ["#faf3dd", "#e0ece4", "#f1f3f8", "#f4f4f4"];
const moonColorSet = ["#fff76a", "#f2d974", "#ffd369", "#ffda77"];
const trunkColorSet = [
  "#ebd4d4",
  "#f6d6ad",
  "#f8efd4",
  "#835858",
  "#edc988",
  "#625261"
];

const setAttrs = (child, attrs, parent = svg) =>
  Object.entries(attrs).reduce(
    (acc, [key, val]) => acc.attr(key, val),
    typeof child === "string" ? parent.append(child) : child
  );
const range = (n, m = 0) =>
  Array(n)
    .fill(m)
    .map((i, j) => i + j);
const randInt = (max, min = 0) => Math.floor(min + Math.random() * (max - min));
const randChoise = (arr) => arr[randInt(arr.length)];
const rand = (max, min = 0) => min + Math.random() * (max - min);
const polar = (ang, r = 1) => [r * cos(ang), r * sin(ang)];
const divide = (d, n) => range(n).map((i) => (d / n) * i);
const devideWithEnds = (d, n) => [
  ...range(n - 1).map((i) => (d / (n - 1)) * i),
  d
];
const map = (value, sMin, sMax, dMin, dMax) => {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
};
setAttrs("rect", {
  x: 0,
  y: 0,
  width: 800,
  height: 400,
  fill: "#383737"
});

const triangle = (ps, colorMap) => {
  setAttrs("polygon", {
    points: ps,
    fill: randChoise(colorMap)
  });
};

const triangulate = (points, colorMap) => {
  const delaunay = d3.Delaunay.from(points.map(([x, y, ...rest]) => [x, y]));

  delaunay.triangles.forEach((t, i) => {
    if (!(i % 3)) {
      const trianglePoints = range(3).map(
        (j) => points[delaunay.triangles[i + j]]
      );

      const topPoints = trianglePoints
        .map(([a, b, c, d]) => [c, d])
        .filter(([e, f]) => e);
      if (topPoints.length === 3) {
        //
      } else if (topPoints.length === 2) {
        const [a, b] = topPoints.map(([i, j]) => j);
        if (Math.abs(a - b) < 6) {
          triangle(
            trianglePoints.map(([x, y]) => `${x},${y}`).join(" "),
            colorMap
          );
        }
      } else {
        triangle(
          trianglePoints.map(([x, y]) => `${x},${y}`).join(" "),
          colorMap
        );
      }
    }
  });
};

const points = range(100).map(() => [randInt(800), randInt(250)]);
triangulate([...points, [0, 0], [800, 0], [0, 250], [800, 250]], skyColorSet);

const cloud = (xOff, yOff) => {
  const cloudPoints = range(100).map(() => {
    const r = sqrt(rand(1000));
    const ang = rand(TAU);
    const [x, y] = polar(ang, r);

    return [x * 2 + xOff, y + yOff];
  });

  triangulate(cloudPoints, cloudColorSet);
};

cloud(200, 100);

const mountain = [];

devideWithEnds(800, 50).forEach((i, j) => {
  let y = 100 * noise.simplex2(0.8, map(j, 0, 50, 0, 5));

  y = map(y, -100, 100, 150, 250);
  const x = i;
  mountain.push([x, y, true, j]);
  const yb = rand(400, y + 30);
  const xb = x + rand(-5, 5);
  mountain.push([xb, yb, false]);
});

mountain.push([0, 400, false]);
mountain.push([800, 400, false]);
triangulate(mountain, mountainColorSet);

const moon = [];

divide(60, 5).forEach((i, j) => {
  divide(TAU, randInt(j * 2, j * 8)).forEach((ang) => {
    const [x, y] = polar(ang, i);
    moon.push([x + 700, y + 80]);
  });
});

triangulate(moon, moonColorSet);

let randomPoint1 = (width, c) => {
  const [cx, cy] = c;

  let r1 = Math.random();
  let r2 = Math.random();

  if (r1 + r2 > 1) {
    r1 = 1 - r1;
    r2 = 1 - r2;
  }

  let x = width * r2 + cx * r1;
  let y = cy * r1;
  return [x, y];
};

const tree = (x, y, s, h) => {
  const points = range(20).map(() => randomPoint1(s, [s / 2, -h]));
  const pointsActual = [
    [x + s / 10, y - h / 2],
    [x - s / 10, y - h / 2],
    ...points.map(([px, py]) => [x + px - s / 2, y + py - h / 2])
  ];

  pointsActual.forEach(([x, y]) => {});
  triangulate(pointsActual, treeColorSet);

  const trunkBits = [
    [x - s / 16, y],
    [x + s / 16, y],
    [x - s / 16, y - h / 2],
    [x + s / 16, y - h / 2],
    ...range(20).map(() => [rand(x + s / 16, x - s / 16), rand(y, y - h / 2)])
  ];

  triangulate(trunkBits, trunkColorSet);
};

divide(800, 100).map((i) => {
  tree(i, 400 - rand(10), 30 + rand(10), 80 + rand(40));
});

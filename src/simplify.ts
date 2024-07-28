import type { Position } from "geojson";
import { Points } from "./types";
import { validLinearRing } from "./_validates";
import { InvalidSimplifyError } from "./errors";
import { area as calcArea } from "./utils";

const _dist2 = (p1: Position, p2: Position): number => {
  return (p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2;
};

const _perpendicular = (
  p1: Position,
  p2: Position,
  target: Position
): number => {
  const a = (p1[1] - p2[1]) / (p1[0] - p2[0]);
  const b = -a * p2[0] + p2[1];
  return Math.abs(a * target[0] - target[1] + b) / (a ** 2 + 1) ** 0.5;
};

const _rdpCandidates = (
  first: number,
  last: number,
  linearRing: Points,
  threshold: number,
  area: boolean
): {
  index: number;
  score: number;
}[] => {
  let memory = -Infinity;
  let index = -1;
  for (let i = first + 1; i < last; i++) {
    const a = area
      ? calcArea([
          linearRing[first],
          linearRing[i],
          linearRing[last],
          linearRing[first],
        ])
      : _perpendicular(linearRing[first], linearRing[last], linearRing[i]);
    if (a > memory) {
      memory = a;
      index = i;
    }
  }
  if (memory < threshold) return [];

  return [
    {
      index,
      score: memory,
    },
    ..._rdpCandidates(first, index, linearRing, threshold, area),
    ..._rdpCandidates(index, last, linearRing, threshold, area),
  ];
};

export interface rdpOptions {
  area?: boolean;
  threshold?: number;
  limit?: number;
}

export function rdp(linearRing: Points, userOptions?: rdpOptions): Points {
  /*
    Modified Ramer–Douglas–Peucker
  
    Original Algorithm
    https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm
    */
  validLinearRing(linearRing);
  const options = Object.assign(
    {
      area: false,
      threshold: 0.001,
      limit: Infinity,
    },
    userOptions
  );

  if (options.area) {
    if (options.threshold < 0 || options.threshold >= 1)
      throw new InvalidSimplifyError(
        "when area is true, threshold must be between 0 and 1."
      );
  } else {
    if (options.threshold < 0)
      throw new InvalidSimplifyError("threshold must be positive number.");
  }
  if (options.limit < 4)
    throw new InvalidSimplifyError("limit must be larger than 3.");

  const threshold = options.area
    ? calcArea(linearRing) * options.threshold
    : options.threshold;
  const first = 0;
  const last = linearRing.length - 1;
  let score = -Infinity;
  let midpoint = -1;
  for (let i = first + 1; i < last; i++) {
    const d2 = _dist2(linearRing[first], linearRing[i]);
    if (d2 > score) {
      score = d2;
      midpoint = i;
    }
  }
  let candidates = [
    ..._rdpCandidates(first, midpoint, linearRing, threshold, options.area),
    ..._rdpCandidates(midpoint, last, linearRing, threshold, options.area),
  ];
  if (options.limit < linearRing.length) {
    candidates.sort(function (a, b) {
      return a.score < b.score ? 1 : -1;
    });
    candidates = candidates.slice(0, options.limit - 3);
  }
  const candidateIndexes = [
    first,
    last,
    midpoint,
    ...candidates.map((v) => v.index),
  ];
  return linearRing.filter((_, i) => {
    return candidateIndexes.includes(i);
  });
}

export interface vwOptions {
  rate?: boolean;
  threshold?: number;
  limit?: number;
}

export function vw(linearRing: Points, userOptions?: vwOptions): Points {
  /*
    Modified Visvalingam–Whyatt
  
    Original Algorithm
    https://en.wikipedia.org/wiki/Visvalingam%E2%80%93Whyatt_algorithm
    */
  validLinearRing(linearRing);
  const options = Object.assign(
    {
      rate: false,
      threshold: 0.001,
      limit: Infinity,
    },
    userOptions
  );

  if (options.rate) {
    if (options.threshold < 0 || options.threshold >= 1)
      throw new InvalidSimplifyError(
        "when rate is true, threshold must be between 0 and 1."
      );
  } else {
    if (options.threshold < 0)
      throw new InvalidSimplifyError("threshold must be positive number.");
  }
  if (options.limit < 4)
    throw new InvalidSimplifyError("limit must be larger than 3.");

  const threshold = options.rate
    ? calcArea(linearRing) * options.threshold
    : options.threshold;

  const candidates = linearRing.map((point, i) => {
    if (i === 0 || i === linearRing.length - 1)
      return {
        score: Infinity,
        index: i,
      };

    return {
      score: calcArea([
        linearRing[i - 1],
        point,
        linearRing[i + 1],
        linearRing[i - 1],
      ]),
      index: i,
    };
  });

  while (candidates.length > 4) {
    let score = Infinity;
    let eliminate = -1;
    for (let i = 1; i < candidates.length - 1; i++) {
      if (candidates[i].score < score) {
        score = candidates[i].score;
        eliminate = i;
      }
    }
    if (candidates.length > options.limit || score < threshold) {
      if (eliminate - 2 >= 0) {
        const p1 = candidates[eliminate - 2].index;
        const p2 = candidates[eliminate - 1].index;
        const p3 = candidates[eliminate + 1].index;
        candidates[eliminate - 1].score = calcArea([
          linearRing[p1],
          linearRing[p2],
          linearRing[p3],
          linearRing[p1],
        ]);
      }
      if (eliminate + 2 <= candidates.length - 1) {
        const p1 = candidates[eliminate - 1].index;
        const p2 = candidates[eliminate + 1].index;
        const p3 = candidates[eliminate + 2].index;
        candidates[eliminate + 1].score = calcArea([
          linearRing[p1],
          linearRing[p2],
          linearRing[p3],
          linearRing[p1],
        ]);
      }
      candidates.splice(eliminate, 1);
    } else {
      break;
    }
  }
  const candidateIndexes = [...candidates.map((v) => v.index)];
  return linearRing.filter((_, i) => {
    return candidateIndexes.includes(i);
  });
}

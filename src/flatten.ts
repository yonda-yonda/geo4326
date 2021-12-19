import type { Position } from "geojson";
import { validLinearRing } from "./_validates";
import { Points, CutRing } from "./types";
import { linearInterpolationY } from "./calc";
import { InvalidSelfintersectionError } from "./errors";
import { selfintersection } from "./utils";

export type CrossingLat = {
  to: number;
  from: number;
  lat: number;
};

type CutArea = {
  overflowing: boolean;
  linearRing: Points;
};

export function _warpWithin(lon: number): number {
  while (lon < -180) lon = lon + 360;
  while (180 < lon) lon = lon - 360;
  return lon;
}

export function _isCrossingAntimeridian(lon1: number, lon2: number): boolean {
  /*
    The distance in the longitude between the points must be less than 180deg.

    lon1 = -10, lon2 = 10 -> False
    lon1 = 170, lon2 = 190 -> True
    lon1 = 170, lon2 = -170 -> True
  */
  if (Math.abs(lon1 - lon2) > 360) return true;
  lon1 = _warpWithin(lon1);
  lon2 = _warpWithin(lon2);

  if (Math.abs(lon1) === 180 || Math.abs(lon2) === 180) return false;

  if (lon1 * lon2 > 0) return false;

  return Math.abs(lon1 - lon2) > 180;
}

export function _crossingAntimeridianPointLat(
  p1: Position,
  p2: Position
): number {
  /*
    p1=[-150, 0], p2=[170, 20]) -> 15
    p1=[-20,-10], p2=[10, 170] -> 85
    p1=[-20, 66], p2=[10, 0]) -> 34
    p1=[-160, 32], p2=[170, 20]) -> 24
  */
  let [x1] = p1;
  let [x2] = p2;
  const [, y1] = p1;
  const [, y2] = p2;
  while (x1 < 0) x1 += 360;
  while (x2 < 0) x2 += 360;
  const bound = 180 * Math.floor(Math.max(x1, x2) / 180)

  return linearInterpolationY([x1, y1], [x2, y2], bound);
}

function _cutting(
  linearRing: Points,
  start: CrossingLat,
  end: CrossingLat
): CutArea {
  let ringIndex = start["to"] !== linearRing.length - 1 ? start["to"] : 0;
  const diff = linearRing[start["to"]][0] - linearRing[start["from"]][0];
  const r2l = Math.abs(diff) < 180 ? diff < 0 : diff > 0;
  const boundLon = r2l ? 180 * Math.ceil(linearRing[ringIndex][0] / 180) : 180 * Math.floor(linearRing[ringIndex][0] / 180)
  const rtn: CutArea = { overflowing: !r2l, linearRing: [] };

  rtn.linearRing.push([
    boundLon,
    _crossingAntimeridianPointLat(
      linearRing[start["from"]],
      linearRing[start["to"]]
    ),
  ]);
  rtn.linearRing.push(linearRing[start["to"]]);

  while (ringIndex !== end["from"]) {
    ringIndex = ringIndex + 1 !== linearRing.length - 1 ? ringIndex + 1 : 0;
    rtn.linearRing.push(linearRing[ringIndex]);
  }
  rtn.linearRing.push([
    boundLon,
    _crossingAntimeridianPointLat(
      linearRing[end["from"]],
      linearRing[end["to"]]
    ),
  ]);
  rtn.linearRing.push(rtn.linearRing[0]);
  return rtn;
}

type cutRingAtAntimeridianOptions = {
  overflowing?: boolean;
  allowSelfintersection?: boolean;
};

export function cutRingAtAntimeridian(
  linearRing: Points,
  userOptions: cutRingAtAntimeridianOptions = {}
): CutRing {
  /*
    When overflowing is True, points are right side of 180 degrees.
    The overflowing flag is used when recursive.
    The distance in the longitude between the points must be less than 180deg.
  */
  validLinearRing(linearRing);
  const options = Object.assign(
    {
      overflowing: false,
      allowSelfintersection: false,
    },
    userOptions
  );
  const crossingLats: CrossingLat[] = [];
  for (let i = 0; i < linearRing.length - 1; i++) {
    if (_isCrossingAntimeridian(linearRing[i][0], linearRing[i + 1][0])) {
      crossingLats.push({
        from: i,
        to: i + 1,
        lat: _crossingAntimeridianPointLat(linearRing[i], linearRing[i + 1]),
      });
    }
  }
  if (crossingLats.length < 2)
    return !options.overflowing
      ? {
        within: [linearRing],
        outside: [],
      }
      : {
        within: [],
        outside: [linearRing],
      };

  crossingLats.sort(function (a, b) {
    return b.lat - a.lat;
  });
  const start = crossingLats[0];
  const end = crossingLats[1];
  const ret: CutRing = {
    within: [],
    outside: [],
  };
  const cut1 = _cutting(linearRing, start, end);
  const result1 = cutRingAtAntimeridian(cut1.linearRing, {
    overflowing: cut1.overflowing,
    allowSelfintersection: options.allowSelfintersection,
  });
  ret.within = ret.within.concat(result1.within);
  ret.outside = ret.outside.concat(result1.outside);
  const cut2 = _cutting(linearRing, end, start);
  const result2 = cutRingAtAntimeridian(cut2.linearRing, {
    overflowing: cut2.overflowing,
    allowSelfintersection: options.allowSelfintersection,
  });
  ret.within = ret.within.concat(result2.within);
  ret.outside = ret.outside.concat(result2.outside);
  if (!options.allowSelfintersection) {
    ret.within.forEach((ring) => {
      if (selfintersection(ring)) throw new InvalidSelfintersectionError();
    });
    ret.outside.forEach((ring) => {
      if (selfintersection(ring)) throw new InvalidSelfintersectionError();
    });
  }
  return ret;
}

export function expandRingAtAntimeridian(linearRing: Points): Points {
  validLinearRing(linearRing);
  const crossingPoints: { from: number, to: number }[] = [];
  for (let i = 0; i < linearRing.length - 1; i++) {
    if (_isCrossingAntimeridian(linearRing[i][0], linearRing[i + 1][0])) {
      crossingPoints.push({
        from: i,
        to: i + 1,
      });
    }
  }

  if (crossingPoints.length < 2)
    return linearRing

  const ring = [...linearRing];

  let before = 0;
  for (let i = 0; i < crossingPoints.length; i++) {
    const startTo = crossingPoints[i].to;
    const startFrom = crossingPoints[i].from
    const warp = ring[startTo][0] * ring[startFrom][0] < 0;
    const endFrom = i < crossingPoints.length - 1 ? crossingPoints[i + 1].from : ring.length;

    if (warp) {
      if (ring[startTo][0] < 0) {
        for (let j = startTo; j < endFrom; j++) {
          ring[j][0] += 360;
        }
      }
      else {
        for (let j = before; j <= startFrom; j++) {
          ring[j][0] += 360;
        }
      }
    }
    before = endFrom;
  }
  return ring;
}
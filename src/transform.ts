import proj4 from "proj4";
import type { Feature, Position } from "geojson";
import { Points, CutRing } from "./types";
import { validLinearRing } from "./_validates";
import { isCcw, within, intersection } from "./utils";
import { CrossingLat, cutRingAtAntimeridian } from "./flatten";
import { linearInterpolationY, linearInterpolationPoints } from "./calc";
import {
  InvalidLinearRingEnclosingPoleError,
  EnclosingBothPolesError,
  InvalidBoundsError,
  NotAllowedWarpBoundsError,
  FalidCuttingAntimeridianError,
  NotAllowedCwLinearRingError,
} from "./errors";
import {
  CRS_EPSG4326,
  CRS_ARCTIC_POLAR_STEROGRAPHIC,
  CRS_ANTARCTIC_POLAR_STEROGRAPHIC,
} from "./constants";

export function _transform(
  points: Points,
  srcCrs: string,
  dstCrs: string
): Points {
  if (srcCrs === dstCrs) return points;
  return points.map(
    (p: Position): Position => {
      const transformed: Position = proj4(srcCrs, dstCrs, [p[0], p[1]]);
      return [...transformed, ...p.slice(2)];
    }
  );
}

export function _transformEnclosingPoleRing(
  linearRing: Points,
  srcCrs: string,
  partition: number,
  north: boolean
): Points {
  const length = linearRing.length - 1;
  const tempCRS = north
    ? CRS_ARCTIC_POLAR_STEROGRAPHIC
    : CRS_ANTARCTIC_POLAR_STEROGRAPHIC;
  const endY = north ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER;
  const poleLat = north ? 90 : -90;
  const polarSterographicLinearRing = _transform(linearRing, srcCrs, tempCRS);
  const crossingLats: CrossingLat[] = [];
  for (let i = 0; i < length; i++) {
    if (
      intersection(
        polarSterographicLinearRing[i],
        polarSterographicLinearRing[i + 1],
        [0, 0],
        [0, endY]
      )
    )
      crossingLats.push({
        from: i,
        to: i + 1,
        lat: linearInterpolationY(
          polarSterographicLinearRing[i],
          polarSterographicLinearRing[i + 1],
          0
        ),
      });
  }
  //not support linear ring that is not enclosing the pole and straddling the antimeridian many times.
  if (crossingLats.length !== 1)
    throw new InvalidLinearRingEnclosingPoleError();

  crossingLats.sort(function (a, b) {
    return a.lat - b.lat;
  });
  const crossingLat = north
    ? crossingLats[0]
    : crossingLats[crossingLats.length - 1];
  let ret: Points = [];
  for (let i = 0; i < length; i++) {
    if (i === crossingLat["from"]) {
      const transformed1 = _transform(
        linearInterpolationPoints(
          polarSterographicLinearRing[crossingLat["from"]],
          [0, crossingLat["lat"]],
          { partition }
        ),
        tempCRS,
        CRS_EPSG4326
      );
      ret = ret.concat(transformed1.slice(0, transformed1.length - 1));
      if (transformed1[0][0] >= 0) {
        ret = ret.concat([
          [180, transformed1[transformed1.length - 1][1]],
          [180, poleLat],
          [-180, poleLat],
          [-180, transformed1[transformed1.length - 1][1]],
        ]);
      } else {
        ret = ret.concat([
          [-180, transformed1[transformed1.length - 1][1]],
          [-180, poleLat],
          [180, poleLat],
          [180, transformed1[transformed1.length - 1][1]],
        ]);
      }
      const transformed2 = _transform(
        linearInterpolationPoints(
          [0, crossingLat["lat"]],
          polarSterographicLinearRing[crossingLat["to"]],
          { partition }
        ),
        tempCRS,
        CRS_EPSG4326
      );
      ret = ret.concat(transformed2.slice(1, transformed2.length - 1));
    } else {
      const transformed = _transform(
        linearInterpolationPoints(
          polarSterographicLinearRing[i],
          polarSterographicLinearRing[i + 1],
          { partition }
        ),
        tempCRS,
        CRS_EPSG4326
      );
      ret = ret.concat(transformed.slice(0, transformed.length - 1));
    }
  }
  ret.push(ret[0]);
  return ret;
}

export function transformRing(
  linearRing: Points,
  srcCrs: string,
  userOptions = {}
): Points {
  /*
    not support linear rings of including both poles.
  */
  validLinearRing(linearRing);

  const options = Object.assign(
    {
      partition: 0,
    },
    userOptions
  );
  const length = linearRing.length - 1;

  const northPole = _transform([[0, 90]], CRS_EPSG4326, srcCrs)[0];
  const enclosingNorthPole = within(northPole, linearRing);
  const southPole = _transform([[0, -90]], CRS_EPSG4326, srcCrs)[0];
  const enclosingSouthPole = within(southPole, linearRing);

  if (enclosingNorthPole && enclosingSouthPole)
    throw new EnclosingBothPolesError();
  if (enclosingNorthPole)
    return _transformEnclosingPoleRing(
      linearRing,
      srcCrs,
      options.partition,
      true
    );
  if (enclosingSouthPole)
    return _transformEnclosingPoleRing(
      linearRing,
      srcCrs,
      options.partition,
      false
    );

  let interpolatedLinearRing: Points = [];
  for (let i = 0; i < length; i++) {
    const transformed = linearInterpolationPoints(
      linearRing[i],
      linearRing[i + 1],
      {
        partition: options.partition,
      }
    );
    interpolatedLinearRing = interpolatedLinearRing.concat(
      transformed.slice(0, transformed.length - 1)
    );
  }
  interpolatedLinearRing.push(interpolatedLinearRing[0]);
  if (srcCrs === CRS_EPSG4326) return interpolatedLinearRing;

  return _transform(interpolatedLinearRing, srcCrs, CRS_EPSG4326);
}

export function transformBbox(
  srcBbox: number[],
  srcCrs: string,
  userOptions = {}
): number[] {
  /*
    input bbox is not allowed warp.
  */
  if (!(srcBbox.length === 4 || srcBbox.length === 6))
    throw new InvalidBoundsError();

  const options = Object.assign(
    {
      partition: 9,
      expand: false,
    },
    userOptions
  );

  const has_height = srcBbox.length === 6;
  const left = srcBbox[0];
  const bottom = srcBbox[1];
  const right = has_height ? srcBbox[3] : srcBbox[2];
  const top = has_height ? srcBbox[4] : srcBbox[3];

  if (right < left) throw new NotAllowedWarpBoundsError();

  const points: Points = transformRing(
    [
      [left, bottom],
      [right, bottom],
      [right, top],
      [left, top],
      [left, bottom],
    ],
    srcCrs,
    { partition: options.partition }
  );
  const ys = points.map((p) => {
    return p[1];
  });
  if (isCcw(points)) {
    const xs = points.map((p) => {
      return p[0];
    });
    if (srcBbox.length === 6)
      return [
        Math.min(...xs),
        Math.min(...ys),
        srcBbox[2],
        Math.max(...xs),
        Math.max(...ys),
        srcBbox[5],
      ];
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  }
  try {
    const bounds_ring: CutRing = cutRingAtAntimeridian(points);
    let xs1: number[] = [];
    bounds_ring.within.forEach((lenearRing: Points) => {
      xs1 = xs1.concat(
        lenearRing.map((p) => {
          return p[0];
        })
      );
    });
    let xs2: number[] = [];
    bounds_ring.outside.forEach((lenearRing: Points) => {
      xs2 = xs2.concat(
        lenearRing.map((p) => {
          return p[0];
        })
      );
    });
    if (srcBbox.length === 6)
      return [
        Math.min(...xs1),
        Math.min(...ys),
        srcBbox[2],
        options.expand ? Math.max(...xs2) + 360 : Math.max(...xs2),
        Math.max(...ys),
        srcBbox[5],
      ];
    return [
      Math.min(...xs1),
      Math.min(...ys),
      options.expand ? Math.max(...xs2) + 360 : Math.max(...xs2),
      Math.max(...ys),
    ];
  } catch {
    throw new FalidCuttingAntimeridianError();
  }
}

export function geojsonFromLinearRing(
  linearRing: Points,
  srcCrs: string,
  userOptions = {}
): Feature {
  if (!isCcw(linearRing)) throw new NotAllowedCwLinearRingError();

  const options = Object.assign(
    {
      partition: 9,
    },
    userOptions
  );
  const points = transformRing(linearRing, srcCrs, {
    partition: options.partition,
  });
  const ys = points.map((p) => {
    return p[1];
  });
  if (isCcw(points)) {
    const xs = points.map((p) => {
      return p[0];
    });
    return {
      type: "Feature",
      bbox: [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs),
        Math.max(...ys),
      ],
      properties: {},
      geometry: { type: "Polygon", coordinates: [points] },
    };
  }
  const ring = cutRingAtAntimeridian(points);
  let xs1: number[] = [];
  ring.within.forEach((lenearRing: Points) => {
    xs1 = xs1.concat(
      lenearRing.map((p) => {
        return p[0];
      })
    );
  });
  let xs2: number[] = [];
  ring.outside.forEach((lenearRing: Points) => {
    xs2 = xs2.concat(
      lenearRing.map((p) => {
        return p[0];
      })
    );
  });
  const coordinates: Position[][][] = [];
  coordinates.push(
    ring.within.map((r) => {
      return r;
    })
  );
  coordinates.push(
    ring.outside.map((r) => {
      return r;
    })
  );
  return {
    type: "Feature",
    bbox: [
      Math.min(...xs1),
      Math.min(...ys),
      Math.max(...xs2),
      Math.max(...ys),
    ],
    properties: {},
    geometry: {
      type: "MultiPolygon",
      coordinates,
    },
  };
}

export function geojsonFromCornerCoordinates(
  upperLeft: Position,
  lowerLeft: Position,
  upperRight: Position,
  lowerRight: Position,
  srcCrs: string,
  userOptions = {}
): Feature {
  const options = Object.assign(
    {
      partition: 9,
    },
    userOptions
  );
  return geojsonFromLinearRing(
    [upperLeft, lowerLeft, lowerRight, upperRight, upperLeft],
    srcCrs,
    { partition: options.partition }
  );
}

import type {
  Feature,
  Geometry,
  Polygon,
  MultiPolygon,
  Position,
  LineString,
  MultiLineString,
} from "geojson";
import { validNumber, validPoint, validLinearRing } from "./_validates";
import { Points } from "./types";
import { SEMEMAJOR_AXIS_WGS84, FLATTENING_WGS84 } from "./constants";
import {
  NotConvergeCalculationError,
  NotSupportMeasuringDistance,
  NotSupportMeasuringArea,
} from "./errors";
import { _eq, _toRadians } from "./utils";

export interface DistanceOptions {
  semimajorAxis?: number;
  flattening?: number;
  truncation?: number;
  maxCount?: number;
}

export interface AreaOptions {
  semimajorAxis?: number;
  flattening?: number;
}

const _distance = (
  p1: Position,
  p2: Position,
  userOptions: DistanceOptions = {}
): number => {
  // https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/algorithm/bl2st/bl2st.htm
  // https://www.tandfonline.com/doi/abs/10.1179/sre.1996.33.261.461
  validPoint(p1);
  validPoint(p2);

  const options = Object.assign(
    {
      semimajorAxis: SEMEMAJOR_AXIS_WGS84,
      flattening: FLATTENING_WGS84,
      truncation: 1e-15,
      maxCount: 100,
    },
    userOptions
  );
  validNumber(options.semimajorAxis);
  validNumber(options.flattening);
  validNumber(options.truncation);
  validNumber(options.maxCount);

  const lon1 = _toRadians(p1[0]);
  const lat1 = _toRadians(p1[1]);
  const lon2 = _toRadians(p2[0]);
  const lat2 = _toRadians(p2[1]);
  const a = options.semimajorAxis;
  const f = 1 / options.flattening;
  const lonDiff = lon2 - lon1;
  let lonDiffWarp = lonDiff;
  if (lonDiff > Math.PI) lonDiffWarp -= 2 * Math.PI;
  else if (lonDiff < -Math.PI) lonDiffWarp += 2 * Math.PI;

  const L = Math.abs(lonDiffWarp);
  const L_d = Math.PI - L;
  const Sigma = lat1 + lat2;
  const u1 =
    lonDiffWarp >= 0
      ? Math.atan((1 - f) * Math.tan(lat1))
      : Math.atan((1 - f) * Math.tan(lat2));
  const u2 =
    lonDiffWarp >= 0
      ? Math.atan((1 - f) * Math.tan(lat2))
      : Math.atan((1 - f) * Math.tan(lat1));
  const Sigma_d = u1 + u2;
  const Delta_d = u2 - u1;
  const xi = Math.cos(Sigma_d / 2);
  const xi_d = Math.sin(Sigma_d / 2);
  const eta = Math.sin(Delta_d / 2);
  const eta_d = Math.cos(Delta_d / 2);
  const x = Math.sin(u1) * Math.sin(u2);
  const y = Math.cos(u1) * Math.cos(u2);
  const c = y * Math.cos(L) + x;
  const epsilon = (f * (2 - f)) / (1 - f) ** 2;
  let theta, zone;
  if (c >= 0) {
    theta = L * (1 + f * y);
    zone = 1;
  } else if (c >= -Math.cos(_toRadians(3) * Math.cos(u1))) {
    theta = L_d;
    zone = 2;
  } else {
    zone = 3;
    const R =
      f *
      Math.PI *
      Math.cos(u1) ** 2 *
      (1 -
        (f * (1 + f) * Math.sin(u1) ** 2) / 4 +
        (3 / 16) * f ** 2 * Math.sin(u1) ** 4);
    const d1 = L_d * Math.cos(u1) - R;
    const d2 = Math.abs(Sigma_d) + R;
    const q = L_d / (f * Math.PI);
    const f1 = (f * (1 + f / 2)) / 4;
    const gamma0 = q + f1 * q - f1 * q ** 3;

    if (_eq(Sigma, 0)) {
      if (d1 > 0) {
        //b1
        theta = L_d;
      } else {
        // b2, b3
        const Gamma = Math.sin(u1) ** 2;
        const n0 =
          (epsilon * Gamma) / (Math.sqrt(1 + epsilon * Gamma) + 1) ** 2;
        const A = (1 + n0) * (1 + (5 / 4) * n0 ** 2);
        return (1 - f) * a * A * Math.PI;
      }
    } else {
      // a
      const A0 = Math.atan(d1 / d2);
      const B0 = Math.asin(R / Math.sqrt(d1 ** 2 + d2 ** 2));
      const psi = A0 + B0;
      const j = gamma0 / Math.cos(u1);
      const k =
        ((1 + f1) * Math.abs(Sigma_d) * (1 - f * y)) / (f * Math.PI * y);
      const j1 = j / (1 + k * Math.sin(psi));
      const psi_d = Math.asin(j1);
      const psi_dd = Math.asin((j1 * Math.cos(u1)) / Math.cos(u2));
      theta =
        2 *
        Math.atan(
          (Math.tan((psi_d + psi_dd) / 2) * Math.sin(Math.abs(Sigma_d) / 2)) /
          Math.cos(Delta_d / 2)
        );
    }
  }

  let cnt = 0;
  let Gamma = 0,
    sigma = 0,
    zeta = 0,
    J = 0,
    K = 0;
  while (cnt < options.maxCount) {
    const g =
      zone === 1
        ? Math.sqrt(
          eta ** 2 * Math.cos(theta / 2) ** 2 +
          xi ** 2 * Math.sin(theta / 2) ** 2
        )
        : Math.sqrt(
          eta ** 2 * Math.sin(theta / 2) ** 2 +
          xi ** 2 * Math.cos(theta / 2) ** 2
        );
    const h =
      zone === 1
        ? Math.sqrt(
          eta_d ** 2 * Math.cos(theta / 2) ** 2 +
          xi_d ** 2 * Math.sin(theta / 2) ** 2
        )
        : Math.sqrt(
          eta_d ** 2 * Math.sin(theta / 2) ** 2 +
          xi_d ** 2 * Math.cos(theta / 2) ** 2
        );
    sigma = 2 * Math.atan(g / h);
    J = 2 * g * h;
    K = h ** 2 - g ** 2;
    const gamma = (y * Math.sin(theta)) / J;
    Gamma = 1 - gamma ** 2;
    zeta = Gamma * K - 2 * x;
    const zeta_d = zeta + x;
    const D = (f * (1 + f)) / 4 - (3 / 16) * f ** 2 * Gamma;
    const E =
      (1 - D * Gamma) *
      f *
      gamma *
      (sigma + D * J * (zeta + D * K * (2 * zeta ** 2 - Gamma ** 2)));
    const F = zone === 1 ? theta - L - E : theta - L_d + E;
    const G =
      f * gamma ** 2 * (1 - 2 * D * Gamma) +
      ((f * zeta_d * sigma) / J) * (1 - D * Gamma + (f * gamma ** 2) / 2) +
      (f ** 2 * zeta * zeta_d) / 4;
    theta -= F / (1 - G);
    if (Math.abs(F) < options.truncation) break;
    cnt += 1;
  }
  if (cnt >= options.maxCount) throw new NotConvergeCalculationError();

  const n0 = (epsilon * Gamma) / (Math.sqrt(1 + epsilon * Gamma) + 1) ** 2;
  const A = (1 + n0) * (1 + (5 / 4) * n0 ** 2);
  const B =
    (epsilon * (1 - (3 * n0 ** 2) / 8)) /
    (Math.sqrt(1 + epsilon * Gamma) + 1) ** 2;
  return (
    (1 - f) *
    a *
    A *
    (sigma -
      B *
      J *
      (zeta -
        (B *
          (K * (Gamma ** 2 - 2 * zeta ** 2) -
            (B * zeta * (1 - 4 * K ** 2) * (3 * Gamma ** 2 - 4 * zeta ** 2)) /
            6)) /
        4))
  );
};

const _linestringDistance = (
  geometry: LineString,
  userOptions: DistanceOptions = {}
): number => {
  return _arrayDistance(geometry.coordinates, userOptions);
};

const _multiLinestringPolygonDistance = (
  geometry: Polygon | MultiLineString,
  userOptions: DistanceOptions = {}
): number => {
  let ret = 0;
  for (let i = 0; i < geometry.coordinates.length; i++) {
    ret += _arrayDistance(geometry.coordinates[i], userOptions);
  }
  return ret;
};

const _multiPolygonDistance = (
  geometry: MultiPolygon,
  userOptions: DistanceOptions = {}
): number => {
  let ret = 0;
  for (let i = 0; i < geometry.coordinates.length; i++) {
    ret += _multiLinestringPolygonDistance(
      {
        type: "Polygon",
        coordinates: geometry.coordinates[i],
      },
      userOptions
    );
  }
  return ret;
};

const _arrayDistance = (
  points: Position[],
  userOptions: DistanceOptions = {}
): number => {
  let ret = 0;
  for (let i = 0; i < points.length - 1; i++) {
    ret += _distance(points[i], points[i + 1], userOptions);
  }
  return ret;
};

export function distance(
  data: Points | Feature | Geometry,
  userOptions: DistanceOptions = {}
): number {
  if (Array.isArray(data)) {
    return _arrayDistance(data, userOptions);
  }
  switch (data?.type) {
    case "Feature":
      return distance(data.geometry, userOptions);
    case "LineString":
      return _linestringDistance(data, userOptions);
    case "MultiLineString":
      return _multiLinestringPolygonDistance(data, userOptions);
    case "Polygon":
      return _multiLinestringPolygonDistance(data, userOptions);
    case "MultiPolygon":
      return _multiPolygonDistance(data, userOptions);
  }
  throw new NotSupportMeasuringDistance();
}

const _latitudeBelt = (latRad: number, e: number): number => {
  const v = e * Math.sin(latRad);
  return v / (1 - v ** 2) + Math.atanh(v);
};
const _authalicLatitude = (latRad: number, e: number): number => {
  return Math.asin(_latitudeBelt(latRad, e) / _latitudeBelt(Math.PI / 2, e));
};

const _haversine = (
  lonRad1: number,
  latRad1: number,
  lonRad2: number,
  latRad2: number
): number => {
  return (
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((latRad1 - latRad2) / 2) ** 2 +
        Math.cos(latRad1) *
        Math.cos(latRad2) *
        Math.sin((lonRad1 - lonRad2) / 2) ** 2
      )
    )
  );
};

const _area = (linearRing: Points, userOptions: AreaOptions = {}): number => {
  // https://maps.gsi.go.jp/help/pdf/calc_area.pdf
  validLinearRing(linearRing);

  const options = Object.assign(
    {
      semimajorAxis: SEMEMAJOR_AXIS_WGS84,
      flattening: FLATTENING_WGS84,
    },
    userOptions
  );
  validNumber(options.semimajorAxis);
  validNumber(options.flattening);

  const f = 1 / options.flattening;
  const e2 = f * (2 - f);
  const e = Math.sqrt(e2);
  const r2 =
    (_latitudeBelt(Math.PI / 2, e) / 2) *
    options.semimajorAxis ** 2 *
    (1 / e - e);
  let area = 0;
  const lon0 = _toRadians(linearRing[0][0]);
  const lat0 = _authalicLatitude(_toRadians(linearRing[0][1]), e);
  let lon1 = _toRadians(linearRing[1][0]);
  let lat1 = _authalicLatitude(_toRadians(linearRing[1][1]), e);

  const l = linearRing.length - 2;
  for (let i = 1; i < l; i++) {
    const lon2 = _toRadians(linearRing[i + 1][0]);
    const lat2 = _authalicLatitude(_toRadians(linearRing[i + 1][1]), e);

    const prime =
      Math.cos(lat0) *
        Math.cos(lon0) *
        Math.cos(lat1) *
        Math.sin(lon1) *
        Math.sin(lat2) +
        Math.cos(lat1) *
        Math.cos(lon1) *
        Math.cos(lat2) *
        Math.sin(lon2) *
        Math.sin(lat0) +
        Math.cos(lat2) *
        Math.cos(lon2) *
        Math.cos(lat0) *
        Math.sin(lon0) *
        Math.sin(lat1) -
        Math.cos(lat2) *
        Math.cos(lon2) *
        Math.cos(lat1) *
        Math.sin(lon1) *
        Math.sin(lat0) -
        Math.cos(lat1) *
        Math.cos(lon1) *
        Math.cos(lat0) *
        Math.sin(lon0) *
        Math.sin(lat2) -
        Math.cos(lat0) *
        Math.cos(lon0) *
        Math.cos(lat2) *
        Math.sin(lon2) *
        Math.sin(lat1) >
        0
        ? 1
        : -1;
    const d1 = _haversine(lon0, lat0, lon1, lat1);
    const d2 = _haversine(lon1, lat1, lon2, lat2);
    const d3 = _haversine(lon2, lat2, lon0, lat0);
    const s = (d1 + d2 + d3) / 2;
    area +=
      prime *
      4 *
      Math.atan(
        Math.sqrt(
          Math.abs(
            Math.tan(s / 2) *
            Math.tan((s - d1) / 2) *
            Math.tan((s - d2) / 2) *
            Math.tan((s - d3) / 2)
          )
        )
      );
    lon1 = lon2;
    lat1 = lat2;
  }
  return Math.abs(r2 * area);
};

const _polygonArea = (polygon: Polygon, userOptions: AreaOptions): number => {
  let ret = 0;
  if (Array.isArray(polygon?.coordinates)) {
    ret += _area(polygon.coordinates[0], userOptions);
    for (let i = 1; i < polygon.coordinates.length; i++) {
      ret -= _area(polygon.coordinates[i], userOptions);
    }
  }
  return ret;
};

const _multiPolygonArea = (
  polygon: MultiPolygon,
  userOptions: AreaOptions
): number => {
  let ret = 0;
  if (Array.isArray(polygon?.coordinates)) {
    for (let i = 0; i < polygon.coordinates.length; i++)
      ret += _polygonArea(
        {
          type: "Polygon",
          coordinates: polygon.coordinates[i],
        },
        userOptions
      );
  }
  return ret;
};

export function area(
  data: Points | Feature | Geometry,
  userOptions: AreaOptions = {}
): number {
  if (Array.isArray(data)) {
    return _area(data, userOptions);
  }
  switch (data?.type) {
    case "Feature":
      return area(data.geometry, userOptions);
    case "Polygon":
      return _polygonArea(data, userOptions);
    case "MultiPolygon":
      return _multiPolygonArea(data, userOptions);
  }
  throw new NotSupportMeasuringArea();
}

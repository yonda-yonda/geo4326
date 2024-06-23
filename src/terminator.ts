import { Feature, MultiPolygon } from "geojson";

const getJulianDate = (date: Date | number): number => {
  // https://www5d.biglobe.ne.jp/~noocyte/Programming/GregorianAndJulianCalendars.html
  const d = date instanceof Date ? date.getTime() : date;
  return d / 86400000 + 2440587.5;
}

const getGreenwichMeanSiderealTime = (jd: number): number => {
  // https://aa.usno.navy.mil/faq/GAST
  return (18.697374558 + 24.06570982441908 * (jd - 2451545)) % 24;
}

const getSunEclipticLongitude = (jd: number): number => {
  // https://en.wikipedia.org/wiki/Position_of_the_Sun
  const n = jd - 2451545;
  const L = (280.46 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;

  // radians
  return (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI / 180;
}

const getEclipticObliquity = (jd: number): number => {
  // https://ja.wikipedia.org/wiki/%E9%BB%84%E9%81%93%E5%82%BE%E6%96%9C%E8%A7%92
  const t = (jd - 2451545) / 36525;

  // radians
  return ((84381.406 - 46.836769 * t - 0.00059 * t ** 2 + 0.001813 * t ** 3) / 3600) * Math.PI / 180;
}

const getSunEquatorialPosition = (longitude: number, obliquity: number): number[] => {
  // 日の出・日の入りの計算 天体の出没時刻の求め方 長沢工著 ISBN4-8052-0634-9 p74
  const delta =
    Math.asin(Math.sin(longitude) * Math.sin(obliquity)); // 赤緯 -90deg to 90deg
  const alpha = Math.atan2(Math.sin(longitude) * Math.cos(obliquity) / Math.cos(delta), Math.cos(longitude) / Math.cos(delta)); // 赤経 -180deg to 180deg

  // radians
  return [alpha, delta];
}

const getTwilight = (t: string): number => {
  switch (t) {
    case "civil": {
      return -6;
    }
    case "nautical": {
      return -12;
    }
    case "astronomical": {
      return -18;
    }
    default: {
      return 0;
    }
  }
};

export interface NightPolygonOptions {
  division?: number;
  elevation?: number | "civil" | "nautical" | "astronomical"; // degrees or enum
  eps?: number;
}

export const night = (date: Date | string, options?: NightPolygonOptions): Feature<MultiPolygon> => {
  const { division, elevation, eps } = Object.assign({ division: 360, elevation: 0, eps: 1e-8 }, options);

  const d = date instanceof Date ? date : new Date(date);

  const elevationDegree = typeof elevation === "string" ? getTwilight(elevation) : elevation;
  if (90 < elevationDegree || 0 < elevationDegree) throw new RangeError();
  const e = elevationDegree * Math.PI / 180

  const jd = getJulianDate(d);
  const gmst = getGreenwichMeanSiderealTime(jd);

  const sunEclipticLongitude = getSunEclipticLongitude(jd); // 黄経
  const eclipticObliquity = getEclipticObliquity(jd); // 黄道傾角
  const [alpha, delta] = getSunEquatorialPosition(sunEclipticLongitude, eclipticObliquity);

  const longlats: number[][][][] = [];

  const diffDeg = 360 / division;
  if (Math.cos(delta) === 0 || e === 0) {
    const path: number[][] = [];

    for (let i = 0; i <= division; i++) {
      const longitude = i === division ? 180 : -180 + diffDeg * i;
      const hourAngle = gmst * 15 * Math.PI / 180 + longitude * Math.PI / 180 - alpha;

      if (e === 0) {
        if (delta === 0) {
          if (Math.cos(hourAngle) === 0) {
            path.push([longitude >= 0 ? longitude - eps : longitude + eps, 0]);
          } else {
            path.push([longitude, 0]);
          }
        } else {
          const lat = Math.atan(-Math.cos(hourAngle) / Math.tan(delta));
          path.push([longitude, lat * 180 / Math.PI]);
        }
      } else {
        const lat = Math.asin(Math.sin(e) / Math.sin(delta));
        path.push([longitude, lat * 180 / Math.PI]);
      }
    }
    const latitude = delta > 0 ? -90 : 90;
    path.push([180, latitude]);
    path.push([-180, latitude]);
    path.unshift([-180, latitude]);
    if (delta)
      path.reverse();
    longlats.push([path]);

  } else {
    let upper: number[][] = [];
    let lower: number[][] = [];

    for (let i = 0; i <= division; i++) {
      let longitude = i === division ? 180 : -180 + diffDeg * i;
      let hourAngle = gmst * 15 * Math.PI / 180 + longitude * Math.PI / 180 - alpha;
      if (Math.cos(hourAngle) === 0) {
        longitude = longitude >= 0 ? longitude - eps : longitude + eps
        hourAngle = gmst * 15 * Math.PI / 180 + longitude * Math.PI / 180 - alpha;
      }

      const A = Math.cos(delta) * Math.cos(hourAngle);
      const B = -Math.sin(delta);
      const C = Math.sin(e);
      const D = A ** 2 + B ** 2 - C ** 2;

      if (D >= 0) {
        const x1 = (-B * C + A * Math.sqrt(D)) / (A ** 2 + B ** 2);
        const x2 = (-B * C - A * Math.sqrt(D)) / (A ** 2 + B ** 2);

        if ((C + x1 * B) * A > 0) {
          const lat1 = Math.asin(x1);
          upper.push([longitude, lat1 * 180 / Math.PI]);
        }

        if ((C + x2 * B) * A > 0) {
          const lat2 = Math.asin(x2);
          lower.push([longitude, lat2 * 180 / Math.PI]);
        }
      }
      if (D < 0 || i === division) {
        const latitude = delta > 0 ? -90 : 90;
        let path: number[][] = [];
        if (upper.length > 0) {
          if (lower.length > 0) {
            path = [...lower, ...upper.reverse(), lower[0]];
          } else {
            path = [...upper];
            path.push([path[path.length - 1][0], latitude]);
            path.push([path[0][0], latitude]);
            path.unshift([path[0][0], latitude]);
            path.reverse();
          }
        } else {
          if (lower.length > 0) {
            path = [...lower];
            path.push([path[path.length - 1][0], latitude]);
            path.push([path[0][0], latitude]);
            path.unshift([path[0][0], latitude]);
          }
        }

        if (path.length > 0) {
          upper = [];
          lower = [];
          longlats.push([path]);
        }
      }
    }
  }

  return {
    type: "Feature",
    properties: {
      "datetime": d.toISOString(),
      "elevation": elevationDegree
    },
    geometry: {
      type: "MultiPolygon",
      coordinates: longlats
    }
  }
}
# satellite

## nadir

calculate the position (lon / lat) of TLE's satellite at that time.

```JavaScript
import { satellite } from "geo4326";

const tle = [
  "1 39634U 14016A   23261.85348622  .00000345  00000+0  82867-4 0  9995",
  "2 39634  98.1824 267.8728 0001359  89.0679 271.0677 14.59199306503843",
];

const date = new Date("2023-09-21T20:00:00Z");

satellite.nadir(tle1[0], tle1[1], date);
// [152.63639371243076, 15.4476525220903]
```

#### props

| Name | Type   | Description                 |
| ---- | ------ | --------------------------- |
| tle1 | string | **REQUIRED.** TLE's line 1. |
| tle2 | string | **REQUIRED.** TLE's line 2. |
| date | Date   | **REQUIRED.** target time.  |

#### return

[Position](./TYPES.md#position) calculated lon / lat.

## subSatelliteTrack

calculate subsatellite tracks.

```JavaScript
import { satellite } from "geo4326";

const tle = [
  "1 39634U 14016A   23261.85348622  .00000345  00000+0  82867-4 0  9995",
  "2 39634  98.1824 267.8728 0001359  89.0679 271.0677 14.59199306503843",
];

const start = new Date("2023-09-21T00:00:00Z");
const end = new Date("2023-09-21T02:00:00Z")

satellite.subSatelliteTrack(tle1[0], tle1[1], start, end, {
  split: 180
});
// [
//   [
//     [151.09982420070625, 17.44486529599897],
//     [151.7044410985543, 17.35760317516449],
//     ...,
//   ]
// ]
```

#### props

| Name          | Type   | Description                            |
| ------------- | ------ | -------------------------------------- |
| tle1          | string | **REQUIRED.** TLE's line 1.            |
| tle2          | string | **REQUIRED.** TLE's line 2.            |
| start         | Date   | **REQUIRED.** start time.              |
| end           | Date   | **REQUIRED.** end time.                |
| options       | object | optional params.                       |
| options.split | number | dt = orbitperiod / split (DEFAULT=360) |

#### return

[Points](./TYPES.md#points)[] subsatellite tracks.

## footprint

calculate footprint at that time.

```JavaScript
import { satellite } from "geo4326";

const tle = [
  "1 39634U 14016A   23261.85348622  .00000345  00000+0  82867-4 0  9995",
  "2 39634  98.1824 267.8728 0001359  89.0679 271.0677 14.59199306503843",
];

const date = new Date("2023-09-21T20:00:00Z");

satellite.footprint(tle1[0], tle1[1], date, {
  split: 360
});
// [
//   [151.09982420070625, 17.44486529599897],
//   [151.7044410985543, 17.35760317516449],
//   [152.30532939420436, 17.270787457830412],
//   ...,
//   [151.09982420070625, 17.44486529599897],
// ]
```

#### props

| Name                                                           | Type     | Description                                                                      |
| -------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| tle1                                                           | string   | **REQUIRED.** TLE's line 1.                                                      |
| tle2                                                           | string   | **REQUIRED.** TLE's line 2.                                                      |
| date                                                           | Date     | **REQUIRED.** target time.                                                       |
| options                                                        | object   | optional params.                                                                 |
| options.insert                                                 | number   | number of insert points on an each edge. (DEFAULT=5)                             |
| options.fov                                                    | number[] | virtual field-of-view. [along track, cross track] in degrees. (DEFAULT=[15, 15]) |
| options.a                                                      | number   |
| semi-major axis of central celestial body (DEFAULT=6378.137)   |
| options.f                                                      | number   |
| oblateness of central celestial body (DEFAULT=1/298.257223563) |

#### return

linearRing([Points](./TYPES.md#points))

## accessArea

calculate accessAreas.

```JavaScript
import { satellite } from "geo4326";

const tle = [
  "1 39634U 14016A   23261.85348622  .00000345  00000+0  82867-4 0  9995",
  "2 39634  98.1824 267.8728 0001359  89.0679 271.0677 14.59199306503843",
];

const start = new Date("2023-09-21T00:00:00Z");
const end = new Date("2023-09-21T02:00:00Z")

satellite.accessArea(tle1[0], tle1[1], start, end, {
  roll: 10
});
// [
//   [
//     [157.98030956863883, -51.91969576687542],
//     [157.5063354036139, -52.85553717614471],
//     [157.0139936757608, -53.789612020432095],
//     [156.50184187118492, -54.721800469975],
//     [155.9682899282548, -55.651969920192],
//     ...,
//   ]
// ]
```

#### props

| Name    | Type   | Description                 |
| ------- | ------ | --------------------------- |
| tle1    | string | **REQUIRED.** TLE's line 1. |
| tle2    | string | **REQUIRED.** TLE's line 2. |
| start   | Date   | **REQUIRED.** start time.   |
| end     | Date   | **REQUIRED.** end time.     |
| options | object | optional params.            |

| options.split | number | dt = orbitperiod / split (DEFAULT=360) |
| options.roll | number | roll angle in degrees. (DEFAULT=10) |
| options.a | number |
| semi-major axis of central celestial body (DEFAULT=6378.137) |
| options.f | number |
| oblateness of central celestial body (DEFAULT=1/298.257223563) |

#### return

linearRing([Points](./TYPES.md#points))[]

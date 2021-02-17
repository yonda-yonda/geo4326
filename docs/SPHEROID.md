# spheroid

## distance

```JavaScript
import { spheroid } from "geo4326";
spheroid.distance([
  [170.08785502777778, 36.10377477777778],
  [129.74475044444443, 35.65502847222223],
])
// 3616673.1034550117
```

#### props

| Name                  | Type                                           | Description                                                                                          |
| --------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| data                  | [Points](./TYPES.md#points), Feature, Geometry | **REQUIRED.** measure data. GeoJSON(LineString, MultiLineString, Polygon, MultiPolygon) is supprted. |
| options               | object                                         | optional params.                                                                                     |
| options.semimajorAxis | number                                         | Semimajor axis of reference ellipsoid model. Default is 6378137 (WGS84).                             |
| options.flattening    | number                                         | Flattening of reference ellipsoid model. Default is 298.25722356 (WGS84).                            |
| options.truncation    | number                                         | truncation error (DEFAULT=1e-15)                                                                     |
| options.maxCount      | number                                         | maximum number of iterations (DEFAULT=100)                                                           |

#### return

number (meter)

## area

```JavaScript
import { spheroid } from "geo4326";
spheroid.area([
  [-4.921875000000001, 29.53522956294847],
  [62.57812500000001, 76.01609366420996],
  [112.50000000000001, -55.37911044801049],
  [-4.921875000000001, 29.53522956294847],
])
// 96275969765399.52
```

#### props

| Name                  | Type                                           | Description                                                                                       |
| --------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| data                  | [Points](./TYPES.md#points), Feature, Geometry | **REQUIRED.** measure data. GeoJSON(Polygon, MultiPolygon) is supprted. Points must be linerRing. |
| options               | object                                         | optional params.                                                                                  |
| options.semimajorAxis | number                                         | Semimajor axis of reference ellipsoid model. Default is 6378137 (WGS84).                          |
| options.flattening    | number                                         | Flattening of reference ellipsoid model. Default is 298.25722356 (WGS84).                         |

#### return

number (square meter)

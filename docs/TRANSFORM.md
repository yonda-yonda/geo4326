# transform

## transformRing

```JavaScript
import { transform } from "geo4326";
transform.transformRing(
  [
    [382200, 2512500],
    [382200, 2279400],
    [610500, 2279400],
    [610500, 2512500],
    [382200, 2512500],
  ],
  "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs"
)
// [
//     [85.85296718933643, 22.715665870841406],
//     [85.86949772758247, 20.610041795245515],
//     [88.06045501053289, 20.610485722030123],
//     [88.07596179098903, 22.716159863683806],
//     [85.85296718933643, 22.715665870841406],
// ]
```

### props

| Name              | Type                        | Description                                           |
| ----------------- | --------------------------- | ----------------------------------------------------- |
| linearRing        | [Points](./TYPES.md#points) | **REQUIRED.** LinearRing.                             |
| srcCrs            | string, number              | **REQUIRED.** proj4string of source CRS or EPSG code. |
| options           | object                      | optional params.                                      |
| options.partition | number                      | Number of cutting each edge. (DEFAULT=0)              |

### return

[Points](./TYPES.md#points) transformed to EPSG:4326

## transformBbox

```JavaScript
import { transform } from "geo4326";
transform.transformRing(
  [382200, 2279400, 610500, 2512500],
  "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs"
)
// [
//     85.85296718933643,
//     20.610041795245515,
//     88.07596179098903,
//     22.71977571380184,
// ]
```

### props

| Name              | Type                        | Description                                                      |
| ----------------- | --------------------------- | ---------------------------------------------------------------- |
| srcBbox           | [Points](./TYPES.md#points) | **REQUIRED.** Source Bbox.                                       |
| srcCrs            | string, number              | **REQUIRED.** proj4string of source CRS or EPSG code.            |
| options           | object                      | optional params.                                                 |
| options.partition | number                      | Number of cutting each edge. Recommends more than 9. (DEFAULT=9) |

### return

bbox(number[]) transformed to EPSG:4326

## geojsonFromCornerCoordinates

```JavaScript
import { transform } from "geo4326";
transform.geojsonFromCornerCoordinates(
    [508800.0, 7247400.0],
    [508800.0, 7001100.0],
    [753000.0, 7247400.0],
    [753000.0, 7001100.0],
    "+proj=utm +zone=60 +datum=WGS84 +units=m +no_defs",
    {
        partition: 1,
    }
)
// {
//     type: "Feature",
//     bbox: [
//       177.17456390562776,
//       63.05068519969726,
//       -177.57860702499977,
//       65.34932256544839,
//     ],
//     properties: {},
//     geometry: {
//       type: "MultiPolygon",
//       coordinates: [
//         [
//           [
//             [180, 65.31807448056006],
//             [179.81058927281356, 65.323257946911],
//             [177.18908505580518, 65.34932256544839],
//             [177.18150083071316, 64.24429821916638],
//             [177.17456390562776, 63.13910500179646],
//             [179.59505058865196, 63.11547654369982],
//             [180, 63.104599649017885],
//             [180, 65.31807448056006],
//           ],
//         ],
//         [
//           [
//             [-180, 63.104599649017885],
//             [-177.99275205341496, 63.05068519969726],
//             [-177.79484203871405, 64.15151244109893],
//             [-177.57860702499977, 65.25180997065199],
//             [-180, 65.31807448056006],
//             [-180, 63.104599649017885],
//           ],
//         ],
//       ],
//     },
//   });
// }
```

### props

| Name              | Type                            | Description                                                      |
| ----------------- | ------------------------------- | ---------------------------------------------------------------- |
| upperLeft         | [Position](./TYPES.md#position) | **REQUIRED.** Source upper left corner.                          |
| lowerLeft         | [Position](./TYPES.md#position) | **REQUIRED.** Source lower left corner.                          |
| upperRight        | [Position](./TYPES.md#position) | **REQUIRED.** Source upper right corner.                         |
| lowerRight        | [Position](./TYPES.md#position) | **REQUIRED.** Source lower right corner.                         |
| srcCrs            | string, number                  | **REQUIRED.** proj4string of source CRS or EPSG code.            |
| options           | object                          | optional params.                                                 |
| options.partition | number                          | Number of cutting each edge. Recommends more than 9. (DEFAULT=9) |

### return

geojson transformed to EPSG:4326

## geojsonFromLinearRing

```JavaScript
import { transform } from "geo4326";
transform.geojsonFromLinearRing([
  [508800.0, 7247400.0],
  [508800.0, 7001100.0],
  [753000.0, 7001100.0],
  [753000.0, 7247400.0],
  [508800.0, 7247400.0],
], "+proj=utm +zone=60 +datum=WGS84 +units=m +no_defs");
// {
//    "type":"Feature",
//    "bbox":[
//       177.17456390562776,
//       63.05068519969726,
//       -177.57860702499977,
//       65.34932256544839
//    ],
//    "properties":{},
//    "geometry":{
//       "type":"MultiPolygon",
//       "coordinates":[
//          [
//             [
//                [
//                   180,
//                   65.31939602795103
//                ],
//                [
//                   179.81058927281356,
//                   65.323257946911
//                ],
//                // ...
//                [
//                   180,
//                   65.31939602795103
//                ]
//             ]
//          ],
//          [
//             [
//                [
//                   -180,
//                   63.107371495051154
//                ],
//                [
//                   -179.92160135394892,
//                   63.105802348825904
//                ],
//                // ...
//                [
//                   -180,
//                   63.107371495051154
//                ]
//             ]
//          ]
//       ]
//    }
// }
```

### props

| Name              | Type                        | Description                                                                                 |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| linearRing        | [Points](./TYPES.md#points) | **REQUIRED.** LinearRing.                                                                   |
| srcCrs            | string, number              | **REQUIRED.** proj4string of source CRS or EPSG code.                                       |
| options           | object                      | optional params.                                                                            |
| options.partition | number                      | Number of cutting each edge. Recommends more than 9. (DEFAULT=9)                            |
| options.expand    | boolean                     | If True, linearRing straddling the Antimeridian convert to Polygon, otherwise MultiPolygon. |

### return

geojson transformed to EPSG:4326

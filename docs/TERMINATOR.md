# terminator

## night

```JavaScript
import { terminator } from "geo4326";
terminator.night("2023-10-01T07:00:00Z");
//   {
//     geometry: {
//       coordinates: [
//         [
//           [
//             [-180, 90],
//             [180, 90],
//             [180, -79.7709983900276],
//             [179, -79.18554760864264],
//             ...,
//             [-179, -80.29414518593957],
//             [-180, -79.77099839002757],
//             [-180, 90],
//           ],
//         ],
//       ],
//       type: "MultiPolygon",
//     },
//     properties: { datetime: "2023-10-01T07:00:00.000Z", elevation: 0 },
//     type: "Feature",
//   }
```

### props

| Name              | Type         | Description                                                                 |
| ----------------- | ------------ | --------------------------------------------------------------------------- |
| date              | Date, string | **REQUIRED.** Target datetime.                                              |
| options           | object       | optional params.                                                            |
| options.division  | number       | Number of longitude divisions. (DEFAULT=360)                                |
| options.elevation | boolean      | Elevation angle in degrees. Must be less than or equal to zero. (DEFAULT=0) |
| options.eps       | boolean      | Value to be used when hour angle is 0. (DEFAULT=1e-8)　                     |

### return

Multipolygon geojson

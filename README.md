# geo4326

geo4326 convert bounds of satellite data such as GeoTIFF to Polygon of EPSG:4326.  
Depends: proj4

## Example

```JavaScript
import { transform } from "geo4326";
const upper_left = [382200, 2512500]
const lower_left = [382200, 2279400]
const upper_right = [610500, 2512500]
const lower_right = [610500, 2279400]
const src_crs = "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs";
transform.geojsonFromCornerCoordinates(
    upper_left, lower_left, upper_right, lower_right, src_crs,
    { partition: 1 }
)
```

**result**

```JSON
{
    "type": "Feature",
    "bbox": [
        85.85296718933643,
        20.610041795245515,
        88.07596179098903,
        22.71977571380184
    ],
    "properties": {},
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    85.85296718933643,
                    22.715665870841406
                ],
                [
                    85.86148358606191,
                    21.662922032738383
                ],
                [
                    85.86949772758247,
                    20.610041795245515
                ],
                [
                    86.96496913971062,
                    20.613735097472325
                ],
                [
                    88.06045501053289,
                    20.610485722030123
                ],
                [
                    88.06797282315149,
                    21.663390816645528
                ],
                [
                    88.07596179098903,
                    22.716159863683806
                ],
                [
                    86.96445677235502,
                    22.71977571380184
                ],
                [
                    85.85296718933643,
                    22.715665870841406
                ]
            ]
        ]
    }
}
```

## note

Linear ring enclosing the pole is transformed to polar sterographic projections once.  
`Source CRS -> polar sterographic projections (EPSG:3995, EPSG:3031) -> EPSG:4326`

Not not support linear ring that is not enclosing the pole and straddling the antimeridian many times.

Input polygon must be less than 360deg in width and less than 180deg in height, in EPSG:4326.

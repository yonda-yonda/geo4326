# geo4326

geo4326 is utilities for geospatial vector data.

- create a polygon of CRS84 from other projection coordinates.
- cut a polygon of CRS84 at the Antimeridian.
- measure distace and area on the WGS 84 ellipsoid.

Depends: proj4, epsg-index

## Documens

[docs](docs/README.md)

## Example

```JavaScript
import { transform } from "geo4326";
const upperLeft = [382200, 2512500]
const lowerLeft = [382200, 2279400]
const upperRight = [610500, 2512500]
const lowerRight = [610500, 2279400]
const srcCrs = "+proj=utm +zone=45 +datum=WGS84 +units=m +no_defs";
transform.geojsonFromCornerCoordinates(
    upperLeft, lowerLeft, upperRight, lowerRight, srcCrs,
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

In codes, EPSG:4326 means `urn:ogc:def:crs:OGC:1.3:CRS84`(Axes: lon/lat).

Linear ring enclosing the pole is transformed to polar sterographic projections once.  
`Source CRS -> polar sterographic projections (EPSG:3995, EPSG:3031) -> EPSG:4326`

Not support following linear rings.

- enclosing the pole and straddling the antimeridian many times
- enclosing the two poles.

Input polygon must be less than 360deg in width and less than 180deg in height, in CRS84.

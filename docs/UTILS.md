# utils

## area

```JavaScript
import { utils } from "geo4326";
utils.area([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// 400
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

number

## isCcw

```JavaScript
import { utils } from "geo4326";
utils.isCcw([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// true
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean

## within

Winding Number Algorithm

```JavaScript
import { utils } from "geo4326";
utils.within(
  [0, 0],
  [
    [-10, -10],
    [10, -10],
    [10, 10],
    [-10, 10],
    [-10, -10],
  ]
)
// true
```

#### props

| Name                  | Type                            | Description                                                |
| --------------------- | ------------------------------- | ---------------------------------------------------------- |
| point                 | [Position](./TYPES.md#position) | **REQUIRED.** point                                        |
| linearRing            | [Points](./TYPES.md#points)     | **REQUIRED.** linear ring                                  |
| options               | object                          | optional params.                                           |
| options.includeBorder | boolean                         | If true, allow point overlapping the ring. (DEFAULT=false) |

#### return

boolean

## intersection

When line1(p1 -> p2) and line2(p3 -> p4) are crossing or points more than 3 are on a line, return True

```JavaScript
import { utils } from "geo4326";
utils.intersection([0, 0], [10, 10], [1, 8], [9, 2])
// true
```

#### props

| Name | Type                            | Description                        |
| ---- | ------------------------------- | ---------------------------------- |
| p1   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line1. |
| p2   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line1. |
| p3   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line2. |
| p4   | [Position](./TYPES.md#position) | **REQUIRED.** edge point of line2. |

#### return

boolean

## selfintersection

not support warp polygon.

```JavaScript
import { utils } from "geo4326";
utils.selfintersection([
  [-10, -10],
  [10, -10],
  [10, 10],
  [-10, 10],
  [-10, -10],
])
// false
```

#### props

| Name       | Type                        | Description               |
| ---------- | --------------------------- | ------------------------- |
| linearRing | [Points](./TYPES.md#points) | **REQUIRED.** linear ring |

#### return

boolean

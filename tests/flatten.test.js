const {
  _warpWithin,
  _isCrossingAntimeridian,
  _crossingAntimeridianPointLat,
  cutRingAtAntimeridian,
} = require("../dist/flatten.js");

it("warpWithin", () => {
  expect(_warpWithin(60)).toBe(60);
  expect(_warpWithin(-60)).toBe(-60);
  expect(_warpWithin(180)).toBe(180);
  expect(_warpWithin(-180)).toBe(-180);
  expect(_warpWithin(360)).toBe(0);
  expect(_warpWithin(-360)).toBe(0);
  expect(_warpWithin(-240)).toBe(120);
  expect(_warpWithin(240)).toBe(-120);
});

it("isCrossingAntimeridian", () => {
  expect(_isCrossingAntimeridian(-160, 160)).toBeTruthy();
  expect(_isCrossingAntimeridian(-160, -200)).toBeTruthy();
  expect(_isCrossingAntimeridian(-160, 170)).toBeTruthy();
  expect(_isCrossingAntimeridian(160, 200)).toBeTruthy();

  expect(_isCrossingAntimeridian(-160, -180)).toBeFalsy();
  expect(_isCrossingAntimeridian(-160, 10)).toBeFalsy();
  expect(_isCrossingAntimeridian(-10, 10)).toBeFalsy();
  expect(_isCrossingAntimeridian(160, 180)).toBeFalsy();

  expect(_isCrossingAntimeridian(560, 530)).toBeTruthy();
  expect(_isCrossingAntimeridian(-520, -550)).toBeTruthy();
  expect(_isCrossingAntimeridian(370, 330)).toBeFalsy();
});

it("crossingAntimeridianPointLat", () => {
  expect(_crossingAntimeridianPointLat([-150, 10], [170, 10])).toBe(10);
  expect(_crossingAntimeridianPointLat([-150, 0], [170, 20])).toBe(15);
  expect(_crossingAntimeridianPointLat([-10, 0], [10, 170])).toBe(85);
  expect(_crossingAntimeridianPointLat([-20, 66], [10, 0])).toBe(34);
  expect(_crossingAntimeridianPointLat([-160, 32], [170, 20])).toBe(24);
  expect(_crossingAntimeridianPointLat([200, 32], [170, 20])).toBe(24);
  expect(_crossingAntimeridianPointLat([-160, 32], [-190, 20])).toBe(24);
  expect(_crossingAntimeridianPointLat([560, 32], [530, 20])).toBe(24);
  expect(_crossingAntimeridianPointLat([-520, 32], [-550, 20])).toBe(24);
});

it("cutRingAtAntimeridian", () => {
  expect(
    cutRingAtAntimeridian([
      [-160, 40],
      [175, 40],
      [-175, 35],
      [175, 30],
      [-160, 30],
      [-160, 40],
    ])
  ).toEqual({
    within: [
      [
        [180, 40.0],
        [175, 40],
        [180, 37.5],
        [180, 40.0],
      ],
      [
        [180, 32.5],
        [175, 30],
        [180, 30],
        [180, 32.5],
      ],
    ],
    outside: [
      [
        [-180, 30.0],
        [-160, 30],
        [-160, 40],
        [-180, 40.0],
        [-180, 37.5],
        [-175, 35],
        [-180, 32.5],
        [-180, 30.0],
      ],
    ],
  });

  expect(
    cutRingAtAntimeridian([
      [-160, 40],
      [175, 40],
      [-1, 40],
      [-1, 35],
      [45, 35],
      [-175, 35],
      [175, 30],
      [-160, 30],
      [-160, 40],
    ])
  ).toEqual({
    within: [
      [
        [180, 40.0],
        [175, 40],
        [-1, 40],
        [-1, 35],
        [45, 35],
        [180, 35],
        [180, 40.0],
      ],
      [
        [180, 32.5],
        [175, 30],
        [180, 30.0],
        [180, 32.5],
      ],
    ],
    outside: [
      [
        [-180, 30.0],
        [-160, 30],
        [-160, 40],
        [-180, 40.0],
        [-180, 35.0],
        [-175, 35],
        [-180, 32.5],
        [-180, 30.0],
      ],
    ],
  });

  expect(
    cutRingAtAntimeridian([
      [-160, 40],
      [175, 40],
      [175, 30],
      [-160, 30],
      [-160, 40],
    ])
  ).toEqual({
    within: [
      [
        [180, 40.0],
        [175, 40],
        [175, 30],
        [180, 30.0],
        [180, 40.0],
      ],
    ],
    outside: [
      [
        [-180, 30.0],
        [-160, 30],
        [-160, 40],
        [-180, 40.0],
        [-180, 30.0],
      ],
    ],
  });

  expect(
    cutRingAtAntimeridian([
      [160, 40],
      [175, 40],
      [175, 30],
      [160, 30],
      [160, 40],
    ])
  ).toEqual({
    within: [
      [
        [160, 40],
        [175, 40],
        [175, 30],
        [160, 30],
        [160, 40],
      ],
    ],
    outside: [],
  });

  expect(
    cutRingAtAntimeridian([
      [-10, 30],
      [15, 30],
      [15, 40],
      [-10, 40],
      [-10, 30],
    ])
  ).toEqual({
    within: [
      [
        [-10, 30],
        [15, 30],
        [15, 40],
        [-10, 40],
        [-10, 30],
      ],
    ],
    outside: [],
  });

  expect(
    cutRingAtAntimeridian(
      [
        [-160, 40],
        [175, 40],
        [-175, 30],
        [175, 30],
        [-160, 30],
        [-160, 40],
      ], {
        allowSelfintersection: true
      }
    )
  ).toEqual({
    within: [
      [
        [180, 40.0],
        [175, 40],
        [180, 35.0],
        [180, 40.0],
      ],
      [
        [180, 30.0],
        [175, 30],
        [180, 30.0],
        [180, 30.0],
      ],
    ],
    outside: [
      [
        [-180, 30.0],
        [-160, 30],
        [-160, 40],
        [-180, 40.0],
        [-180, 35.0],
        [-175, 30],
        [-180, 30.0],
        [-180, 30.0],
      ],
    ],
  });

  expect(
    cutRingAtAntimeridian([
      [-160, 40],
      [-160, 30],
      [175, 30],
      [-175, 35],
      [175, 40],
      [-160, 40],
    ])
  ).toEqual({
    within: [
      [
        [180, 30.0],
        [175, 30],
        [180, 32.5],
        [180, 30.0],
      ],
      [
        [180, 37.5],
        [175, 40],
        [180, 40.0],
        [180, 37.5],
      ],
    ],
    outside: [
      [
        [-180, 32.5],
        [-175, 35],
        [-180, 37.5],
        [-180, 40.0],
        [-160, 40],
        [-160, 30],
        [-180, 30.0],
        [-180, 32.5],
      ],
    ],
  });

  expect(
    cutRingAtAntimeridian([
      [185, 50],
      [175, 40],
      [175, 30],
      [185, 40],
      [185, 50],
    ])
  ).toEqual({
    "outside": [
      [
        [180, 35],
        [185, 40],
        [185, 50],
        [180, 45],
        [180, 35]
      ]
    ],
    "within": [
      [
        [180, 45],
        [175, 40],
        [175, 30],
        [180, 35],
        [180, 45]
      ]
    ]
  });

  expect(
    cutRingAtAntimeridian([
      [-170, 70],
      [-185, 40],
      [-185, 30],
      [-170, 60],
      [-170, 70],
    ])
  ).toEqual({
    "outside": [
      [
        [-180, 40],
        [-170, 60],
        [-170, 70],
        [-180, 50],
        [-180, 40]
      ]
    ],
    "within": [
      [
        [-180, 50],
        [-185, 40],
        [-185, 30],
        [-180, 40],
        [-180, 50]
      ]
    ]
  });

  expect(
    cutRingAtAntimeridian([
      [370, 50],
      [350, 40],
      [350, 30],
      [370, 40],
      [370, 50],
    ])
  ).toEqual({
    "outside": [],
    "within": [
      [
        [370, 50],
        [350, 40],
        [350, 30],
        [370, 40],
        [370, 50]
      ]
    ]
  });

  expect(
    cutRingAtAntimeridian([
      [-530, 70],
      [-545, 40],
      [-545, 30],
      [-530, 60],
      [-530, 70],
    ])
  ).toEqual({
    "outside": [
      [
        [-540, 40],
        [-530, 60],
        [-530, 70],
        [-540, 50],
        [-540, 40]
      ]
    ],
    "within": [
      [
        [-540, 50],
        [-545, 40],
        [-545, 30],
        [-540, 40],
        [-540, 50]
      ]
    ]
  });


  expect(
    cutRingAtAntimeridian([
      [200, 50],
      [190, 40],
      [190, 30],
      [200, 40],
      [200, 50],
    ])
  ).toEqual({
    "outside": [],
    "within": [
      [
        [200, 50],
        [190, 40],
        [190, 30],
        [200, 40],
        [200, 50]
      ]
    ]
  });
});
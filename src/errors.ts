abstract class CustomError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidPointError extends CustomError {
  constructor(m = "point must be number array and have length 2 or more.") {
    super(m);
  }
}

export class InvalidPointsError extends CustomError {
  constructor(m = "points must be point array.") {
    super(m);
  }
}

export class InvalidLinearRingError extends CustomError {
  constructor(m = "invalid linear ring.") {
    super(m);
  }
}

export class EnclosingBothPolesError extends CustomError {
  constructor(m = "not support linear ring enclosing north and south poles.") {
    super(m);
  }
}

export class InvalidLinearRingEnclosingPoleError extends CustomError {
  constructor(m = "invalid linear ring enclosing the pole.") {
    super(m);
  }
}

export class InvalidBoundsError extends CustomError {
  constructor(m = "invalid bounds.") {
    super(m);
  }
}

export class NotAllowedWarpBoundsError extends CustomError {
  constructor(m = "not support warpping bounds.") {
    super(m);
  }
}

export class InvalidSelfintersectionError extends CustomError {
  constructor(m = "invalid selfintersection.") {
    super(m);
  }
}

export class FalidCuttingAntimeridianError extends CustomError {
  constructor(m = "falid cutting antimeridian.") {
    super(m);
  }
}

export class NotAllowedCwLinearRingError extends CustomError {
  constructor(m = "not support cw linear ring.") {
    super(m);
  }
}

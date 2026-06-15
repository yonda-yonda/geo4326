abstract class CustomError extends Error {
  constructor(m: string) {
    super(m);
    this.name = new.target.name;
  }
}

export class InvalidNumberError extends CustomError {
  constructor(m = "not number.") {
    super(m);
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

export class NotAllowedWrapBoundsError extends CustomError {
  constructor(m = "not support wrapping bounds.") {
    super(m);
  }
}

export class InvalidSelfIntersectionError extends CustomError {
  constructor(m = "invalid self-intersection.") {
    super(m);
  }
}

export class FailedCuttingAntimeridianError extends CustomError {
  constructor(m = "failed cutting antimeridian.") {
    super(m);
  }
}

export class NotAllowedCwLinearRingError extends CustomError {
  constructor(m = "not support cw linear ring.") {
    super(m);
  }
}

export class NotConvergeCalculationError extends CustomError {
  constructor(m = "not converge calculation.") {
    super(m);
  }
}

export class NotSupportMeasuringDistance extends CustomError {
  constructor(m = "not support measuring distance.") {
    super(m);
  }
}

export class NotSupportMeasuringArea extends CustomError {
  constructor(m = "not support measuring area.") {
    super(m);
  }
}

export class InvalidCodeError extends CustomError {
  constructor(m = "unsupported epsg code.") {
    super(m);
  }
}

export class InvalidSimplifyError extends CustomError {
  constructor(m = "arguments of simplify is invalid.") {
    super(m);
  }
}

export class LookingAwayError extends CustomError {
  constructor(m = "not found ground point.") {
    super(m);
  }
}

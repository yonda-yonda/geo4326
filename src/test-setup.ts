import { expect } from "vitest";

export type CloseOpts = { rtol?: number; atol?: number };

function numClose(
  a: number,
  b: number,
  { rtol = 1e-9, atol = 1e-12 }: CloseOpts,
) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Object.is(a, b);
  return Math.abs(a - b) <= atol + rtol * Math.abs(b);
}

function deepClose(a: unknown, b: unknown, o: CloseOpts): boolean {
  if (typeof a === "number" && typeof b === "number") return numClose(a, b, o);
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepClose(v, b[i], o));
  }
  return Object.is(a, b);
}

expect.extend({
  toBeDeepCloseTo(received: unknown, expected: unknown, opts: CloseOpts = {}) {
    const pass = deepClose(received, expected, opts);
    return {
      pass,
      message: () =>
        `expected ${JSON.stringify(received)} ${pass ? "not " : ""}to be ~equal to ${JSON.stringify(expected)} ` +
        `(rtol=${opts.rtol ?? 1e-9}, atol=${opts.atol ?? 1e-12})`,
    };
  },
});

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toBeDeepCloseTo(expected: unknown, opts?: CloseOpts): T;
  }
  interface AsymmetricMatchersContaining {
    toBeDeepCloseTo(expected: unknown, opts?: CloseOpts): void;
  }
}

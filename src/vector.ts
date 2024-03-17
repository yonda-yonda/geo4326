import {
  EciVec3
} from "satellite.js";

export function norm(vec: EciVec3<number>): number {
  return Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
}

export function unit(vec: EciVec3<number>): EciVec3<number> {
  const n = norm(vec);
  return {
    x: vec.x / n,
    y: vec.y / n,
    z: vec.z / n,
  }
}

export function add(vec1: EciVec3<number>, vec2: EciVec3<number>): EciVec3<number> {
  return {
    x: vec1.x + vec2.x,
    y: vec1.y + vec2.y,
    z: vec1.z + vec2.z,
  };
}

export function multiple(vec: EciVec3<number>, scaler: number): EciVec3<number> {
  return {
    x: vec.x * scaler,
    y: vec.y * scaler,
    z: vec.z * scaler,
  }
}

export function dot(vec1: EciVec3<number>, vec2: EciVec3<number>): number {
  return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
}

export function cross(vec1: EciVec3<number>, vec2: EciVec3<number>): EciVec3<number> {
  return {
    x: vec1.y * vec2.z - vec1.z * vec2.y,
    y: vec1.z * vec2.x - vec1.x * vec2.z,
    z: vec1.x * vec2.y - vec1.y * vec2.x,
  }
}

export function rodoriguesRotate(axis: EciVec3<number>, degrees: number, vec: EciVec3<number>): EciVec3<number> {
  // Rodrigues' rotation formula
  // axis must be unit vector.
  const radians = (degrees * Math.PI) / 180;

  return {
    x: dot({
      x: axis.x ** 2 * (1 - Math.cos(radians)) + Math.cos(radians),
      y: axis.x * axis.y * (1 - Math.cos(radians)) - axis.z * Math.sin(radians),
      z: axis.x * axis.z * (1 - Math.cos(radians)) + axis.y * Math.sin(radians)
    }, vec),
    y: dot({
      x: axis.x * axis.y * (1 - Math.cos(radians)) + axis.z * Math.sin(radians),
      y: axis.y ** 2 * (1 - Math.cos(radians)) + Math.cos(radians),
      z: axis.y * axis.z * (1 - Math.cos(radians)) - axis.x * Math.sin(radians)
    }, vec),
    z: dot({
      x: axis.x * axis.z * (1 - Math.cos(radians)) - axis.y * Math.sin(radians),
      y: axis.y * axis.z * (1 - Math.cos(radians)) + axis.x * Math.sin(radians),
      z: axis.z ** 2 * (1 - Math.cos(radians)) + Math.cos(radians)
    }, vec)
  }
}
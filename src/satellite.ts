
import type {
    Position,
} from "geojson";
import {
    propagate, gstime, twoline2satrec,
    eciToGeodetic, degreesLong, degreesLat, PositionAndVelocity, EciVec3, GeodeticLocation
} from "satellite.js";

import {
    unit, cross, add, dot, multiple
} from "./vector";

import { LookingAwayError } from "./errors";
import { _transformEnclosingPoleRing } from "./transform";
import { Points } from "./types";
import { within } from "./utils";


const _getNadir = (positionAndVelocity: PositionAndVelocity, gmst: number): Position => {
    if (typeof positionAndVelocity.position === "boolean") {
        throw TypeError("positionAndVelocity has not a number.");
    }
    const position = eciToGeodetic(
        positionAndVelocity.position,
        gmst
    );

    return [
        degreesLong(position.longitude),
        degreesLat(position.latitude),
    ];
}

export const nadir = (tleLine1: string, tleLine2: string, date: Date): Position => {
    const satrec = twoline2satrec(tleLine1, tleLine2);
    const positionAndVelocity = propagate(satrec, date);
    const gmst = gstime(date);

    return _getNadir(positionAndVelocity, gmst);
}


export interface SubSatelliteTrackOptions {
    split?: number;
}

export const subSatelliteTrack = (
    tleLine1: string,
    tleLine2: string,
    start: Date,
    end: Date,
    userOptions?: SubSatelliteTrackOptions): Points[] => {
    const options = Object.assign(
        {
            split: 360,
        },
        userOptions
    );

    const satrec = twoline2satrec(tleLine1, tleLine2);

    const meanMotion = satrec.no; // [rad/min]
    const orbitPeriod = (2 * Math.PI) / (meanMotion / 60); // [sec]
    const dt = orbitPeriod / options.split;

    const tracks: Points[] = [[]];
    let linestringIndex = 0;
    const d = new Date(start.getTime());

    while (d < end) {
        const positionAndVelocity = propagate(satrec, d);
        if (typeof positionAndVelocity.position === "boolean") {
            throw TypeError("positionAndVelocity has not a number.");
        }

        const gmst = gstime(d);
        const current = _getNadir(positionAndVelocity, gmst);
        if (tracks[linestringIndex].length > 0) {
            const before =
                tracks[linestringIndex][tracks[linestringIndex].length - 1];
            if (Math.abs(current[0] - before[0]) > 180) {
                if (current[0] < 0 && before[0] > 0) {
                    const lat =
                        ((current[1] - before[1]) / (360 + current[0] - before[0])) *
                        (180 - before[0]) +
                        before[1];
                    tracks[linestringIndex].push([180, lat]);
                    tracks[++linestringIndex] = [[-180, lat]];
                }
                if (current[0] > 0 && before[0] < 0) {
                    const lat =
                        ((current[1] - before[1]) / (-360 + current[0] - before[0])) *
                        (-180 - before[0]) +
                        before[1];
                    tracks[linestringIndex].push([-180, lat]);
                    tracks[++linestringIndex] = [[180, lat]];
                }
            }
        }
        tracks[linestringIndex].push(current);
        d.setSeconds(d.getSeconds() + dt);
    }
    return tracks;
}

const getGroundObservingPosition = (
    satellitePosition: EciVec3<number>,
    observeDirection: EciVec3<number>,
    a: number,
    b: number,
    ex: EciVec3<number>,
    ey: EciVec3<number>,
    ez: EciVec3<number>
): EciVec3<number> => {
    const c = a;
    const d = {
        x: dot({ x: ex.x, y: ey.x, z: ez.x }, observeDirection),
        y: dot(
            { x: ex.y, y: ey.y, z: ez.y }, observeDirection),
        z: dot(
            { x: ex.z, y: ey.z, z: ez.z }, observeDirection),
    };
    const A = d.x ** 2 / a ** 2 + d.y ** 2 / b ** 2 + d.z ** 2 / c ** 2;
    const B =
        (2 * d.x * satellitePosition.x) / a ** 2 +
        (2 * d.y * satellitePosition.y) / b ** 2 +
        (2 * d.z * satellitePosition.z) / c ** 2;
    const C =
        satellitePosition.x ** 2 / a ** 2 + satellitePosition.y ** 2 / b ** 2 + satellitePosition.z ** 2 / c ** 2 - 1;

    const D = B ** 2 - 4 * A * C;
    const t1 = (-B + Math.sqrt(D)) / (2 * A);
    const t2 = (-B - Math.sqrt(D)) / (2 * A);

    if (isNaN(t1) || isNaN(t2)) throw new LookingAwayError();

    const P1 = add(
        satellitePosition,
        multiple(d, t1)
    );
    const P2 = add(
        satellitePosition,
        multiple(d, t2)
    );
    return t1 > t2 ? P2 : P1;
};

const _warp = (lonlat: number[], reference?: number[]): Position => {
    let lon = lonlat[0];
    if (reference && Math.abs(reference[0] - lon) >= 180) {
        if (reference[0] >= 0) lon += 360;
        else lon -= 360;
    }

    return [lon, lonlat[1]];
}

export const toLonLat = (point: GeodeticLocation, reference?: number[]): Position => {
    return _warp([degreesLong(point.longitude), degreesLat(point.latitude)], reference);
}

export interface FootprintOptions {
    insert?: number;
    fov?: number[]; // [along track, cross track] [deg]
    a?: number; // [km]
    f?: number;
}

const _getFootprint = (
    positionAndVelocity: PositionAndVelocity,
    gmst: number,
    userOptions?: FootprintOptions): Points => {
    const options = Object.assign(
        {
            insert: 5,
            fov: [30, 30],
            a: 6378.137, // WGS84
            f: 1 / 298.257223563 // WGS84
        },
        userOptions
    );
    if (typeof positionAndVelocity.position === "boolean" || typeof positionAndVelocity.velocity === "boolean") {
        throw TypeError("positionAndVelocity has not a number.");
    }

    const center = _getNadir(positionAndVelocity, gmst);

    const [f1, f2] = [(options.fov[0] / 2 * Math.PI) / 180, (options.fov[1] / 2 * Math.PI) / 180];
    const f3 = Math.atan(Math.sqrt(Math.tan(f1) ** 2 + Math.tan(f2) ** 2));
    const f4 = Math.atan(Math.tan(f1) / Math.tan(f2));

    const rf = {
        x: Math.sin(f3) * Math.cos(f4),
        y: Math.sin(f3) * Math.sin(f4),
        z: Math.cos(f3),
    };
    const lf = {
        x: Math.sin(f3) * Math.cos(f4),
        y: -Math.sin(f3) * Math.sin(f4),
        z: Math.cos(f3),
    };
    const lb = {
        x: - Math.sin(f3) * Math.cos(f4),
        y: -Math.sin(f3) * Math.sin(f4),
        z: Math.cos(f3),
    };
    const rb = {
        x: -Math.sin(f3) * Math.cos(f4),
        y: Math.sin(f3) * Math.sin(f4),
        z: Math.cos(f3),
    };

    const length = options.insert + 1;

    const ez = multiple(unit(positionAndVelocity.position), -1);
    const ey = unit(
        cross(
            positionAndVelocity.position,
            positionAndVelocity.velocity,
        )
    );
    const ex = unit(cross(ey, ez));
    const a = options.a;
    const b = a * (1 - options.f);

    const positions = [
        getGroundObservingPosition(positionAndVelocity.position, rf, a, b, ex, ey, ez),
        getGroundObservingPosition(positionAndVelocity.position, lf, a, b, ex, ey, ez),
        getGroundObservingPosition(positionAndVelocity.position, lb, a, b, ex, ey, ez),
        getGroundObservingPosition(positionAndVelocity.position, rb, a, b, ex, ey, ez),
    ];

    if (within([0, 0], [...positions.map((position) => [
        position.x, position.y
    ]), [positions[0].x, positions[0].y]], { includeBorder: true })) {
        return _transformEnclosingPoleRing(
            [...positions, positions[0]].map((p) => toLonLat(eciToGeodetic(
                p,
                gmst
            ), center)),
            "EPSG:4326",
            options.insert,
            positionAndVelocity.position.z >= 0
        );
    }

    // right front to left front
    {
        const direction = { ...rf };
        for (let i = 1; i < length; i++) {
            direction.y += -(2 * Math.sin(f3) * Math.sin(f4)) / length;

            positions.splice(i, 0, getGroundObservingPosition(positionAndVelocity.position, direction, a, b, ex, ey, ez));
        }
    }
    // left front to left back
    {
        const direction = { ...lf };
        for (let i = 1; i < length; i++) {
            direction.x += -(2 * Math.sin(f3) * Math.cos(f4)) / length;

            positions.splice(i + length, 0, getGroundObservingPosition(positionAndVelocity.position, direction, a, b, ex, ey, ez));
        }
    }
    // left back to right back
    {
        const direction = { ...lb };
        for (let i = 1; i < length; i++) {
            direction.y += (2 * Math.sin(f3) * Math.sin(f4)) / length;

            positions.splice(i + length * 2, 0, getGroundObservingPosition(positionAndVelocity.position, direction, a, b, ex, ey, ez));
        }
    }
    // right back to right front
    {
        const direction = { ...rb };
        for (let i = 1; i < length; i++) {
            direction.x += (2 * Math.sin(f3) * Math.cos(f4)) / length;

            positions.splice(i + length * 3, 0, getGroundObservingPosition(positionAndVelocity.position, direction, a, b, ex, ey, ez));
        }
    }

    const lonlats = positions.map((position) => {
        return toLonLat(eciToGeodetic(position, gmst), center);
    });

    return [...lonlats, lonlats[0]];
}

export const footprint = (tleLine1: string, tleLine2: string, date: Date, userOptions?: FootprintOptions): Points => {
    const satrec = twoline2satrec(tleLine1, tleLine2);
    const positionAndVelocity = propagate(satrec, date);
    const gmst = gstime(date);

    return _getFootprint(positionAndVelocity, gmst, userOptions);
};

export interface AccessAreaOptions {
    split?: number;
    roll?: number; // [deg]
    a?: number; // [km]
    f?: number;
    insert?: number;
}

const _getEdge = (
    satellitePosition: EciVec3<number>,
    gmst: number,
    a: number,
    b: number,
    ex: EciVec3<number>,
    ey: EciVec3<number>,
    ez: EciVec3<number>,
    f3: number,
    insert: number,
    reference: number[],
    start: boolean
): Points => {
    const edgePositions: Points = [];
    const direction = start ? 1 : -1;
    const length = insert + 1;
    for (let i = 1; i < length; i++) {
        const theta = direction * (f3 - (i * 2 * f3) / length);

        edgePositions.push(
            toLonLat(
                eciToGeodetic(
                    getGroundObservingPosition(
                        satellitePosition,
                        {
                            x: 0,
                            y: Math.sin(theta),
                            z: Math.cos(theta),
                        },
                        a,
                        b,
                        ex,
                        ey,
                        ez
                    ),
                    gmst
                ),
                reference
            )
        );
    }

    return edgePositions;
};

export const accessArea = (
    tleLine1: string,
    tleLine2: string,
    start: Date,
    end: Date,
    userOptions?: AccessAreaOptions
): Points[] => {
    const options = Object.assign(
        {
            split: 360,
            roll: 10,
            radius: 6378.137, // WGS84
            f: 1 / 298.257223563, // WGS84
            insert: 5,
        },
        userOptions
    );

    const satrec = twoline2satrec(tleLine1, tleLine2);

    const meanMotion = satrec.no; // [rad/min]
    const orbitPeriod = (2 * Math.PI) / (meanMotion / 60); // [sec]
    const dt = orbitPeriod / options.split;

    const f3 = (options.roll * Math.PI) / 180;

    let leftVectors: EciVec3<number>[] = [];
    let rightVectors: EciVec3<number>[] = [];
    let startEdgePositions: Points = [];
    let leftPositions: Points = [];
    let rightPositions: Points = [];
    let onboardIndex = 0;
    let across = 0;

    let reference: Position | null = null;
    let leftTrack: Points = [];
    let rightTrack: Points = [];

    const linearRings: Points[] = [];

    const d = new Date(start.getTime());
    while (d < end) {
        const positionAndVelocity = propagate(satrec, d);
        if (
            typeof positionAndVelocity.position === "boolean" ||
            typeof positionAndVelocity.velocity === "boolean"
        ) {
            throw TypeError("positionAndVelocity has not a number.");
        }

        const gmst = gstime(d);

        const ez = multiple(unit(positionAndVelocity.position), -1);
        const ey = unit(
            cross(positionAndVelocity.position, positionAndVelocity.velocity)
        );
        const ex = unit(cross(ey, ez));
        const a = options.radius;
        const b = a * (1 - options.f);

        const leftVector = getGroundObservingPosition(
            positionAndVelocity.position,
            {
                x: 0,
                y: Math.sin(-f3),
                z: Math.cos(f3),
            },
            a,
            b,
            ex,
            ey,
            ez
        );
        const leftLocation = eciToGeodetic(leftVector, gmst);
        const rightVector = getGroundObservingPosition(
            positionAndVelocity.position,
            {
                x: 0,
                y: Math.sin(f3),
                z: Math.cos(f3),
            },
            a,
            b,
            ex,
            ey,
            ez
        );
        const rightLocation = eciToGeodetic(rightVector, gmst);

        if (!reference) {
            reference = _getNadir(positionAndVelocity, gmst);

            startEdgePositions = _getEdge(
                positionAndVelocity.position,
                gmst,
                a,
                b,
                ex,
                ey,
                ez,
                f3,
                options.insert,
                reference,
                true
            );
        }
        const left = toLonLat(leftLocation, reference);
        const right = toLonLat(rightLocation, reference);

        if (across === 0) {
            if ((180 - Math.abs(left[0])) * (180 - Math.abs(right[0])) < 0)
                across = 1;
        } else if (across === 1) {
            if ((180 - Math.abs(left[0])) * (180 - Math.abs(right[0])) > 0)
                across = -1;
        }

        leftVectors.push(leftVector);
        rightVectors.push(rightVector);
        leftPositions.push(left);
        rightPositions.push(right);
        onboardIndex++;

        if (onboardIndex > 1) {
            const vectorRing = [
                ...leftVectors,
                ...[...rightVectors].reverse(),
                leftVectors[0],
            ];
            if (
                within(
                    [0, 0],
                    vectorRing.map((v) => [v.x, v.y])
                )
            ) {
                leftTrack = leftTrack.concat(
                    leftPositions.slice(0, leftPositions.length - 1)
                );

                rightTrack = rightTrack.concat(
                    rightPositions.slice(0, rightPositions.length - 1)
                );
                const middleLeftPosition = [...leftPositions[leftPositions.length - 1]];
                const middleRightPosition = [
                    ...rightPositions[rightPositions.length - 1],
                ];

                if (
                    Math.abs(middleLeftPosition[0] - leftTrack[leftTrack.length - 1][0]) >
                    180
                ) {
                    middleLeftPosition[0] +=
                        leftTrack[leftTrack.length - 1][0] > 0 ? 360 : -360;
                }
                if (
                    Math.abs(
                        middleRightPosition[0] - rightTrack[rightTrack.length - 1][0]
                    ) > 180
                ) {
                    middleRightPosition[0] +=
                        rightTrack[rightTrack.length - 1][0] > 0 ? 360 : -360;
                }
                leftTrack.push(middleLeftPosition);
                rightTrack.push(middleRightPosition);

                const polarLat = positionAndVelocity.position.z >= 0 ? 90 : -90;
                leftTrack.push([middleLeftPosition[0], polarLat]);
                rightTrack.push([middleRightPosition[0], polarLat]);

                linearRings.push([
                    rightTrack[0],
                    ...startEdgePositions,
                    ...leftTrack,
                    ...[...rightTrack].reverse(),
                ]);

                leftVectors = [leftVector];
                rightVectors = [rightVector];
                reference = _getNadir(positionAndVelocity, gmst);
                const left = toLonLat(leftLocation, reference);
                leftPositions = [left];
                const right = toLonLat(rightLocation, reference);
                rightPositions = [right];
                onboardIndex = 1;
                across =
                    (180 - Math.abs(left[0])) * (180 - Math.abs(right[0])) < 0 ? 1 : 0;

                leftTrack = [[left[0], polarLat]];
                rightTrack = [[right[0], polarLat]];

                startEdgePositions = [];
            } else if (across < 1) {
                const current = _getNadir(positionAndVelocity, gmst);
                if (across === 0) {
                    if (Math.abs(current[0] - reference[0]) >= 180) {
                        across = -1;
                    } else {
                        leftTrack.push(leftPositions[0]);
                        rightTrack.push(rightPositions[0]);
                    }
                }
                if (across < 0) {
                    leftTrack = leftTrack.concat(leftPositions);
                    rightTrack = rightTrack.concat(rightPositions);
                    let linearRing = [rightTrack[0], ...startEdgePositions, ...leftTrack];

                    const endeEdgePositions = (startEdgePositions = _getEdge(
                        positionAndVelocity.position,
                        gmst,
                        a,
                        b,
                        ex,
                        ey,
                        ez,
                        f3,
                        options.insert,
                        reference,
                        false
                    ));

                    linearRing = linearRing.concat([
                        ...endeEdgePositions,
                        ...[...rightTrack].reverse(),
                    ]);
                    linearRings.push(linearRing);

                    rightTrack = [];
                    leftTrack = [];
                }

                leftVectors = [leftVector];
                rightVectors = [rightVector];
                reference = current;
                leftPositions = [toLonLat(leftLocation, reference)];
                rightPositions = [toLonLat(rightLocation, reference)];
                onboardIndex = 1;

                if (across < 0) {
                    startEdgePositions = startEdgePositions = _getEdge(
                        positionAndVelocity.position,
                        gmst,
                        a,
                        b,
                        ex,
                        ey,
                        ez,
                        f3,
                        options.insert,
                        reference,
                        true
                    );
                }

                across = 0;
            }
        }
        d.setSeconds(d.getSeconds() + dt);

        if (end <= d) {
            leftTrack = leftTrack.concat(leftPositions);
            rightTrack = rightTrack.concat(rightPositions);
            if (leftTrack.length > 1 && rightTrack.length > 1) {
                let linearRing = [rightTrack[0], ...startEdgePositions, ...leftTrack];

                const endEdgePositions = _getEdge(
                    positionAndVelocity.position,
                    gmst,
                    a,
                    b,
                    ex,
                    ey,
                    ez,
                    f3,
                    options.insert,
                    reference,
                    false
                );
                linearRing = linearRing.concat([
                    ...endEdgePositions,
                    ...[...rightTrack].reverse(),
                ]);
                linearRings.push(linearRing);
            }
        }
    }

    return linearRings;
};

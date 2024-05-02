import type {
  DistanceToEpicenter,
  LngLatObject,
  SurfaceDistanceToEpicenter,
} from "../../types";
import { BaseMapZoom, BaseMarkerSize, EarthCircumference } from "./constant";

import region from "../../assets/json/region.json";
import times from "../../assets/json/time.json";

const depthIndexList = Object.keys(times);

export const extractLocationFromString = (str: string) => {
  if (str.indexOf("(") < 0) {
    return str.substring(0, str.indexOf("方") + 1);
  } else {
    return str.substring(str.indexOf("(") + 3, str.indexOf(")"));
  }
};

export const toFormattedTimeString = (ts: number) => {
  const time = new Date(ts);
  return [
    [
      time.getFullYear(),
      `${time.getMonth() + 1}`.padStart(2, "0"),
      `${time.getDate()}`.padStart(2, "0"),
    ].join("/"),
    " ",
    [
      `${time.getHours()}`.padStart(2, "0"),
      `${time.getMinutes()}`.padStart(2, "0"),
      `${time.getSeconds()}`.padStart(2, "0"),
    ].join(":"),
  ].join("");
};

export const toReportUrl = (id: string) => {
  const arr = id.split("-");
  arr.splice(1, 1);
  return `https://www.cwa.gov.tw/V8/C/E/EQ/EQ${arr.join("-")}.html` as const;
};

export const getMarkerSizeOnZoom = (zoom: number) =>
  BaseMarkerSize - (BaseMapZoom - zoom) * 2;

export const findClosestDepthIndex = (
  arr: Array<string>,
  target: number
): number => {
  return arr
    .map(Number)
    .reduce((prev, curr) =>
      Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
    );
};
export const pgaToFloat = (pga: number) => 2 * Math.log10(pga) + 0.7;

export const roundIntensity = (float: number) =>
  float < 0
    ? 0
    : float < 4.5
      ? Math.round(float)
      : float < 5
        ? 5
        : float < 5.5
          ? 6
          : float < 6
            ? 7
            : float < 6.5
              ? 8
              : 9;

export const degreeToRadian = (degree: number) => (degree * Math.PI) / 180;

export const calculateDistance = (p1: LngLatObject) => (p2: LngLatObject) =>
  Math.acos(
    Math.sin(Math.atan(Math.tan(degreeToRadian(p1.lat)))) *
      Math.sin(Math.atan(Math.tan(degreeToRadian(p2.lat)))) +
      Math.cos(Math.atan(Math.tan(degreeToRadian(p1.lat)))) *
        Math.cos(Math.atan(Math.tan(degreeToRadian(p2.lat)))) *
        Math.cos(degreeToRadian(p1.lng) - degreeToRadian(p2.lng))
  ) * 6371.008;

export const sideDistance = (a: number, b: number) =>
  (a ** 2 - b ** 2) ** (1 / 2);

export const speedModel = (depth: number, distance: number) => {
  const Za = 1 * depth;
  let G0, G;
  const Xb = distance;
  if (depth <= 40) {
    G0 = 5.10298;
    G = 0.06659;
  } else {
    G0 = 7.804799;
    G = 0.004573;
  }
  const Zc = -1 * (G0 / G);
  const Xc = (Math.pow(Xb, 2) - 2 * (G0 / G) * Za - Math.pow(Za, 2)) / (2 * Xb);
  let Theta_A = Math.atan((Za - Zc) / Xc);
  if (Theta_A < 0) {
    Theta_A = Theta_A + Math.PI;
  }
  Theta_A = Math.PI - Theta_A;
  const Theta_B = Math.atan((-1 * Zc) / (Xb - Xc));
  let Ptime = (1 / G) * Math.log(Math.tan(Theta_A / 2) / Math.tan(Theta_B / 2));
  const G0_ = G0 / 1.732;
  const G_ = G / 1.732;
  const Zc_ = -1 * (G0_ / G_);
  const Xc_ =
    (Math.pow(Xb, 2) - 2 * (G0_ / G_) * Za - Math.pow(Za, 2)) / (2 * Xb);
  let Theta_A_ = Math.atan((Za - Zc_) / Xc_);
  if (Theta_A_ < 0) {
    Theta_A_ = Theta_A_ + Math.PI;
  }
  Theta_A_ = Math.PI - Theta_A_;
  const Theta_B_ = Math.atan((-1 * Zc_) / (Xb - Xc_));
  let Stime =
    (1 / G_) * Math.log(Math.tan(Theta_A_ / 2) / Math.tan(Theta_B_ / 2));
  if (distance / Ptime > 7) {
    Ptime = distance / 7;
  }
  if (distance / Stime > 4) {
    Stime = distance / 4;
  }
  return { Ptime: Ptime, Stime: Stime };
};

export const calculateWaveRadius = (
  accurateTime: number,
  depth: number,
  eventTime: number
) => {
  const newRadius = { p: 0, s: 0 };
  const index =
    `${findClosestDepthIndex(depthIndexList, depth)}` as keyof typeof times;

  const timeTable = times[index];
  let prevTable = null;

  for (let i = 0, n = timeTable.length; i < n; i++) {
    const currTable = timeTable[i];
    if (!newRadius.p && currTable.P > (accurateTime - eventTime) / 1000) {
      if (prevTable) {
        const deltaTime = currTable.P - prevTable.P;
        const deltaRadius = currTable.R - prevTable.R;
        const timeOffset = (accurateTime - eventTime) / 1000 - prevTable.P;
        const radiusOffset = (timeOffset / deltaTime) * deltaRadius;
        newRadius.p = prevTable.R + radiusOffset;
      } else {
        newRadius.p = currTable.R;
      }
    }
    if (!newRadius.s && currTable.S > (accurateTime - eventTime) / 1000) {
      if (prevTable) {
        const deltaTime = currTable.S - prevTable.S;
        const deltaRadius = currTable.R - prevTable.R;
        const timeOffset = (accurateTime - eventTime) / 1000 - prevTable.S;
        const radiusOffset = (timeOffset / deltaTime) * deltaRadius;
        newRadius.s = prevTable.R + radiusOffset;
      } else {
        newRadius.s = currTable.R;
      }
    }

    if (newRadius.p && newRadius.s) {
      break;
    }
    prevTable = currTable;
  }

  if (!newRadius.p) {
    newRadius.p = sideDistance(((accurateTime - eventTime) / 1000) * 7, depth);
  }

  if (!newRadius.s) {
    newRadius.s = sideDistance(((accurateTime - eventTime) / 1000) * 4, depth);
  }

  return newRadius;
};

export const calculateEpicenterDistance =
  (event: LngLatObject) =>
  (local: LngLatObject) =>
  (
    depth: number
  ): {
    surfaceDistance: SurfaceDistanceToEpicenter;
    distance: DistanceToEpicenter;
  } => {
    const surfaceDistance = calculateDistance(event)(local);
    return {
      surfaceDistance: surfaceDistance,
      distance: (surfaceDistance ** 2 + depth ** 2) ** (1 / 2),
    };
  };

export const calculateIntensity = (
  surfaceDistance: SurfaceDistanceToEpicenter,
  distance: DistanceToEpicenter,
  magnitude: number,
  depth: number,
  siteEffect: number = 1.751
) => {
  const pga =
    1.657 * Math.exp(1.533 * magnitude) * distance ** -1.607 * siteEffect;

  let i = pgaToFloat(pga);

  if (i > 3) {
    const long = 10 ** (0.5 * magnitude - 1.85) / 2;
    const hypocenterDistance =
      (depth ** 2 + surfaceDistance ** 2) ** 0.5 - long;
    const x = Math.max(hypocenterDistance, 3);
    const gpv600 =
      10 **
      (0.58 * magnitude +
        0.0038 * depth -
        1.29 -
        Math.log10(x + 0.0028 * 10 ** (0.5 * magnitude)) -
        0.002 * x);
    const arv = 1.0;
    const pgv400 = gpv600 * 1.31;
    const pgv = pgv400 * arv;
    i = 2.68 + 1.72 * Math.log10(pgv);
  }

  return i;
};

export const calculateExpectedIntensity = (
  lnglat: LngLatObject,
  magnitude: number,
  depth: number
) => {
  const intensity: Record<number, number> = {};
  let maxIntensity = 0;

  for (let i = 0, k = Object.keys(region), n = k.length; i < n; i++) {
    const cityName = k[i] as keyof typeof region;
    const city = region[cityName];
    for (let j = 0, l = Object.keys(city), p = l.length; j < p; j++) {
      const townName = l[j] as keyof typeof city;
      const town: {
        code: number;
        lat: number;
        lon: number;
        site: number;
        site_s: number;
        site_d: number;
        id: string;
      } = city[townName];

      const { surfaceDistance, distance } = calculateEpicenterDistance(lnglat)({
        lat: town.lat,
        lng: town.lon,
      })(depth);

      const int = calculateIntensity(
        surfaceDistance,
        distance,
        magnitude,
        depth,
        town.site
      );

      if (int > maxIntensity) {
        maxIntensity = int;
      }

      intensity[town.code] = roundIntensity(int);
    }
  }
  return { intensity, maxIntensity };
};

export const calculateLocalExpectedWaveTime = (
  distance: DistanceToEpicenter,
  depth: number,
  time: number
) => {
  const tr_time = speedModel(depth, distance);

  return {
    p: time + tr_time.Ptime * 1000,
    s: time + tr_time.Stime * 1000,
  };
};

export const kmToPixels = (
  kilometers: number,
  latitude: number,
  zoomLevel: number
) =>
  (kilometers * 1000) /
  ((EarthCircumference * Math.cos((latitude * Math.PI) / 180)) /
    Math.pow(2, zoomLevel + 8.983));

import { scale } from "chroma-js";

export const i = scale([
  "#202020",
  "#004080",
  "#0070e0",
  "#1e9632",
  "#ffc800",
  "#ff9600",
  "#ff6400",
  "#ff0000",
  "#c00000",
  "#9600c8",
]).domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

export const pga = scale([
  "#0000cd",
  "#0048fa",
  "#00d08b",
  "#3ffa36",
  "#bdff0c",
  "#ffff00",
  "#ffdd00",
  "#ff9000",
  "#ff4400",
  "#f50000",
  "#aa0000",
  "#9600c8",
]).domain([-3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8]);

export const depth = scale([
  "#FF0000",
  "#FF6400",
  "#FFC800",
  "#00C800",
  "#00C8C8",
  "#0000C8",
]).domain([0, 20, 50, 100, 200, 350]);

export const magnitude = scale([
  "#0000C8",
  "#00C8C8",
  "#00C800",
  "#FFC800",
  "#FF0000",
  "#9600FF",
]).domain([0, 1.5, 3, 4.5, 6, 7]);

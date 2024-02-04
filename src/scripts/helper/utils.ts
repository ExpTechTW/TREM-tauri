export const extractLocationFromString = (str: string) => {
  if (str.indexOf("(") < 0) return str.substring(0, str.indexOf("方") + 1);
  else return str.substring(str.indexOf("(") + 3, str.indexOf(")"));
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

export const sideDistance = (a: number, b: number) =>
  (a ** 2 - b ** 2) ** (1 / 2);

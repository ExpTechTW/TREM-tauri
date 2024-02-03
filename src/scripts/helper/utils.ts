export const extractLocationFromString = (str: string) => {
  if (str.indexOf("(") < 0)
    return str.substring(0, str.indexOf("方") + 1);
  else
    return str.substring(str.indexOf("(") + 3, str.indexOf(")"));
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
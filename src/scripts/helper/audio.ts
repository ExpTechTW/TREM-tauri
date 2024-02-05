import type { AudioType } from "../../types";

export const getAudio = (theme: string, type: AudioType) =>
  new Audio(`./audio/${theme}/${type}.wav`);

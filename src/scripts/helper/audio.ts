import { AudioType } from "../../types";

export const getAudio = (theme: string, type: AudioType) => {
  const audio = new Audio(`./audio/${theme}/${type}.wav`);
  if (type == AudioType.Update)
    audio.volume = 0.6;
  return audio;
};

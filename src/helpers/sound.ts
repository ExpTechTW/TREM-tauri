export const playSound = (name: string) => {
  console.log(`playsound: ${name}`);

  switch (name) {
    case "intensity1":
      new Audio("/audio/intensity1.wav").play();
      break;

    case "intensity2":
      new Audio("/audio/intensity2.wav").play();
      break;

    case "intensity3":
      new Audio("/audio/intensity3.wav").play();
      break;

    case "intensity4":
      new Audio("/audio/intensity4.wav").play();
      break;

    case "cwa":
      new Audio("/audio/cwa.wav").play();
      break;

    case "eew":
      new Audio("/audio/eew.wav").play();
      break;

    case "trem":
      new Audio("/audio/trem.wav").play();
      break;

    case "update":
      new Audio("/audio/update.wav").play();
      break;

    default:
      break;
  }
};
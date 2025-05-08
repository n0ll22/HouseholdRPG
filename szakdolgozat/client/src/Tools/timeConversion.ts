//Az idő formázásáért felelős függvények
export const HMStoSeconds = (
  _length:
    | string
    | { h: number | string; m: number | string; s: number | string }
): number => {
  if (typeof _length === "string") {
    const splitTime = _length.split(":");
    const h = parseInt(splitTime[0] || "0", 10);
    const m = parseInt(splitTime[1] || "0", 10);
    const s = parseInt(splitTime[2] || "0", 10);

    const seconds = h * 3600 + m * 60 + s;

    return seconds;
  } else if (
    typeof _length === "object" &&
    "h" in _length &&
    "m" in _length &&
    "s" in _length
  ) {
    return (
      parseInt(_length.h.toString(), 10) * 3600 +
      parseInt(_length.m.toString(), 10) * 60 +
      parseInt(_length.s.toString(), 10)
    );
  } else {
    return 0;
  }
};

//seconds => hh:mm:ss konverzió
export const secondsToString = (s: number) => {
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const hoursString = hours.toString().padStart(2, "0");
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toFixed(0).toString().padStart(2, "0");

  return `${hoursString}:${minutesString}:${secondsString}`; //Formátum: "00:00:00" ISO 8601
};

export const secondsToObject = (
  _length: number | string
): { h: string; m: string; s: string } => {
  let totalSeconds: number;

  if (typeof _length === "number") {
    totalSeconds = _length;
  } else if (typeof _length === "string") {
    totalSeconds = HMStoSeconds(_length);
  } else {
    return { h: "0", m: "0", s: "0" };
  }

  const h = Math.floor(totalSeconds / 3600).toString();
  const m = Math.floor((totalSeconds % 3600) / 60).toString();
  const s = (totalSeconds % 60).toString();

  return { h, m, s };
};

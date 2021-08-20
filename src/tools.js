export function formatTime(param) {
  var sec_num = parseInt(param);
  var hours = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - hours * 3600) / 60);
  var seconds = sec_num - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return hours + ":" + minutes + ":" + seconds;
}

export function splitPath(path) {
  return path.split("\\").pop().split("/");
}

export function getFileName(path) {
  return splitPath(path).pop();
}

export function getPrevDir(path) {
  /*
  Unix path sep / should work on Windows too:
  https://stackoverflow.com/questions/125813/how-to-determine-the-os-path-separator-in-javascript/35246221
  */

  let spl = splitPath(path);
  spl.pop();
  if (spl[0].length == 0) {
    spl.shift();
  }
  return path[0] == "/" ? "/" + spl.join("/") : spl.join("/");
}

export const seekFlags = {
  RELATIVE: "relative",
  ABSOLUTE: "absolute",
  ABSOLUTEPERCENT: "absolute-percent",
  RELATIVEPERCENT: "relative-percent",
  KEYFRAMES: "keyframes",
  EXACT: "exact",
};

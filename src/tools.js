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

export function openURL(url) {
  window.open(url, "_system");
}

export const seekFlags = {
  RELATIVE: "relative",
  ABSOLUTE: "absolute",
  ABSOLUTEPERCENT: "absolute-percent",
  RELATIVEPERCENT: "relative-percent",
  KEYFRAMES: "keyframes",
  EXACT: "exact",
};

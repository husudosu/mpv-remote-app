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

/*
no:	Render subtitles as specified by the subtitle scripts, without overrides.
yes:	Apply all the --sub-ass-* style override options. Changing the default for any of these options can lead to incorrect subtitle rendering (default).
force:	Like yes, but also force all --sub-* options. Can break rendering easily.
scale:	Like yes, but also apply --sub-scale.
strip:	Radically strip all ASS tags and styles from the subtitle. This is equivalent to the old --no-ass / --no-sub-ass options.
*/
export const assOverride = {
  NO: "no",
  YES: "yes",
  FORCE: "force",
  SCALE: "scale",
};

export const loadFileFlags = {
  APPEND_PLAY: "append-play",
  REPLACE: "replace",
};

export const youtubDLQualities = {};

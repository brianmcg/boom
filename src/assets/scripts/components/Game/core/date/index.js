/**
 * @module  game/core/date
 */

/**
 * Formats milliseconds in hh:mm:ss.
 * @param  {Number} ms The time in milliseconds
 * @return {String}    The time formatted in hh:mm:ss.
 */
export const formatMS = (ms) => {
  let seconds = parseInt((ms / 1000) % 60, 10);
  let minutes = parseInt((ms / (1000 * 60)) % 60, 10);
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24, 10);

  hours = (hours < 10) ? `0${hours}` : hours;
  minutes = (minutes < 10) ? `0${minutes}` : minutes;
  seconds = (seconds < 10) ? `0${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
};

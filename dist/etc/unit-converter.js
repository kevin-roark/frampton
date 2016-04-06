'use strict';

function parseTimeArugment(timeArgument) {
  if (isNumeric(timeArgument)) {
    return { value: parseFloat(timeArgument), unit: 'seconds' };
  }

  var lastCharacter = timeArgument[timeArgument.length - 1];
  var value = parseFloat(timeArgument.substring(0, timeArgument.length - 1));
  switch (lastCharacter) {
    case 'b':
      return { value: value, unit: 'beats' };

    case 'B':
      return { value: value, unit: 'bars' };

    case 'f':
    case 'F':
      return { value: value, unit: 'frames' };

    case 'p':
    case 'P':
    case '%':
      if (value > 1) value = value / 100;
      if (value < 0 || value > 1) value = 0.01;
      return { value: value, unit: 'percent' };

    default:
      return null;
  }
}

function beatsToSeconds(beats) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var bpm = options.bpm || 120;

  var beatsPerSecond = bpm / 60;
  return beats / beatsPerSecond;
}

function barsToSeconds(bars) {
  // TODO

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
}

function framesToSeconds(frames) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var fps = options.fps || 24;

  return frames / fps;
}

function percentToSeconds(percent) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var duration = options.duration || 100;

  if (percent > 1) {
    percent = percent / 100;
  }

  return percent * duration;
}

module.exports.parseTimeArugment = parseTimeArugment;
module.exports.beatsToSeconds = beatsToSeconds;
module.exports.barsToSeconds = barsToSeconds;
module.exports.framesToSeconds = framesToSeconds;
module.exports.percentToSeconds = percentToSeconds;

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
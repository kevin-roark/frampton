
var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var ColorThief = require('color-thief');
var rimraf = require('rimraf');
var filesInPath = require('../cli/files-in-path');
var simpleAnalysis = require('./simple-analysis');

var colorThief = new ColorThief();

function getImageColor(image, options) {
  if (!options) options = {};

  var quality = options.quality || 60;
  var format = options.format || 'default';

  var color = colorThief.getColor(image, quality);

  return _convertColorToFormat(color, format);
}

function getVideoColors(video, options) {
  if (!options) options = {};

  var defaultSplitDuration = options.splitDuration || 60;
  var videoDuration = simpleAnalysis.getVideoDuration(video);

  var colors = [];

  for (var start = 0; start <= videoDuration; start += defaultSplitDuration) {
    var splitDuration = Math.min(defaultSplitDuration, videoDuration - start);
    split(start, splitDuration);
  }

  function split(start, splitDuration) {
    var splitOut = _splitVideoIntoFrames(video, {start: start, duration: splitDuration});

    splitOut.files.forEach((image) => {
      var color = getImageColor(image, options);
      colors.push(color);
    });

    rimraf(splitOut.directory, {disableGlob: true}, function() {});
  }

  return colors;
}

function _convertColorToFormat(color, format) {
  switch (format) {
    case 'object':
      return {r: color[0], g: color[1], b: color[2]};

    case 'array':
      return color;

    default:
      return color;
  }
}

function _splitVideoIntoFrames(video, options) {
  if (!options) options = {};

  var start = options.start || 0;
  var duration = options.duration || 60.0;
  var outDirectory = options.outDirectory || path.join(process.cwd(), 'frampton-temp-' + Math.floor(Math.random() * 1000000));
  var outFileFormat = path.join(outDirectory, 'frame%d.png');

  if (!fs.existsSync(outDirectory)) {
    fs.mkdirSync(outDirectory);
  }

  var command = `ffmpeg -ss ${start} -t ${duration} -i ${video} -vf scale=480:-1 ${outFileFormat}`;
  _executeFFMPEGCommand(command);

  return {
    directory: outDirectory,
    files: filesInPath(outDirectory, true)
  };
}

function _executeFFMPEGCommand(command) {
  return execSync(command, {stdio: ['pipe', 'pipe', 'ignore']}).toString();
}


module.exports.getImageColor = getImageColor;
module.exports.getVideoColors = getVideoColors;

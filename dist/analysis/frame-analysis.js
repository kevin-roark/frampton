'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var ColorThief = require('color-thief');
var rimraf = require('rimraf');
var filesInPath = require('../cli/files-in-path');
var simpleAnalysis = require('./simple-analysis');

var colorThief = new ColorThief();

function getImageColors(image, options) {
  if (!options) options = {};

  var quality = options.colorQuality || 60;
  var format = options.colorFormat || 'default';
  var paletteSize = options.colorPaletteSize || 6;

  var colors = colorThief.getPalette(image, paletteSize, quality);

  var formattedColors = colors.map(function (color) {
    return _convertColorToFormat(color, format);
  });

  return {
    dominant: formattedColors[0],
    palette: formattedColors
  };
}

function analyzeImage(image, options) {
  return {
    colors: getImageColors(image, options)
  };
}

function analyzeVideoFrames(video) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var callback = arguments.length <= 2 || arguments[2] === undefined ? function () {} : arguments[2];

  var videoDuration = simpleAnalysis.getVideoDuration(video);
  var fps = simpleAnalysis.getVideoFrameRate(video);
  var framesPerSplit = options.framesPerSplit;
  var totalFrames = Math.floor(fps * videoDuration);

  var frames = [];
  doNextSplit();

  function doNextSplit() {
    var frameIndex = frames.length;
    split(frameIndex, function () {
      if (frames.length < totalFrames - 1 && frameIndex < frames.length) {
        // as long as we are growing and haven't reached total, keep going!
        doNextSplit();
      } else {
        finish();
      }
    });
  }

  function finish() {
    var videoFrameData = {
      filename: video,
      duration: videoDuration,
      fps: fps,
      numberOfFrames: frames.length,
      frames: frames
    };

    callback(videoFrameData);
  }

  function split(startFrame, callback) {
    var splitOut = _splitVideoIntoFrames(video, {
      startFrame: startFrame,
      numberOfFrames: framesPerSplit,
      fps: fps
    });

    splitOut.files.forEach(function (image) {
      var frameData = analyzeImage(image, options);
      frameData.frameIndex = frames.length;
      frameData.timecode = frameData.frameIndex / fps; // this is easily calculable in a client, maybe not necessary

      frames.push(frameData);
    });

    rimraf(splitOut.directory, { disableGlob: true }, function () {
      if (callback) callback();
    });
  }
}

function _convertColorToFormat(color, format) {
  switch (format) {
    case 'object':
      return { r: color[0], g: color[1], b: color[2] };

    case 'array':
      return color;

    default:
      return color;
  }
}

function _splitVideoIntoFrames(video, options) {
  if (!options) options = {};

  var fps = options.fps || 30.0;
  var startFrame = options.startFrame || 0;
  var numberOfFrames = options.numberOfFrames || fps * 60;
  var outDirectory = options.outDirectory || path.join(process.cwd(), 'frampton-temp-' + Math.floor(Math.random() * 1000000));
  var outFileFormat = path.join(outDirectory, 'frame%d.png');

  if (!fs.existsSync(outDirectory)) {
    fs.mkdirSync(outDirectory);
  }

  var start = startFrame / fps;
  var duration = numberOfFrames / fps;
  var command = 'ffmpeg -ss ' + start + ' -t ' + duration + ' -i ' + video + ' -vf scale=480:-1 ' + outFileFormat;
  _executeFFMPEGCommand(command);

  return {
    directory: outDirectory,
    files: filesInPath(outDirectory, true)
  };
}

function _executeFFMPEGCommand(command) {
  return execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
}

module.exports.getImageColors = getImageColors;
module.exports.analyzeImage = analyzeImage;

module.exports.analyzeVideoFrames = analyzeVideoFrames;
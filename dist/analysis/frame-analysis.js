'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var ColorThief = require('color-thief');
var rimraf = require('rimraf');
var filesInPath = require('../cli/files-in-path');
var simpleAnalysis = require('./simple-analysis');
require('string-natural-compare');

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
  var totalFrames = Math.floor(fps * videoDuration);

  var removeImages = options.removeImages !== undefined ? options.removeImages : true;
  var framesPerSplit = options.framesPerSplit;
  var outDirectory = options.outDirectory;
  if (!framesPerSplit && !removeImages) {
    framesPerSplit = totalFrames;
    outDirectory = path.basename(video, path.extname(video)) + '-frames';
  }

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

  function split(startFrame) {
    var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

    var splitOut = _splitVideoIntoFrames(video, {
      fps: fps,
      startFrame: startFrame,
      numberOfFrames: framesPerSplit,
      scaleImages: options.scaleImages,
      outDirectory: outDirectory
    });

    splitOut.files.forEach(function (image) {
      var frameData = analyzeImage(image, options);
      frameData.frameIndex = frames.length;
      frameData.timecode = frameData.frameIndex / fps; // this is easily calculable in a client, maybe not necessary

      if (!removeImages) {
        frameData.imageFilename = image;
      }

      console.log('analyzed frame ' + frames.length + ': ' + image);

      frames.push(frameData);
    });

    if (removeImages) {
      rimraf(splitOut.directory, { disableGlob: true }, callback);
    } else {
      callback();
    }
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
  var scaleImages = options.scaleImages !== undefined ? options.scaleImages : true;
  var outDirectory = options.outDirectory || path.join(process.cwd(), 'frampton-temp-' + Math.floor(Math.random() * 1000000));
  var outFileFormat = path.join(outDirectory, 'frame%d.png');

  if (!fs.existsSync(outDirectory)) {
    fs.mkdirSync(outDirectory);
  }

  var start = startFrame / fps;
  var duration = numberOfFrames / fps;

  var command = 'ffmpeg -ss ' + start + ' -t ' + duration + ' -i ' + video + ' ';
  if (scaleImages) command += '-vf scale=480:-2 ';
  command += '' + outFileFormat;

  _executeFFMPEGCommand(command);

  var files = filesInPath(outDirectory, true);
  files.sort(String.naturalCaseCompare);

  return {
    directory: outDirectory,
    files: files
  };
}

function _executeFFMPEGCommand(command) {
  return execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();
}

module.exports.getImageColors = getImageColors;
module.exports.analyzeImage = analyzeImage;

module.exports.analyzeVideoFrames = analyzeVideoFrames;

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var ColorThief = require('color-thief');
var filesInPath = require('../cli/files-in-path');

var colorThief = new ColorThief();

function getImageColor(image, options={}) {
  var quality = options.quality || 60;
  var format = options.format || 'default';

  var color = colorThief.getColor(image, quality);

  return _convertColorToFormat(color, format);
}

function getVideoColors(video, options={}) {
  var defaultSplitDuration = options.splitDuration || 60;
  var videoDuration = _getVideoDuration(video);

  var colors = [];

  for (var start = 0; start <= videoDuration; start += defaultSplitDuration) {
    var splitDuration = Math.min(defaultSplitDuration, videoDuration - start);
    split(start, splitDuration);
  }

  function split(start, splitDuration) {
    var images = _splitVideoIntoFrames(video, {start: start, duration: splitDuration});
    images.forEach((image) => {
      var color = getImageColor(image, options);
      colors.push(color);
    });
  }

  return colors;
}

function _convertColorToFormat(color, format) {
  switch (format) {
    case 'array':
      return [color.r, color.g, color.b];

    default:
      return color;
  }
}

function _getVideoDuration(videoPath) {
  var mediainfoCommand = `mediainfo --Inform="General;%Duration%" ${videoPath}`;
  var mediainfoDuration = parseFloat(execSync(mediainfoCommand).toString());
  var duration = mediainfoDuration / 1000;

  return duration;
}

function _splitVideoIntoFrames(video, options={}) {
  var start = options.start || 0;
  var duration = options.duration || 60.0;
  var outDirectory = options.outDirectory || path.join(process.cwd(), 'frampton-temp-' + Math.floor(Math.random() * 1000000));
  var outFileFormat = path.join(outDirectory, 'frame%d.png');

  if (!fs.existsSync(outDirectory)) {
    fs.mkdirSync(outDirectory);
  }

  var command = `ffmpeg -ss ${start} -t ${duration} -i ${video} -vf scale=480:-1 ${outFileFormat}`;
  _executeFFMPEGCommand(command);

  return filesInPath(outDirectory, true);
}

function _executeFFMPEGCommand(command) {
  return execSync(command, {stdio: ['pipe', 'pipe', 'ignore']}).toString();
}


module.exports.getImageColor = getImageColor;
module.exports.getVideoColors = getVideoColors;

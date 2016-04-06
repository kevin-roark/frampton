'use strict';

var execSync = require('child_process').execSync;

function getVideoDuration(videoPath) {
  var mediainfoCommand = 'mediainfo --Inform="General;%Duration%" ' + videoPath;
  var mediainfoDuration = parseFloat(execSync(mediainfoCommand).toString());
  var duration = mediainfoDuration / 1000;

  return duration;
}

function getVideoFrameRate(videoPath) {
  var mediainfoCommand = 'mediainfo --Inform="General;%FrameRate%" ' + videoPath;
  var frameRate = parseFloat(execSync(mediainfoCommand).toString());

  return frameRate;
}

function getAudioDuration(audioPath) {
  var soxiCommand = 'soxi -D ' + audioPath;
  var duration = parseFloat(execSync(soxiCommand).toString());

  return duration;
}

function getMediaVolume(videoPath) {
  var command = 'ffmpeg -i ' + videoPath + ' -af "volumedetect" -f null /dev/null 2>&1';
  var output = execSync(command, { stdio: ['pipe', 'pipe', 'ignore'] }).toString();

  var volume = {
    mean: parseFloat(extractKey('mean_volume')),
    max: parseFloat(extractKey('max_volume'))
  };

  return volume;

  function extractKey(key) {
    var keyIndex = output.indexOf(key);
    if (key < 0) {
      return 0;
    }

    var startIndex = keyIndex + key.length + 2; // 2 for space and colon
    var value = output.substring(startIndex);

    var endIndex = value.indexOf('\n');
    if (endIndex < 0) {
      endIndex = value.length;
    }

    return value.substring(0, endIndex);
  }
}

module.exports.getVideoDuration = getVideoDuration;
module.exports.getVideoFrameRate = getVideoFrameRate;
module.exports.getAudioDuration = getAudioDuration;
module.exports.getMediaVolume = getMediaVolume;
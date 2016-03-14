#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var filesInPath = require('./files-in-path');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : './media_config.json';
var durationErrorConstant = args.indexOf('--durationConstant') >= 0 ? Number(args[args.indexOf('--durationConstant') + 1]) : 0;

var config = {
  path: mediaPath,
  videos: []
};

var files = filesInPath(config.path);

files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    addVideo(file);
  }
});

writeToFile();

function addVideo(file) {
  var videoPath = path.join(config.path, file);

  var duration = getDuration(videoPath);
  var volume = getVolume(videoPath);

  config.videos.push({
    filename: file,
    duration: duration + durationErrorConstant,
    volume: volume,
    tags: []
  });
}

function writeToFile() {
  config.videos.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  var jsonConfig = JSON.stringify(config);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log(`generated config at ${outputFilepath}`);
}

function getDuration(videoPath) {
  var mediainfoCommand = `mediainfo --Inform="General;%Duration%" ${videoPath}`;
  var mediainfoDuration = parseFloat(execSync(mediainfoCommand).toString());
  var duration = mediainfoDuration / 1000;

  return duration;
}

function getVolume(videoPath) {
  var command = `ffmpeg -i ${videoPath} -af "volumedetect" -f null /dev/null 2>&1`;
  var output = execSync(command, {stdio: ['pipe', 'pipe', 'ignore']}).toString();

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

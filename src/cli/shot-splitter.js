#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var Subtitle = require('subtitle');
var exec = require('child_process').exec;

var args = process.argv.slice(2);
if (args.length < 1) {
  console.log('need an srt file...');
  return;
}
if (args.length < 2) {
  console.log('need a video source file...');
  return;
}

var srtFilepath = args[0];
var videoFilepath = args[1];
var outputFilepath = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : './out';
var fps = args.indexOf('--fps') > 0 ? parseFloat(args[args.indexOf('--fps') + 1]) : 24;
var cutForPremiere = args.indexOf('--premiere') > 0;
var seperateAudio = args.indexOf('--A') > 0;
var noVideo = args.indexOf('--Vx') > 0;
var videoHandleLength = args.indexOf('--vh') > 0 ? parseFloat(args[args.indexOf('--vh') + 1]) : 0;
var audioHandleLength = args.indexOf('--ah') > 0 ? parseFloat(args[args.indexOf('--ah') + 1]) : 0;
var offset = args.indexOf('--offset') > 0 ? parseFloat(args[args.indexOf('--offset') + 1]) : 0;
var firstIdxMultiplier = args.indexOf('--start') > 0 ? parseFloat(args[args.indexOf('--start') + 1]) : 2; // values less than 2 trim the begining
var lastIdxMultiplier = args.indexOf('--end') > 0 ? parseFloat(args[args.indexOf('--end') + 1]) : 2; // values less than 2 trim the end


var subtitles = fs.readFileSync(srtFilepath).toString().replace(/\./g, ',');
var subtitleParser = new Subtitle(subtitles);

var shotData = subtitleParser.getSubtitles({
  duration: true,
  timeFormat: 'ms'
});

var commandsRunning = 0;
var commandQueue = [];

var shotDataArray = Object.keys(shotData);
var lastIdx = shotDataArray.length - 1;
var msPerFrame = 41;
var startMultiplier = cutForPremiere ? 3 : 2;
var normalMultiplier = cutForPremiere ? 2 : 1;

if (cutForPremiere) {
  lastIdxMultiplier = 3;
}

if (!fs.existsSync(outputFilepath)) {
  fs.mkdirSync(outputFilepath);
}

shotData.forEach(function(shot, idx) {
  var start, videoStart, audioStart, duration, videoDuration, audioDuration;
  if (idx === 0) {
    start = (shot.start - (firstIdxMultiplier * msPerFrame))  / 1000;
    videoStart = start;
    audioStart = start;

    duration = shot.duration / 1000;
    videoDuration = duration + videoHandleLength;
    audioDuration = duration + audioHandleLength;
  }
  else if (idx === 1) {
    start = (shot.start - (startMultiplier  * msPerFrame))  / 1000;
    videoStart = start - videoHandleLength;
    audioStart = start - audioHandleLength;
    duration = (shot.duration + (2 * msPerFrame)) / 1000;
    videoDuration = duration + videoHandleLength * 2;
    audioDuration = duration + audioHandleLength * 2;
    if(videoStart < 0){
      videoStart == 0;
      videoDuration = duration + videoHandleLength + shot.start;
    }
    if(audioStart < 0){
      audioStart == 0;
      audioDuration = duration + audioHandleLength + shot.start;
    }
  }
  else if (idx === lastIdx) {
    start = (shot.start - (startMultiplier * msPerFrame))  / 1000;
    videoStart = start - videoHandleLength;
    audioStart = start - audioHandleLength;

    duration = (shot.duration + (lastIdxMultiplier * msPerFrame)) / 1000; // premiere value is 3
    videoDuration = duration + videoHandleLength;
    audioDuration = duration + audioHandleLength;
  }
  else {
    start = Math.max(0, (shot.start - (startMultiplier * msPerFrame)) / 1000);
    videoStart = Math.max(0, start - videoHandleLength);
    audioStart = Math.max(0, start - audioHandleLength);

    duration = (shot.duration + (normalMultiplier * msPerFrame)) / 1000; // premiere value is 2
    videoDuration = duration + 2 * videoHandleLength;
    audioDuration = duration + 2 * audioHandleLength;
  }

  if (!noVideo) {
    var videoOutfile = path.join(outputFilepath, `${shot.index}.mp4`);
    var videoCommand = `ffmpeg -ss ${videoStart} -t ${videoDuration} -i ${videoFilepath} -c:v libx264 ${videoOutfile}`;
    run(videoCommand);
  }

  if (seperateAudio) {
    var audioOutfile = path.join(outputFilepath, `${shot.index}.aac`);
    var audioCommand = `ffmpeg -ss ${audioStart} -t ${audioDuration} -i ${videoFilepath} -vn ${audioOutfile}`;
    run(audioCommand);
  }
});

function run(command) {
  if (commandsRunning > 5) {
    commandQueue.push(command);
    return;
  }

  commandsRunning += 1;
  exec(command, (err) => {
    if (err) {
      console.log(err);
    }

    commandsRunning -= 1;
    if (commandQueue.length > 0) {
      var nextCommand = commandQueue.shift();
      run(nextCommand);
    }
  });
}

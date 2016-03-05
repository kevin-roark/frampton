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
var fps = args.indexOf('--fps') > 0 ? parseFloat(args[args.indexOf('--fps')]) : 24;

var subtitles = fs.readFileSync(srtFilepath).toString().replace(/\./g, ',');
var subtitleParser = new Subtitle(subtitles);

var shotData = subtitleParser.getSubtitles({
  duration: true,
  timeFormat: 'ms'
});

var msPerFrame = 1000 / fps;

shotData.forEach(function(shot, idx) {
  if (idx > 50) {
    return;
  }

  var outfile = path.join(outputFilepath, `${shot.index}.mp4`);

  var start;
  if (idx === 0) {
    start = shot.start / 1000;
  }
  else {
    start = Math.max(0, (shot.start - msPerFrame) / 1000);
  }

  var duration = Math.max(msPerFrame, (shot.duration - msPerFrame)) / 1000;

  var command = `ffmpeg -ss ${start} -t ${duration} -i ${videoFilepath} -c:v libx264 ${outfile}`;
  run(command);
});

var commandsRunning = 0;
var commandQueue = [];
function run(command) {
  if (commandsRunning > 5 ) {
    commandQueue.push(command);
    return;
  }

  exec(command, (err) => {
    if (err) {
      console.log(err);
    }

    if (commandQueue.length > 0) {
      var command = commandQueue.shift();
      run(command);
    }
  });
}

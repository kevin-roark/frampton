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
var offset = args.indexOf('--offset') > 0 ? parseFloat(args[args.indexOf('--offset') + 1]) : 0;

var subtitles = fs.readFileSync(srtFilepath).toString().replace(/\./g, ',');
var subtitleParser = new Subtitle(subtitles);

var shotData = subtitleParser.getSubtitles({
  duration: true,
  timeFormat: 'ms'
});

var msPerFrame = 41;

var shotDataArray = Object.keys(shotData);
var lastIdx = shotDataArray.length - 1;

var startMutliplier = 3;


shotData.forEach(function(shot, idx) {

  var outfile = path.join(outputFilepath, `${shot.index}.mp4`);



  var start, duration;
  if (idx === 0) {
    start = (shot.start - (startMutliplier * msPerFrame))  / 1000;
    duration = (shot.duration) / 1000;
  }
  else if (idx === 1) {
    start = (shot.start - ((startMutliplier + 1) * msPerFrame))  / 1000;
    duration = (shot.duration + (3 * msPerFrame)) / 1000;
  }
  else if (idx === lastIdx ) {
    start = (shot.start - (startMutliplier * msPerFrame))  / 1000;
    duration = (shot.duration + (3 * msPerFrame)) / 1000;
  }
  else {
    start = Math.max(0, (shot.start - (startMutliplier * msPerFrame)) / 1000);
    duration = (shot.duration + (2 * msPerFrame)) / 1000;
  }



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
  commandsRunning += 1;
  exec(command, (err) => {
    if (err) {
      console.log(err);
    }
    commandsRunning -= 1;
    if (commandsRunning <= 4 && commandQueue.length > 1) {
      var command = commandQueue.shift();
      run(command);
    }
  });
}

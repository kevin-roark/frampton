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

var videoFilepath = args[0];
var outputFilepath = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : '/out';
var chapterVolume = args.indexOf('--c') > 0 ? args[args.indexOf('--c') + 1] : '1';


var commandsRunning = 0;
var commandQueue = [];


for (i=0; i < chapterVolume; i++){
  var idx = i + 1;

  var outfile = path.join(outputFilepath, `${idx}.mp4`);
  var command = `HandBrakeCLI -i ${videoFilepath} -e x264  -q 20.0 -a 1 -E faac -B 160 -6 dpl2 -R Auto -D 0.0 --audio-copy-mask aac,ac3,dtshd,dts,mp3 --audio-fallback ffac3 -f mp4 --loose-anamorphic --modulus 2 -m --x264-preset veryfast --h264-profile main --h264-level 4.0 -c ${idx} -o ${outfile}`;

  run(command);
}

function run(command) {
  if (commandsRunning > 1) {
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

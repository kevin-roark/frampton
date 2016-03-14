#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';

var commandsRunning = 0;
var commandQueue = [];

var files = filesInPath(mediaPath);

files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    segmentVideo(file);
  }
});


function segmentVideo(file) {
  var videoPath = path.join(mediaPath, file);

  var segmentCommand = `video_segmentation ${videoPath}`;
  run(segmentCommand, function() {
    var shotSplitterPath = path.join(__dirname, 'shot-splitter.js');
    var srtPath = ''; // TODO: I don't know because I don't know what video_segmentation produces :/
    var outPath = path.join(mediaPath, 'split-videos');

    var shotSplitCommand = `node ${shotSplitterPath} ${srtPath} ${videoPath} --out ${outPath}`;
    run(shotSplitCommand);
  });
}

function run(command, callback) {
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

    if (callback) {
      callback();
    }
  });
}

function filesInPath(dir) {
  var files = [];

  fs.readdirSync(dir).forEach(function(file) {
      var filepath = path.join(dir, file);

      var stat = fs.statSync(filepath);
      if (stat && stat.isDirectory()) {
          files = files.concat(filesInPath(filepath));
      }
      else {
        files.push(file);
      }
  });

  return files;
}

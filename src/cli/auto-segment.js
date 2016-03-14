#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var Subtitle = require('subtitle');
var exec = require('child_process').exec;

var args = process.argv.slice(2);


var mediaPath = args.length > 0 ? args[0] : './media';

var commandsRunning = 0;
var commandQueue = [];

var config = {
  path: mediaPath,
  videos: []
};

var files = filesInPath(config.path);

files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    segmentVideo(file);
  }
});


function segmentVideo(file) {
  var videoPath = path.join(config.path, file);

  var command = `video_segmentation ${videoPath}`;

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

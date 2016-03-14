#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';
var splitShots = args.indexOf('--split') > 0;
var startFlag = args.indexOf('--start') > 0 ? parseFloat(args[args.indexOf('--start') + 1]) : 2; // values less than 2 trim the begining
var endFlag = args.indexOf('--end') > 0 ? parseFloat(args[args.indexOf('--end') + 1]) : 2; // values less than 2 trim the end


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
    var srtPath = `${videoPath}_shots.srt`;
    var outPath = path.join(mediaPath, 'split-videos');

    var shotSplitCommand = `node ${shotSplitterPath} ${srtPath} ${videoPath} --out ${outPath} --start ${startFlag} --end ${endFlag}  `;
    if (splitShots){
      run(shotSplitCommand);
    }
    
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

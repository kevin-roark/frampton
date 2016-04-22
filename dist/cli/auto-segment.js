#!/usr/local/bin/node
'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var filesInPath = require('./files-in-path');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : 'media';
var splitShots = args.indexOf('--split') > 0;
var splitOnly = args.indexOf('--splitonly') > 0;
var startFlag = args.indexOf('--start') > 0 ? parseFloat(args[args.indexOf('--start') + 1]) : 2; // values less than 2 trim the begining
var endFlag = args.indexOf('--end') > 0 ? parseFloat(args[args.indexOf('--end') + 1]) : 2; // values less than 2 trim the end
var extraCommand1 = args.indexOf('--c') > 0 ? args[args.indexOf('--c') + 1] : '';
var extraCommand2 = args.indexOf('--c2') > 0 ? args[args.indexOf('--c2') + 1] : '';
var extraCommand3 = args.indexOf('--c3') > 0 ? args[args.indexOf('--c3') + 1] : '';

var commandsRunning = 0;
var commandQueue = [];

var files = filesInPath(mediaPath, true);

if (!splitOnly) {
  files.forEach(function (file) {
    if (path.extname(file) === '.mp4') {
      segmentVideo(file);
    }
  });
}

files.forEach(function (file) {
  if (path.extname(file) === '.mp4') {
    splitVideo(file);
  }
});

function segmentVideo(videoPath) {
  var segmentCommand = 'video_segmentation ' + videoPath;
  run(segmentCommand);
}

function splitVideo(videoPath) {
  var shotSplitterPath = path.join(__dirname, 'shot-splitter.js');
  var srtPath = videoPath.substr(0, videoPath.lastIndexOf(".")) + '_shots.srt';
  var extensionFreeName = path.basename(videoPath, path.extname(videoPath));
  var outPath = path.join(mediaPath, 'split-scenes', extensionFreeName);
  var makeDirectoryCommand = 'md ' + outPath;
  var useFsDir = false;
  var shotSplitCommand = 'node ' + shotSplitterPath + ' ' + srtPath + ' ' + videoPath + ' --out ' + outPath + ' --start ' + startFlag + ' --end ' + endFlag + ' --pre ' + extensionFreeName + '- ' + extraCommand1 + ' ' + extraCommand2 + ' ' + extraCommand3;

  if (splitShots || splitOnly) {
    if (useFsDir) {
      if (!fs.existsSync(outPath)) {
        fs.mkdirSync(outPath);
      }
    } else {
      run(makeDirectoryCommand);
    }
    run(shotSplitCommand);
  }
}

function run(command, callback) {
  if (commandsRunning > 1) {
    commandQueue.push(command);
    return;
  }

  commandsRunning += 1;
  exec(command, function (err) {
    if (err) {
      console.log(err);
    }
    console.log(command);
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
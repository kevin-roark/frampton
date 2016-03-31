#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var filesInPath = require('./files-in-path');
var ncp = require('ncp');

var args = process.argv.slice(2);

if (args.length === 0) {
  console.log('need a video directory');
  return;
}

var videoDirectory = args[0];
var outputDirectory = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : videoDirectory + '-converted';
var makeWebm = args.indexOf('--webm') > 0;

var files = filesInPath(videoDirectory, true);
var itemsBeingProcessed = 0;
var videoFileQueue = [];

ncp(videoDirectory, outputDirectory, function(err) {
  if (err) {
    return console.error(err);
  }

  files.forEach(function(file) {
    var videoExtensions = ['.mp4', '.avi', '.mov'];
    if (videoExtensions.indexOf(path.extname(file)) >= 0) {
      convertVideo(file);
    }
  });
});

function convertVideo(filepath) {
  if (itemsBeingProcessed > 4) {
    videoFileQueue.push(filepath);
    return;
  }

  itemsBeingProcessed += 1;

  var extensionFreeFilename = path.basename(filepath, path.extname(filepath));
  var outputMP4Filepath = path.join(outputDirectory, `${extensionFreeFilename}.mp4`);

  console.log(`converting ${filepath} to web mp4...`);
  exec(`${__dirname}/web-mp4-convert.sh ${filepath} ${outputMP4Filepath}`, function(err) {
    if (err) {
      console.log('error converting video to mp4: ');
      console.error(err);
      finishVideo();
    }
    else {
      if (makeWebm) {
        var extensionFreeOutputPath = path.join(outputDirectory, extensionFreeFilename);
        console.log(`converting ${filepath} to webm...`);
        exec(`${__dirname}/webm-convert.sh ${extensionFreeOutputPath}`, function(err) {
          if (err) {
            console.log('error converting video to webm: ');
            console.error(err);
          }

          finishVideo();
        });
      }
      else {
        finishVideo();
      }
    }

    function finishVideo() {
      itemsBeingProcessed -= 1;
      if (itemsBeingProcessed <= 4 && videoFileQueue.length > 1) {
        convertVideo(videoFileQueue.shift());
      }
    }
  });
}

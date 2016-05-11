#!/usr/local/bin/node
'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var filesInPath = require('./files-in-path');

var command;

(function () {
  var args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('need a media directory');
    return;
  }

  var mediaDirectory = args[0];
  var outputDirectory = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : mediaDirectory;

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }

  var files = filesInPath(mediaDirectory, true);
  var itemsBeingProcessed = 0;
  var fileQueue = [];

  files.forEach(function (file) {
    var videoExtensions = ['.mp4'];
    if (videoExtensions.indexOf(path.extname(file)) >= 0) {
      convertVideo(file);
    }
  });

  function convertVideo(filepath) {
    if (itemsBeingProcessed > 1) {
      fileQueue.push(filepath);
      return;
    }

    itemsBeingProcessed += 1;

    var extensionFreeFilename = filepath.substring(filepath.indexOf(mediaDirectory) + mediaDirectory.length, filepath.lastIndexOf('.'));
    var csvPath = path.join(mediaDirectory, extensionFreeFilename + '.csv');
    var mp4Path = path.join(mediaDirectory, extensionFreeFilename + '.mp4');
    var outputVideoFilepath = path.join(outputDirectory, '' + extensionFreeFilename);

    console.log('converting ' + filepath + ' for handles...');
    command = '/Users/GEMPA/Documents/github/frampton/src/cli/shot-splitter.js ' + csvPath + ' ' + mp4Path + ' --A --ah 0.25 --csv --fps 60 --out ' + outputVideoFilepath, exec(command, function (err) {
      if (err) {
        console.log('error making handles: ');
        console.error(err);
        finishAudio();
      } else {
        finishAudio();
      }

      function finishAudio() {
        itemsBeingProcessed -= 1;
        if (itemsBeingProcessed <= 1 && fileQueue.length > 1) {
          convertVideo(fileQueue.shift());
        }
      }
    });
  }
})();
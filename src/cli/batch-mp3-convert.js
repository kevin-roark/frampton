#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var filesInPath = require('./files-in-path');

(function() {
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

  files.forEach(function(file) {
    var audioExtensions = ['.mp3', '.aac'];
    if (audioExtensions.indexOf(path.extname(file)) >= 0) {
      convertAudio(file);
    }
  });

  function convertAudio(filepath) {
    if (itemsBeingProcessed > 4) {
      fileQueue.push(filepath);
      return;
    }

    itemsBeingProcessed += 1;

    var extensionFreeFilename = filepath.substring(filepath.indexOf(mediaDirectory) + mediaDirectory.length, filepath.lastIndexOf('.'));
    var outputMP3Filepath = path.join(outputDirectory, `${extensionFreeFilename}.mp3`);

    console.log(`converting ${filepath} to mp3...`);
    exec(`${__dirname}/mp3-convert.sh ${filepath} ${outputMP3Filepath}`, function(err, o) {
      if (err) {
        console.log('error converting to mp3: ');
        console.error(err);
        finishAudio();
      }
      else {
        finishAudio();
      }

      function finishAudio() {
        itemsBeingProcessed -= 1;
        if (itemsBeingProcessed <= 4 && fileQueue.length > 1) {
          convertAudio(fileQueue.shift());
        }
      }
    });
  }
})();

#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var args = process.argv.slice(2);

if (args.length === 0) {
  console.log('need a video directory');
  return;
}

var videoDirectory = args[0];
var outputDirectory = args.indexOf('--out') > 0 ? args[args.indexOf('--out') + 1] : videoDirectory + '-converted';
var makeWebm = args.indexOf('--webm') > 0;

if (!fs.existsSync(outputDirectory)){
  fs.mkdirSync(outputDirectory);
}

var files = filesInPath(videoDirectory);
var itemsBeingProcessed = 0;
var videoFileQueue = [];

files.forEach(function(file) {
  var videoExtensions = ['.mp4', '.avi', '.mov'];
  if (videoExtensions.indexOf(path.extname(file)) >= 0) {
    convertVideo(file);
  }
});

function convertVideo(file) {
  if (itemsBeingProcessed > 4) {
    videoFileQueue.push(file);
    return;
  }

  itemsBeingProcessed += 1;

  var filepath = path.join(videoDirectory, file);
  var extensionFreeFilename = path.basename(file, path.extname(file));
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

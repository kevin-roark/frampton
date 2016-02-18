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
var outputDirectory = videoDirectory + '-converted';

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
  var outputFilepath = path.join(outputDirectory, `${path.basename(file, path.extname(file))}.mp4`);

  console.log(`converting ${filepath}...`);
  exec(`${__dirname}/web-mp4-convert.sh ${filepath} ${outputFilepath}`, function(err, stdout, stderr) {
    if (err) {
      console.log('error converting video: ');
      console.err(err);
    }

    itemsBeingProcessed -= 1;
    if (itemsBeingProcessed <= 4 && videoFileQueue.length > 1) {
      convertVideo(videoFileQueue.shift());
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

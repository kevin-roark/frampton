#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var filesInPath = require('./files-in-path');
var simpleAnalysis = require('../analysis/simple-analysis');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : './media_config.json';
var durationErrorConstant = args.indexOf('--durationConstant') >= 0 ? Number(args[args.indexOf('--durationConstant') + 1]) : 0;

var config = {
  path: mediaPath,
  videos: []
};

var files = filesInPath(config.path);

files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    addVideo(file);
  }
});

writeToFile();

function addVideo(file) {
  var videoPath = path.join(config.path, file);

  var duration = simpleAnalysis.getVideoDuration(videoPath);
  var volume = simpleAnalysis.getVideoVolume(videoPath);

  config.videos.push({
    filename: file,
    duration: duration + durationErrorConstant,
    volume: volume,
    tags: []
  });
}

function writeToFile() {
  config.videos.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  var jsonConfig = JSON.stringify(config);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log(`generated config at ${outputFilepath}`);
}

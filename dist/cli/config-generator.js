#!/usr/local/bin/node
'use strict';

var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var filesInPath = require('./files-in-path');
var simpleAnalysis = require('../analysis/simple-analysis');
require('string-natural-compare');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : 'media';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : 'media_config.json';
var durationErrorConstant = args.indexOf('--durationConstant') >= 0 ? Number(args[args.indexOf('--durationConstant') + 1]) : 0;
var silent = args.indexOf('--silent') > 0;

var config = {
  path: mediaPath,
  videos: [],
  audio: [],
  frames: []
};

var files = filesInPath(config.path, true);

files.forEach(function (file) {
  var extname = path.extname(file);
  if (extname === '.mp4') {
    addVideo(file);
  } else if (extname === '.mp3') {
    addAudio(file);
  } else if (file.indexOf('.frames.json') > 0) {
    addFrames(file);
  }
});

writeToFile();

function addVideo(videoPath) {
  log('found video: ' + videoPath);

  var duration = simpleAnalysis.getVideoDuration(videoPath);
  var volume = simpleAnalysis.getMediaVolume(videoPath);

  config.videos.push({
    filename: filenameWithoutMediaDirectory(videoPath),
    duration: duration + durationErrorConstant,
    volumeInfo: volume,
    tags: []
  });
}

function addAudio(audioPath) {
  log('found audio: ' + audioPath);

  var duration = simpleAnalysis.getAudioDuration(audioPath);
  var volume = simpleAnalysis.getMediaVolume(audioPath);

  config.audio.push({
    filename: filenameWithoutMediaDirectory(audioPath),
    duration: duration + durationErrorConstant,
    volumeInfo: volume,
    tags: []
  });
}

function addFrames(framesPath) {
  log('found frames: ' + framesPath);

  var framesData = jsonfile.readFileSync(framesPath);

  config.frames.push({
    filename: filenameWithoutMediaDirectory(framesPath),
    duration: framesData.duration + durationErrorConstant,
    fps: framesData.fps,
    numberOfFrames: framesData.numberOfFrames,
    tags: []
  });
}

function filenameWithoutMediaDirectory(filename) {
  return filename.substring(filename.indexOf(mediaPath) + mediaPath.length + 1); // 1 for the slash :-)
}

function writeToFile() {
  log('writing to file...');

  config.videos.sort(function (a, b) {
    return String.naturalCaseCompare(a.filename, b.filename);
  });

  var jsonConfig = JSON.stringify(config);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log('generated config at ' + outputFilepath);
}

function log(text) {
  if (!silent) {
    console.log(text);
  }
}
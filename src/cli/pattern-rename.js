#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var jsonfile = require('jsonfile');
var filesInPath = require('./files-in-path');
var simpleAnalysis = require('../analysis/simple-analysis');
require('string-natural-compare');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';
var silent = args.indexOf('--silent') > 0;
var startIndex = args.indexOf('--index') >= 0 ? Number(args[args.indexOf('--index') + 1]) : 0;


var seedPattern = ["A","Bb","B"]; // ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
var namePattern = seedPattern;

var files = filesInPath(mediaPath, true);

files.sort(String.naturalCaseCompare);

files.forEach(function(file) {
  if (path.extname(file) === '.mp4'){
    renameFilePattern(file);
  }
});

function renameFilePattern(file){
  var newName = namePattern[0] + startIndex.toString();
  var newPath = path.join(mediaPath, newName + path.extname(file));
  fs.renameSync(file, newPath)

  namePattern.splice(0,1);

  if (namePattern.length < 1){
    namePattern = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
    startIndex += 1;
  }

  log(`renaming ${file} to ${newName}`);
}

function log(text) {
  if (!silent) {
    console.log(text);
  }
}

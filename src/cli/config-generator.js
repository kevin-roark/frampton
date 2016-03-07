#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

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

config.videos.sort(function(a, b) {
  return a.filename.localeCompare(b.filename);
});

var jsonConfig = JSON.stringify(config);
fs.writeFileSync(outputFilepath, jsonConfig);
console.log(`generated config at ${outputFilepath}`);


function addVideo(file) {
  var videoPath = path.join(config.path, file);

  var mediainfoCommand = `mediainfo --Inform="General;%Duration%" ${videoPath}`;
  var mediainfoDuration = parseFloat(execSync(mediainfoCommand).toString());
  var duration = mediainfoDuration / 1000;

  config.videos.push({
    filename: file,
    duration: duration + durationErrorConstant,
    tags: []
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

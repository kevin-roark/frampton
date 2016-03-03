#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var probe = require('node-ffprobe');

var args = process.argv.slice(2);

var mediaPath = args.length > 0 ? args[0] : './media';
var outputFilepath = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : './media_config.json';
var durationErrorConstant = args.indexOf('--durationConstant') >= 0 ? Number(args[args.indexOf('--durationConstant') + 1]) : 0.06;

var config = {
  path: mediaPath,
  videos: []
};

var files = filesInPath(config.path);
var itemsBeingProcessed = 0;

files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    addVideo(file);
  }
});

function addVideo(file) {
  itemsBeingProcessed += 1;
  probe(path.join(config.path, file), function(err, probeData) {
    var duration = probeData && probeData.streams ? probeData.streams[0].duration : 0.0;

    config.videos.push({
      filename: file,
      duration: duration + durationErrorConstant,
      tags: []
    });

    itemsBeingProcessed -= 1;
    if (itemsBeingProcessed === 0) {
      writeToFile();
    }
  });
}

function writeToFile() {
  config.videos.sort(function(a, b) {
    return a.filename.localeCompare(b.filename);
  });

  var jsonConfig = JSON.stringify(config);
  fs.writeFileSync(outputFilepath, jsonConfig);
  console.log('generated config at ' + outputFilepath);
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

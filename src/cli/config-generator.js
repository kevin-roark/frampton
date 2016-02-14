#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');
var probe = require('node-ffprobe');

var args = process.argv.slice(2);

var outputFilepath = args.length > 1 ? args[1] : './media_config.json';

var config = {
  path: args.length > 0 ? args[0] : './media',
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
    config.videos.push({
      filename: file,
      duration: probeData && probeData.streams ? probeData.streams[0].duration : 0.0
    });

    itemsBeingProcessed -= 1;
    if (itemsBeingProcessed === 0) {
      writeToFile();
    }
  });
}

function writeToFile() {
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

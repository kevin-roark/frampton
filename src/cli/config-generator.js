#!/usr/local/bin/node

var fs = require('fs');
var path = require('path');

var args = process.argv.slice(2);

var outputFilepath = args.length > 1 ? args[2] : './media_config.json';

var config = {
  path: args.length > 0 ? args[0] : './media',
  videos: []
};

var files = filesInPath(config.path);
files.forEach(function(file) {
  if (path.extname(file) === '.mp4') {
    config.videos.push({"id": file});
  }
});

var jsonConfig = JSON.stringify(config);
fs.writeFileSync(outputFilepath, jsonConfig);

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


var fs = require('fs');
var path = require('path');

function filesInPath(dir, fullPath) {
  var files = [];

  fs.readdirSync(dir).forEach(function(file) {
      var filepath = path.join(dir, file);

      var stat = fs.statSync(filepath);
      if (stat && stat.isDirectory()) {
          files = files.concat(filesInPath(filepath, fullPath));
      }
      else {
        if (fullPath) {
          files.push(filepath);
        }
        else {
          files.push(file);
        }
      }
  });

  return files;
}

module.exports = filesInPath;

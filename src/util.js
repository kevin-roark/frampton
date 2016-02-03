
var fs = require('fs');
var fsPath = require('path');

module.exports.videoIDsInPath = function _videoIDsInPath(path) {
  if (!path || path.length === 0) {
    return [];
  }

  var ids = [];

  fs.readdirSync(path).forEach(function(file) {
      var filepath = fsPath.join(path, file);

      var stat = fs.statSync(filepath);
      if (stat && stat.isDirectory()) {
          ids = ids.concat(_videoIDsInPath(filepath));
      }
      else {
        if (fsPath.extname(filepath) === '.mp4') {
          ids.push(file);
        }
      }
  });

  return ids;
};

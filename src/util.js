
import {readdirSync, statSync} from 'fs';
import {join as pathJoin, extname} from 'path';

module.exports.videoIDsInPath = function _videoIDsInPath(path) {
  if (!path || path.length === 0) {
    return [];
  }

  var ids = [];

  readdirSync.readdirSync(path).forEach(function(file) {
      var filepath = pathJoin(path, file);

      var stat = statSync(filepath);
      if (stat && stat.isDirectory()) {
          ids = ids.concat(_videoIDsInPath(filepath));
      }
      else {
        if (extname(filepath) === '.mp4') {
          ids.push(file);
        }
      }
  });

  return ids;
};

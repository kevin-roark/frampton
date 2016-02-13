
import {readdirSync, statSync} from 'fs';
import {join as pathJoin, extname} from 'path';

export function videoIDsInPath(path) {
  if (!path || path.length === 0) {
    return [];
  }

  var ids = [];

  readdirSync.readdirSync(path).forEach(function(file) {
      var filepath = pathJoin(path, file);

      var stat = statSync(filepath);
      if (stat && stat.isDirectory()) {
          ids = ids.concat(videoIDsInPath(filepath));
      }
      else {
        if (extname(filepath) === '.mp4') {
          ids.push(file);
        }
      }
  });

  return ids;
}

export function choice(arr) {
  var i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export function shuffle(arr) {
  var newArray = new Array(arr.length);
  for (var i = 0; i < arr.length; i++) {
    newArray[i] = arr[i];
  }

  newArray.sort(function() { return 0.5 - Math.random(); });
  return newArray;
}

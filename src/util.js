
var fs = require('fs');
var fsPath = require('path');

module.exports = {
  videoIDsInPath: videoIDsInPath,
  choice: choice,
  shuffle: shuffle
};

function videoIDsInPath(path) {
  if (!path || path.length === 0) {
    return [];
  }

  var ids = [];

  fs.readdirSync(path).forEach(function(file) {
      var filepath = fsPath.join(path, file);

      var stat = fs.statSync(filepath);
      if (stat && stat.isDirectory()) {
          ids = ids.concat(videoIDsInPath(filepath));
      }
      else {
        if (fsPath.extname(filepath) === '.mp4') {
          ids.push(file);
        }
      }
  });

  return ids;
}

function choice(arr) {
  var i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

function shuffle(arr) {
  var newArray = new Array(arr.length);
  for (var i = 0; i < arr.length; i++) {
    newArray[i] = arr[i];
  }

  newArray.sort(function() { return 0.5 - Math.random(); });
  return newArray;
}

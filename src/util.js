
module.exports = {
  choice: choice,
  shuffle: shuffle,
  randInt: randInt
};

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

function randInt(min, max) {
  if (!min) min = 1;
  if (!max) max = 1000;

  return Math.floor(Math.random() * (max - min)) + min;
}

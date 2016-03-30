
module.exports = {
  choice: choice,
  shuffle: shuffle,
  randInt: randInt,
  splitArray: splitArray
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

function splitArray(arr, n) {
  var arrs = [];

  var currentArr = [];
  for (var i = 0; i < arr.length; i++) {
    currentArr.push(arr[i]);
    if (currentArr.length === n) {
      arrs.push(currentArr);
      currentArr = [];
    }
  }

  if (currentArr.length > 0) {
    arrs.push(currentArr);
  }

  return arrs;
}

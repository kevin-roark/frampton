
module.exports = class MediaFinder {
  construtor(mediaConfig) {
    this.mediaConfig = mediaConfig;
  }

  findAudioHandleForVideo(video) {
    var strippedFilename = stripExtension(video.filename || video);

    var audio = this.mediaConfig.audio;
    if (!audio || audio.length === 0) {
      return null;
    }

    for (var i = 0; i < audio.length; i++) {
      var track = audio[i];
      if (strippedFilename === stripExtension(track.filename)) {
        return track;
      }
    }

    return null;
  }
};

function stripExtension(filename) {
  var lastDotIndex = filename.lastIndexOf('.');
  return filename.substring(0, lastDotIndex);
}

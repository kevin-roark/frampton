
module.exports = class MediaFinder {
  constructor(mediaConfig) {
    this.mediaConfig = mediaConfig;
  }

  findVideoWithPatern(pattern) {
    let videos = this.mediaConfig.videos;
    for (let i = 0; i < videos.length; i++) {
      let video = videos[i];
      if (video.filename.indexOf(pattern) >= 0) {
        return video;
      }
    }

    return null;
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

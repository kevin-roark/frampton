
var util = require('./util');

module.exports = class Tagger {
  constructor(mediaConfig) {
    this.mediaConfig = mediaConfig;

    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (!video.tags) {
        video.tags = [];
      }
    }

    this.buildTagMap();
  }

  buildTagMap() {
    var tagMap = {};

    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      var tags = video.tags;
      if (!tags) {
        continue;
      }

      for (var j = 0; j < tags.length; j++) {
        var tag = tags[j];
        var videosWithTag = tagMap[tag];
        if (!videosWithTag) {
          videosWithTag = [];
          tagMap[tag] = videosWithTag;
        }

        videosWithTag.push(video);
      }
    }

    this.tagMap = tagMap;
  }

  videosWithTag(tag, options) {
    var videos = this.tagMap[tag] || [];

    if (options && options.shuffle) {
      videos = util.shuffle(videos);
    }

    if (options && options.limit) {
      videos = videos.slice(0, options.limit);
    }

    return videos;
  }

  videosWithoutTag(tag, options) {
    var videos = [];

    var allVideos = this.mediaConfig.videos;
    for (var i = 0; i < allVideos.length; i++) {
      var video = allVideos[i];
      if (!this.videoHasTag(video, tag)) {
        videos.push(tag);
      }
    }

    if (options && options.shuffle) {
      videos = util.shuffle(videos);
    }

    if (options && options.limit) {
      videos = videos.slice(0, options.limit);
    }

    return videos;
  }

  randomVideoWithTag(tag) {
    var videos = this.videosWithTag(tag);
    return util.choice(videos);
  }

  videoSequenceFromTagSequence(tagSequence) {
    var videos = [];
    for (var i = 0; i < tagSequence.length; i++) {
      var tag = tagSequence[i];
      var video = this.randomVideoWithTag(tag);
      if (video) {
        videos.push(video);
      }
    }
    return videos;
  }

  videoHasTag(video, tag) {
    if (!video) return false;

    var filename = video.filename || video;

    var videosWithTag = this.videosWithTag(tag);

    for (var i = 0; i < videosWithTag.length; i++) {
      if (videosWithTag[i].filename === filename) {
        return true;
      }
    }

    return false;
  }

  /// Utility Taggers

  tagVideosWithPattern(pattern, tag) {
    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (video.filename.indexOf(pattern) >= 0) {
        video.tags.push(tag);
      }
    }

    this.buildTagMap();
  }

  tagVideosWithQualitativeLength() {
    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      var duration = video.duration;

      if (duration < 0.3) {
        video.tags.push('short');
        video.tags.push('short1');
      }
      else if (duration < 1.0) {
        video.tags.push('short');
        video.tags.push('short2');
      }
      else if (duration < 3.0) {
        video.tags.push('med');
        video.tags.push('med1');
      }
      else if (duration < 5.0) {
        video.tags.push('med');
        video.tags.push('med2');
      }
      else if (duration < 10.0) {
        video.tags.push('long');
        video.tags.push('long1');
      }
      else if (duration < 30.0) {
        video.tags.push('long');
        video.tags.push('long2');
      }
      else {
        video.tags.push('long');
        video.tags.push('long3');
      }
    }

    this.buildTagMap();
  }
};

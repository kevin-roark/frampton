
var util = require('./util');

export class Tagger {
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

  randomVideoWithTag(tag) {
    var videos = this.videosWithTag(tag);
    return util.choice(videos);
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

      var tag;
      if (duration < 0.3) {
        tag = 'short1';
      }
      else if (duration < 1.0) {
        tag = 'short2';
      }
      else if (duration < 3.0) {
        tag = 'med1';
      }
      else if (duration < 5.0) {
        tag = 'med2';
      }
      else if (duration < 10.0) {
        tag = 'long1';
      }
      else if (duration < 30.0) {
        tag = 'long2';
      }
      else {
        tag = 'long3';
      }

      video.tags.push(tag);
    }

    this.buildTagMap();
  }
}

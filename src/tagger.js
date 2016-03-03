
var util = require('./util');

export class Tagger {
  constructor(mediaConfig) {
    this.mediaConfig = mediaConfig;
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

  tagVideosWithPattern(pattern, tag) {
    var videos = this.mediaConfig.videos;
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (video.filename.indexOf(pattern) >= 0) {
        if (!video.tags) {
          video.tags = [];
        }

        video.tags.push(tag);
      }
    }

    this.buildTagMap();
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
}

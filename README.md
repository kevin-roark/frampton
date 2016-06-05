# frampton
A suite of video composition tools. More Documentation coming soon.
Have you heard of [Hollis Frampton](https://en.wikipedia.org/wiki/Hollis_Frampton)?

## Gallery

[feud.online](http://www.feud.online/) by [Carmichael Payamps](http://www.carmichael.xyz)  
[Bourne rebourne](http://www.carmichael.xyz/rebourne/) by [Carmichael Payamps](http://www.carmichael.xyz)  
[fffight.site](http://www.fffight.site/) by [Carmichael Payamps](http://www.carmichael.xyz)  
[Cinema Multiplex](http://www.carmichael.xyz/multiplex/) by [Carmichael Payamps](http://www.carmichael.xyz)  
[Chromatic Reduction, Deduction](http://www.colors.black/) by [Carmichael Payamps](http://www.carmichael.xyz)

## External Dependencies

You have to install these non-node programs to your computer, please!
* ffmpeg
* mediainfo
* cairo / libjpeg
* sox

## Special Notes

As of now, setTimeouts are *not* supported in frampton's VideoRenderer. Implementation ideas welcome.

## Roadmap

* implement Z-index support in VideoRenderer
* flesh out image-sequence support in all renderers
* support alternative time specification like beats, percent, etc.
* iron out kinks like:
  * multiple-audio-at-the-same-time with video-renderer (MLT?)
  * consistent playbackRate support
* interfacing with premiere?? :) (:
* later on: nicer interfaces for non-programmers

# How To's

## Creating media_config

Ok so the idea with this json structure is to define all media (video, audio, images, frame sequences) that will be used in a particular frampton Render. Data and behavior are intentionally very separate. A score javascript defines behavior that is performed on media json.

Examples of how media_config.json files are structured are easy to find in the `examples` directory. JSON can of course be written by hand, but a command-line tool is provided to make the common cases easy.

1. Put all the media you'd like to use in a directory.
2. Run `node dist/cli/config-generator.js path_to_media_directory` and that will put a ready-to-go media_config in your current directory.
3. You can do `node dist/cli/config-generator.js path_to_media_directory --out name_of_media_config.json`.

## Basic Web Render

Let's follow along with this example score: `examples/continuous.js`. You can write your own scores based on the provided examples (and the Gallery projects). I'll let you figure that out!! You can also make a `media_config.json` following the steps from the previous how-to, or use the provided `examples/numbers_config.json`.

I will teach you how to turn a score and a media_config into a rendered output.

1. Run `node dist/cli/web-bundle.js path_to_score.js path_to_media_config.json` and that will create a ready-to-serve output in the current directory called `out`.
2. Run a local http server (like `serve`) from `out` and load it up in Chrome and hell yeah you should see some continuously super-cut videos.
3. Check out the command-line options in `./src/cli/web-bundle.js` to change things like output directory, minification, all-browser-allowance, etc.

## Basic Video Render

Now this here is part of the beauty of frampton. We can use the same `score.js` and `media_config.json` files that you used in the web render above to produce an h264 mp4 video!

1. Run `node dist/cli/generate-video.js path_to_score.js path_to_media_config.json` and you should get a video output at `out/frampton-final.mp4` once the video is rendered.
2. Look at the `generate-video.js` file to learn the command line options: self-documenting dog :-)

Take note that there is not yet parity between the video and web renderers. Features have been built into each based on need, so some scores might not run as expected in one vs. the other. This will be resolved in time. All in time.

# frampton
art video scoring language based on arthur

## Future Visions

two inputs to system:
1. time-based manual score, or algorithmic score "magic words" 
2. media file database as json (video, audio, images)

ideal outputs:
1. ffmpeg video render
2. html5 continuous live playback

phases:
1. read the score
2. grab the video
3. modify video as necessary based on properties
4. plant video into relevant spaces

Score elements should play independently of each other (i.e. the program reads entire score and then plays things according to their start time rather than in order)

Should support nesting score elements, so that one score element can take another score element instead of or in addition to a video id

score element properties:
* score element id
* start time (when the score segment plays) [should take frames, beats/notes, seconds, and timecode]
* score duration (how long the video is played on the score) [should take frames, beats/notes, seconds, and timecode]
* inputs (either discrete ids for videos, ids generated through tags, score element ids, or pick random)
* video duration (can define for all or per video id) (how much of the video plays on the score) [e.g. 2 seconds, with a 10 second score duration, would mean that the video plays for 2 seconds and there is 8 seconds of blank space]
* repeat (whether the video repeats if video duration < score duration) [true/false]
* repeat style (how the video repeats) [loop, reverse loop, (if in group: random loop, etc)]
* score repeat (does this score segment repeat after it ends?) [true/false]
* score repeat style (same as repeat style but for the score)
* score repeat length (how many times/how long it repeats for) [takes either number of times, or a duration]
* filter (sepia only option)

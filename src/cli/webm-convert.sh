#!/bin/bash

infile=$1.mp4
outfile=$1.webm

ffmpeg -i $infile -codec:v libvpx -quality good -cpu-used 0 -b:v 3000k -maxrate 3000k -bufsize 6000k -qmin 10 -qmax 42 -vf scale=-1:720 -threads 4 -codec:a libvorbis -b:a 128k $outfile

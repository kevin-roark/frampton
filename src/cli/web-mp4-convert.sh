#!/bin/bash

infile=$1
outfile=$2

ffmpeg -i $infile -codec:v libx264 -profile:v main -preset medium -b:v 3000k -maxrate 3000k -bufsize 6000k -vf scale=-1:720 -threads 0 -b:a 128k $outfile

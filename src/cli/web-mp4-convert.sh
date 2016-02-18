#!/bin/bash

infile=$1
outfile=$2

ffmpeg -i $infile -codec:v libx264 -profile:v main -preset medium -b:v 4000k -maxrate 4000k -bufsize 8000k -vf scale=-1:720 -threads 0 -b:a 128k $outfile

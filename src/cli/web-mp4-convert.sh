#!/bin/bash

infile=$1
outfile=$2
bitrate=${3:-2000}
resolution=${4:-480}
abitrate=${5:-160}

ffmpeg -y -i $infile -codec:v libx264 -profile:v main -preset medium -b:v ${bitrate}k -maxrate ${bitrate}k -bufsize $(($bitrate * 2))k -vf scale=-2:${resolution} -threads 0 -b:a ${abitrate}k $outfile

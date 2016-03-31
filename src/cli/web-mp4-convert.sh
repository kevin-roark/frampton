#!/bin/bash

infile=$1
outfile=$2
bitrate=${3:-2000}

ffmpeg -y -i $infile -codec:v libx264 -profile:v main -preset medium -b:v ${bitrate}k -maxrate ${bitrate}k -bufsize $(($bitrate * 2))k -vf scale=-2:480 -threads 0 -b:a 128k $outfile

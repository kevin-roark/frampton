#!/bin/bash

infile=$1
outfile=$2
bitrate=${3:-128}

ffmpeg -i $infile -threads 0 -b:a $(($bitrate))k $outfile

#!/bin/bash

# Resize all images to half of the original size

for file in *.webp; do
  convert "$file" -resize 50% "${file%.*}-new.${file##*.}"
done
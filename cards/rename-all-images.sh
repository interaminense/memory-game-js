#!/bin/bash
count=1

for file in *.webp; do
  mv "$file" "image$(printf $count).webp"
  count=$((count+1))
done
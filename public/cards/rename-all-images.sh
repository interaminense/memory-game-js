#!/bin/bash

# Rename all images from 'lorem-ipsum-dolor.webp' to 'imagem1.webp'

count=1

for file in *.webp; do
  mv "$file" "image$(printf $count).webp"
  count=$((count+1))
done
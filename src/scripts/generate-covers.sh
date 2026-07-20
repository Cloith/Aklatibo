#!/bin/bash

find backend/e-books -name "*.pdf" | while read pdf
do
    folder=$(dirname "$pdf")

    echo "Generating cover for $pdf"

    pdftoppm \
        -png \
        -f 1 \
        -singlefile \
        -scale-to 300 \
        "$pdf" \
        "$folder/cover"
done
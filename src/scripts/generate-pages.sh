#!/bin/bash

find backend/e-books -name "*.pdf" | while read pdf
do
    folder=$(dirname "$pdf")
    pages_folder="$folder/pages"

    mkdir -p "$pages_folder"

    echo "Generating pages for $pdf"

    pdftoppm \
        -jpeg \
        -r 200 \
        "$pdf" \
        "$pages_folder/page"

    count=1

    for file in "$pages_folder"/page-*.jpg
    do
        new_name="$pages_folder/page-$(printf "%04d" $count).jpg"

        mv "$file" "$new_name"

        count=$((count + 1))
    done

    page_count=$((count - 1))

    relative_path="${folder#backend/e-books/}"
    book_id=$(basename "$folder")

    json_file="$folder/pages.json"

    echo "Generating $json_file"

    cat > "$json_file" <<EOF
{
  "bookId": "$book_id",
  "pageCount": $page_count,
  "pageTemplate": "/cdn/books/$relative_path/pages/page-{page}.jpg"
}
EOF

done
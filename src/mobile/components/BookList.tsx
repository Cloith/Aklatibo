"use client";
import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import { BookDto } from "../lib/types";

export default function BooksList() {
  const [books, setBooks] = useState<BookDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("https://api.aklatibo.site/api/books");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBooks(data);
      } catch (err: any) {
        setError(err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!books || books.length === 0) return <div>No books</div>;

  return (
    <div style={{display:'grid',gap:12}}>
      {books.map((b: BookDto) => <BookCard key={b.slug ?? b.title} book={b} />)}
    </div>
  );
}
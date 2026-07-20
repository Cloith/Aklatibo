import React from "react";
import { BookDto } from "../lib/types";

function joinField(field?: string[] | string) {
  if (!field) return "";
  if (Array.isArray(field)) return field.join(", ");
  return field.split(",").map(s => s.trim()).join(", ");
}

export default function BookCard({ book }: { book: BookDto }) {
  return (
    <article style={{border:'1px solid #ddd',borderRadius:8,padding:12,display:'flex',gap:12}}>
      {book.coverImageUrl ? (
        <img src={book.coverImageUrl} alt={book.title} style={{width:96,height:128,objectFit:'cover',borderRadius:4}} />
      ) : (
        <div style={{width:96,height:128,background:'#f2f2f2',borderRadius:4}} />
      )}
      <div style={{flex:1}}>
        <h3 style={{margin:'0 0 6px 0'}}>{book.title}</h3>
        <div style={{color:'#666',fontSize:13,marginBottom:6}}>{joinField(book.authors)}</div>
        <p style={{margin:'0 0 8px 0',color:'#333',fontSize:14}}>{book.summary}</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {(Array.isArray(book.tags) ? book.tags : (typeof book.tags === 'string' ? book.tags.split(',').map(t=>t.trim()) : [])).slice(0,5).map(tag => (
            <span key={tag} style={{background:'#eef',padding:'4px 8px',borderRadius:999,fontSize:12}}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useRouter } from 'next/navigation';

type TabType = 'catalog' | 'shop' | 'settings';

export default function Home() {
    const [activeTab, setActiveTab] = useState<TabType>('catalog');
    const [books, setBooks] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [selectedBook, setSelectedBook] = useState<any | null>(null);
    const router = useRouter();

    // Scroll container reference to handle synchronized tab switching
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isManualScrolling = useRef(false);

    // Map tabs to indices for coordinate calculations
    const tabs: TabType[] = ['catalog', 'shop', 'settings'];

    useEffect(() => {
        async function loadBooks() {
            try {
                setIsLoadingBooks(true);
                const response = await fetch("https://api.aklatibo.site/api/books");
                const data = await response.json();
                setBooks(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoadingBooks(false);
            }
        }
        loadBooks();
    }, []);

    // Tracks horizontal scroll position to update bottom navigation active state
    const handleScroll = () => {
        if (!scrollContainerRef.current || isManualScrolling.current) return;
        
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const targetIndex = Math.round(scrollLeft / clientWidth);
        
        if (tabs[targetIndex] && tabs[targetIndex] !== activeTab) {
            setActiveTab(tabs[targetIndex]);
        }
    };

    // Smoothly scrolls to target tab view when navigation button is tapped
    const scrollToTab = (tab: TabType) => {
        if (!scrollContainerRef.current) return;
        
        const targetIndex = tabs.indexOf(tab);
        const clientWidth = scrollContainerRef.current.clientWidth;
        
        isManualScrolling.current = true;
        setActiveTab(tab);
        
        scrollContainerRef.current.scrollTo({
            left: targetIndex * clientWidth,
            behavior: 'smooth'
        });

        // Release lock once animation frame settles
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 300);
    };

    return (
    <div className="flex h-screen w-full flex-col bg-slate-900 text-slate-100 antialiased overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="flex h-16 items-center justify-center border-b border-slate-800 bg-slate-950 p-4 shrink-0 z-10">
            <h1 className="text-lg font-bold tracking-tight text-white text-center capitalize">
                {activeTab === 'catalog' ? 'My Books' : activeTab}
            </h1>
        </header>

        {/* SWIPABLE SWIPE VIEW CONTAINER */}
        <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
            {/* PANEL 1: CATALOG VIEW */}
            <section className="w-full h-full flex-shrink-0 snap-start overflow-y-auto p-4 space-y-6 pb-24 bg-slate-950">
                {isLoadingBooks ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                        <p className="text-sm text-slate-400">Fetching book catalog...</p>
                    </div>
                ) : books.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                        <div className="text-5xl mb-4">📚</div>
                        <h3 className="text-lg font-semibold text-white">No books available</h3>
                        <p className="text-sm text-slate-400 mt-2">The catalog is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {books.map((book: any) => (
                            <Card key={book.id} className="bg-slate-900 border-slate-800 p-3 flex flex-col items-center">
                                <img
                                    src={`https://api.aklatibo.site${book.coverImageUrl}`}
                                    alt={book.title}
                                    className="w-[160px] h-[240px] object-contain rounded-md"
                                />
                                <CardHeader className="w-full mt-2 text-center p-0">
                                    <CardTitle className="text-white text-sm font-medium leading-snug line-clamp-2 min-h-[40px]">
                                        {book.title}
                                    </CardTitle>
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => {
                                                localStorage.setItem("currentBookSlug", book.slug);
                                                router.push("/books");
                                            }}
                                        >
                                            Read
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setSelectedBook(book)}           
                                        >
                                            <Info className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            {/* PANEL 2: SHOP VIEW */}
            <section className="w-full h-full flex-shrink-0 snap-start overflow-y-auto p-4 pb-24 bg-slate-950 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold text-white">Book Store</h3>
                <p className="text-sm text-slate-400 mt-2">Browse and purchase new books here.</p>
            </section>

            {/* PANEL 3: SETTINGS VIEW */}
            <section className="w-full h-full flex-shrink-0 snap-start overflow-y-auto p-4 pb-24 bg-slate-950 flex flex-col items-center justify-center text-center">
                <div className="text-5xl mb-4">⚙️</div>
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <p className="text-sm text-slate-400 mt-2">Manage app preferences and configurations.</p>
            </section>
        </div>

        {/* MOBILE BOTTOM NAVIGATION */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/80 px-6 py-2 backdrop-blur-lg z-20">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <button 
                    onClick={() => scrollToTab('catalog')}
                    className={`flex flex-col items-center gap-1 p-2 text-xs transition ${activeTab === 'catalog' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                >
                    <span className="text-lg">📖</span>
                    Home
                </button>
                <button
                    onClick={() => scrollToTab('shop')}
                    className={`flex flex-col items-center gap-1 p-2 text-xs transition ${activeTab === 'shop' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                >
                    <span className="text-lg">🛒</span>            
                    Shop
                </button>
                <button 
                    onClick={() => scrollToTab('settings')}
                    className={`flex flex-col items-center gap-1 p-2 text-xs transition ${activeTab === 'settings' ? 'text-sky-400 font-semibold' : 'text-slate-400'}`}
                >
                    <span className="text-lg">⚙️</span>
                    Settings
                </button>
            </div>
        </nav>
        
        {/* DETAIL DIALOG */}
        <Dialog open={selectedBook !== null} onOpenChange={(open) => !open && setSelectedBook(null)}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white">
                {selectedBook && (
                    <>
                        <DialogHeader>
                            <DialogTitle>{selectedBook.title}</DialogTitle>
                        </DialogHeader>
                        <Tabs defaultValue="summary">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="summary">Summary</TabsTrigger>
                                <TabsTrigger value="authors">Authors</TabsTrigger>
                                <TabsTrigger value="details">Details</TabsTrigger>
                            </TabsList>
                            <TabsContent value="summary" className="mt-4">
                                <p className="text-sm text-slate-300">{selectedBook.summary}</p>
                            </TabsContent>
                            <TabsContent value="authors" className="mt-4">
                                <p className="text-sm text-slate-300">{selectedBook.authors}</p>
                            </TabsContent>
                            <TabsContent value="details" className="mt-4 space-y-2">
                                <div><span className="font-semibold">Publisher:</span> {selectedBook.publisher}</div>
                                <div><span className="font-semibold">Category:</span> {selectedBook.category}</div>
                                <div><span className="font-semibold">License:</span> {selectedBook.license}</div>
                                <div><span className="font-semibold">Tags:</span> {selectedBook.tags}</div>
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
    );
}
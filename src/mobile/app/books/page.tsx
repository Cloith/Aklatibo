'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ReaderPage() {
    const router = useRouter();
    const [manifest, setManifest] = useState<any>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [slug, setSlug] = useState<string | null>(null);
    const [loadedPages, setLoadedPages] = useState<Record<number, boolean>>({});
    
    const preloadedUrls = useRef<Set<string>>(new Set());
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isManualScrolling = useRef(false);

    // Zoom and Pan state primitives tracked on refs to bypass structural React rendering lag during 60FPS touches
    const zoomRef = useRef({
        scale: 1,
        translateX: 0,
        translateY: 0,
        startX: 0,
        startY: 0,
        initialDistance: 0,
        isDragging: false
    });
    
    const [isZoomed, setIsZoomed] = useState(false); // Used to toggle scroll-snapping tracking on or off dynamically
    const activeImageRef = useRef<HTMLImageElement | null>(null);
    const activePointers = useRef<Record<number, PointerEvent>>({});

    const getPageUrl = (pageNum: number) => {
        if (!manifest) return '';
        return `https://api.aklatibo.site` + 
            manifest.pageTemplate.replace('{page}', pageNum.toString().padStart(4, '0'));
    };

    // 1. Load selected book slug from localStorage
    useEffect(() => {
        const savedSlug = localStorage.getItem('currentBookSlug');
        setSlug(savedSlug);

        if (savedSlug) {
            const lastPage = localStorage.getItem(`read_pos_${savedSlug}`);
            if (lastPage) setPageNumber(parseInt(lastPage, 10));
        }
    }, []);

    // 2. Intercept Capacitor hardware back button
    useEffect(() => {
        const backListener = App.addListener('backButton', () => {
            router.push('/dashboard');
        });

        return () => {
            backListener.then(listener => listener.remove());
        };
    }, [router]);

    // 3. Persist reading progress
    useEffect(() => {
        if (slug) {
            localStorage.setItem(`read_pos_${slug}`, pageNumber.toString());
        }
        // Reset translation layers cleanly when turning pages
        resetZoomState();
    }, [pageNumber, slug]);

    // 4. Load page manifest
    useEffect(() => {
        if (!slug) return;
        async function loadManifest() {
            try {
                const response = await fetch(`https://api.aklatibo.site/api/books/${slug}/pages`);
                const data = await response.json();
                setManifest(data);
            } catch (error) {
                console.error('Failed to load manifest:', error);
            }
        }
        loadManifest();
    }, [slug]);

    // 5. Initial scroll sync
    useEffect(() => {
        if (!manifest || !scrollContainerRef.current) return;
        const clientWidth = scrollContainerRef.current.clientWidth;
        scrollContainerRef.current.scrollLeft = (pageNumber - 1) * clientWidth;
    }, [manifest]);

    // 6. Lookahead preloader
    useEffect(() => {
        if (!manifest) return;
        const lookAheadRange = 5;
        for (let i = 1; i <= lookAheadRange; i++) {
            const nextTargetPage = pageNumber + i;
            if (nextTargetPage > manifest.pageCount) break;

            const targetUrl = getPageUrl(nextTargetPage);
            if (!preloadedUrls.current.has(targetUrl)) {
                preloadedUrls.current.add(targetUrl);
                const img = new Image();
                img.src = targetUrl;
            }
        }
    }, [pageNumber, manifest]);

    // Track scroll events when container is un-zoomed
    const handleScroll = () => {
        if (!scrollContainerRef.current || isManualScrolling.current || isZoomed) return;

        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        if (clientWidth === 0) return;

        const targetPage = Math.round(scrollLeft / clientWidth) + 1;
        if (targetPage !== pageNumber && targetPage >= 1 && targetPage <= (manifest?.pageCount || 1)) {
            setPageNumber(targetPage);
        }
    };

    const navigateToPage = (targetPage: number) => {
        if (!scrollContainerRef.current || !manifest) return;
        if (targetPage < 1 || targetPage > manifest.pageCount) return;

        isManualScrolling.current = true;
        setPageNumber(targetPage);

        const clientWidth = scrollContainerRef.current.clientWidth;
        scrollContainerRef.current.scrollTo({
            left: (targetPage - 1) * clientWidth,
            behavior: 'smooth'
        });

        setTimeout(() => {
            isManualScrolling.current = false;
        }, 300);
    };

    // Zoom Management Functions
    const applyTransformations = () => {
        if (!activeImageRef.current) return;
        const { scale, translateX, translateY } = zoomRef.current;
        activeImageRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    const resetZoomState = () => {
        zoomRef.current = { scale: 1, translateX: 0, translateY: 0, startX: 0, startY: 0, initialDistance: 0, isDragging: false };
        activePointers.current = {};
        setIsZoomed(false);
        applyTransformations();
    };

    // Multi-touch tracking events
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.currentTarget.querySelector('img');
        if (target) activeImageRef.current = target;
        
        activePointers.current[e.pointerId] = e.nativeEvent;
        const pointers = Object.values(activePointers.current);

        if (pointers.length === 1) {
            zoomRef.current.isDragging = zoomRef.current.scale > 1;
            zoomRef.current.startX = pointers[0].clientX - zoomRef.current.translateX;
            zoomRef.current.startY = pointers[0].clientY - zoomRef.current.translateY;
        } else if (pointers.length === 2) {
            zoomRef.current.isDragging = false;
            const dx = pointers[0].clientX - pointers[1].clientX;
            const dy = pointers[0].clientY - pointers[1].clientY;
            zoomRef.current.initialDistance = Math.sqrt(dx * dx + dy * dy);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!activePointers.current[e.pointerId]) return;
        activePointers.current[e.pointerId] = e.nativeEvent;
        const pointers = Object.values(activePointers.current);

        if (pointers.length === 1 && zoomRef.current.isDragging) {
            // Pan operations inside a zoomed target frame boundary
            zoomRef.current.translateX = pointers[0].clientX - zoomRef.current.startX;
            zoomRef.current.translateY = pointers[0].clientY - zoomRef.current.startY;
            applyTransformations();
        } else if (pointers.length === 2) {
            // Multi-touch structural dynamic pinch zoom operations
            const dx = pointers[0].clientX - pointers[1].clientX;
            const dy = pointers[0].clientY - pointers[1].clientY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (zoomRef.current.initialDistance > 0) {
                const deltaScale = currentDistance / zoomRef.current.initialDistance;
                const targetScale = Math.max(1, Math.min(4, zoomRef.current.scale * deltaScale));
                
                zoomRef.current.scale = targetScale;
                setIsZoomed(targetScale > 1);
                applyTransformations();
                zoomRef.current.initialDistance = currentDistance; // Recenter distance maps iteratively
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        delete activePointers.current[e.pointerId];
        const pointers = Object.values(activePointers.current);

        if (pointers.length < 2) {
            zoomRef.current.initialDistance = 0;
        }
        if (pointers.length === 0) {
            zoomRef.current.isDragging = false;
            // Clean snapback mechanics if user drops beneath basic scaling visibility lines
            if (zoomRef.current.scale <= 1.05) {
                resetZoomState();
            }
        }
    };

    if (!manifest) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                <p>Loading book...</p>
            </div>
        );
    }

    const totalPagesArr = Array.from({ length: manifest.pageCount }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none">

            {/* Header */}
            <div className="h-14 p-4 flex items-center justify-between border-b border-slate-800 bg-slate-950/50 backdrop-blur-md z-10">
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition active:scale-95"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Dashboard</span>
                </button>
                <div className="text-sm font-semibold font-mono text-slate-200">
                    Page {pageNumber} / {manifest.pageCount}
                </div>
                <div className="w-5" />
            </div>

            {/* Viewport Box - Pointer event intercept loops mapped below */}
            <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`flex-1 flex overflow-y-hidden select-none no-scrollbar ${
                    isZoomed ? 'overflow-x-hidden touch-none' : 'overflow-x-auto snap-x snap-mandatory scroll-smooth'
                }`}
                style={{ WebkitOverflowScrolling: isZoomed ? 'auto' : 'touch' }}
            >
                {totalPagesArr.map((pageNum) => {
                    const isVisible = Math.abs(pageNumber - pageNum) <= 1;
                    return (
                        <div 
                            key={pageNum} 
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            className="w-full h-full flex-shrink-0 snap-start snap-always relative flex items-center justify-center p-4 bg-neutral-950 touch-none select-none overflow-hidden"
                        >
                            {isVisible && (
                                <>
                                    {!loadedPages[pageNum] && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-20">
                                            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                                        </div>
                                    )}
                                    <img
                                        src={getPageUrl(pageNum)}
                                        alt={`Page ${pageNum}`}
                                        className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-sm will-change-transform origin-center select-none pointer-events-none"
                                        onLoad={() => setLoadedPages(prev => ({ ...prev, [pageNum]: true }))}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Navigation Slider & Controls */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col gap-4 shadow-xl z-10">
                <input 
                    type="range"
                    min="1"
                    max={manifest.pageCount}
                    value={pageNumber}
                    onChange={(e) => navigateToPage(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <div className="flex gap-3">
                    <button
                        className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition rounded-xl p-3.5 font-medium text-sm disabled:opacity-40"
                        disabled={pageNumber === 1}
                        onClick={() => navigateToPage(pageNumber - 1)}
                    >
                        Previous
                    </button>
                    <button
                        className="flex-1 bg-sky-600 hover:bg-sky-500 active:scale-[0.98] transition rounded-xl p-3.5 font-medium text-sm disabled:opacity-40"
                        disabled={pageNumber === manifest.pageCount}
                        onClick={() => navigateToPage(pageNumber + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
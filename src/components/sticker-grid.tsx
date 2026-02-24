import { useRef, useEffect, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useAppStore } from '@/store/useAppStore';
import { StickerCard } from './sticker-card';
import { motion } from 'framer-motion';

export function StickerGrid() {
  const { results, isSearching, searchQuery } = useAppStore();
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Responsive column calculation
  const [columns, setColumns] = useState(2);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(5);
      else if (width >= 1024) setColumns(4);
      else if (width >= 768) setColumns(3);
      else setColumns(2);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const rowCount = Math.ceil(results.length / columns);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 280, // Approximate height of a row
    overscan: 5,
  });

  if (!isSearching && results.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-light text-white/50"
        >
          Vibe not found, try another situation...
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="w-full min-h-screen">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowStickers = results.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid gap-6 px-4 md:px-8"
              // Dynamic grid template based on columns state
              // We use inline style for the grid template to match the calculated columns
            >
               <div 
                 className="grid gap-6 w-full h-full"
                 style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
               >
                {rowStickers.map((sticker) => (
                  <motion.div
                    key={sticker.sticker_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <StickerCard sticker={sticker} />
                  </motion.div>
                ))}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

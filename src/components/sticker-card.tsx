import React from 'react';
import { Sticker, BASE_URL } from '@/lib/api';
import { GlassCard } from './ui/glass-card';
import { toast } from 'sonner';
import { Copy, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface StickerCardProps {
  sticker: Sticker;
}

export function StickerCard({ sticker }: StickerCardProps) {
  const fullImageUrl = sticker.image_url.startsWith('http') 
    ? sticker.image_url 
    : `${BASE_URL}${sticker.image_url}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      
      // Convert WebP blob to PNG using Canvas (browsers don't support copying WebP directly)
      const img = new Image();
      const objectUrl = URL.createObjectURL(blob);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failed');
      
      ctx.drawImage(img, 0, 0);
      
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      
      URL.revokeObjectURL(objectUrl);
      if (!pngBlob) throw new Error('PNG conversion failed');

      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
      toast.success("Vibe copied! 🚀");
    } catch (error) {
      console.error("Copy failed", error);
      toast.error("Failed to copy vibe 😢");
    }
  };

  return (
    <GlassCard hoverEffect onClick={() => {}} className="group h-full flex flex-col">
      <div className="relative aspect-square p-4 flex items-center justify-center overflow-hidden">
        <motion.img
          layoutId={`sticker-${sticker.sticker_id}`}
          src={fullImageUrl}
          alt={sticker.match_explanation || "Sticker"}
          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-4">
          <button 
            onClick={handleCopy}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 transition-all transform hover:scale-110 active:scale-95"
          >
            <Copy className="w-6 h-6 text-white" />
          </button>
          {sticker.confidence_score && (
            <span className="text-xs font-mono text-electric-cyan bg-black/50 px-2 py-1 rounded-full border border-white/10">
              {Math.round(sticker.confidence_score * 100)}% Match
            </span>
          )}
        </div>
      </div>
      
      {sticker.match_explanation && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 border-t border-white/10">
          <p className="text-xs text-white/80 line-clamp-2">
            {sticker.match_explanation}
          </p>
        </div>
      )}
    </GlassCard>
  );
}

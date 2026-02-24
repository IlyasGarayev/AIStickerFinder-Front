import React, { useState, useRef } from 'react';
import { Video, Upload, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";

export function VeoCreator() {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedVideoUrl(null);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;

    try {
      // Check for API Key
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const success = await window.aistudio.openSelectKey();
        if (!success) {
           toast.error("API Key required for Veo");
           return;
        }
      }

      setIsGenerating(true);
      
      // Initialize GenAI
      // Note: In a real app, we should probably move this to a service, 
      // but for this specific component logic it's fine here.
      // We need to recreate the client to ensure it picks up the key if it was just selected.
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(image);
      
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
          let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt || 'Animate this image cinematically',
            image: {
              imageBytes: base64Data,
              mimeType: image.type,
            },
            config: {
              numberOfVideos: 1,
              resolution: '720p',
              aspectRatio: '16:9' // Defaulting to landscape as per requirements (or 9:16)
            }
          });

          // Poll for completion
          while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
          }

          const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
          
          if (videoUri) {
             // Fetch the video content with the API key header
             const videoRes = await fetch(videoUri, {
               headers: {
                 'x-goog-api-key': process.env.GEMINI_API_KEY || ''
               }
             });
             const videoBlob = await videoRes.blob();
             const videoUrl = URL.createObjectURL(videoBlob);
             setGeneratedVideoUrl(videoUrl);
             toast.success("Video generated successfully!");
          } else {
            throw new Error("No video URI returned");
          }

        } catch (err: any) {
          console.error("Veo generation error:", err);
          toast.error("Failed to generate video: " + (err.message || "Unknown error"));
          
          // Handle specific error for key not found if needed, though hasSelectedApiKey check helps
          if (err.message?.includes("Requested entity was not found")) {
             await window.aistudio.openSelectKey();
          }
        } finally {
          setIsGenerating(false);
        }
      };

    } catch (error) {
      console.error("Setup error:", error);
      setIsGenerating(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 p-4 bg-gradient-to-r from-electric-violet to-electric-cyan rounded-full shadow-2xl transition-all z-50 group hover:scale-110"
      >
        <Video className="w-6 h-6 text-white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <GlassCard className="p-8 border-electric-violet/30">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-electric-cyan" />
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-violet to-electric-cyan">
                      Animate Vibe with Veo
                    </h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-6 h-6 text-white/70" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Input */}
                  <div className="space-y-6">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-electric-violet/50 bg-white/5 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden relative group"
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-white/50 mb-2 group-hover:text-electric-violet" />
                          <span className="text-sm text-white/50">Upload Image</span>
                        </>
                      )}
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Prompt (Optional)</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe how it should move..."
                        className="w-full h-24 bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-electric-cyan outline-none resize-none"
                      />
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={!image || isGenerating}
                      className="w-full py-3 bg-gradient-to-r from-electric-violet to-electric-cyan rounded-xl font-semibold text-white shadow-lg shadow-electric-violet/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Dreaming...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Generate Video</span>
                        </>
                      )}
                    </button>
                    
                    <div className="flex items-start gap-2 text-xs text-white/40">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>Requires a paid Google Cloud Project API key. You will be prompted to select one.</p>
                    </div>
                  </div>

                  {/* Right: Output */}
                  <div className="bg-black/40 rounded-xl border border-white/10 p-4 flex items-center justify-center min-h-[300px]">
                    {generatedVideoUrl ? (
                      <video 
                        src={generatedVideoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full h-full rounded-lg shadow-2xl"
                      />
                    ) : (
                      <div className="text-center text-white/30">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Generated video will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

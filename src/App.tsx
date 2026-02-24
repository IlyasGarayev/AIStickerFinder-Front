import { Toaster } from 'sonner';
import { SearchBar } from './components/search-bar';
import { StickerGrid } from './components/sticker-grid';
import { AdminPanel } from './components/admin-panel';
import { VeoCreator } from './components/veo-creator';
import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen bg-midnight text-white selection:bg-electric-violet/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0"></div>
      
      {/* Ambient Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-electric-violet/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-electric-cyan/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
        <header className="flex flex-col items-center gap-6 mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50"
          >
            Vibe Search
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-center max-w-md"
          >
            Find the perfect sticker for any situation using semantic AI search.
          </motion.p>
          
          <div className="w-full mt-4">
            <SearchBar />
          </div>
        </header>

        <section className="flex-1">
          <StickerGrid />
        </section>
      </main>

      <AdminPanel />
      <VeoCreator />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}

export default App;

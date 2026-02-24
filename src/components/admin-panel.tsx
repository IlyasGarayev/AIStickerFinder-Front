import { useState } from 'react';
import { Settings, RefreshCw, Database, X, Check, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { GlassCard } from './ui/glass-card';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { stats, fetchStats, triggerIndexing, syncPack } = useAppStore();
  const [packUrl, setPackUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!packUrl) return;
    setLoading(true);
    try {
      const res = await syncPack(packUrl);
      toast.success(`Synced ${res.downloaded} stickers!`);
      setPackUrl('');
      fetchStats();
    } catch (e) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleIndex = async () => {
    setLoading(true);
    try {
      const res = await triggerIndexing();
      toast.success(`Indexed ${res.indexed} new stickers!`);
      fetchStats();
    } catch (e) {
      toast.error("Indexing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { setIsOpen(true); fetchStats(); }}
        className="fixed bottom-6 right-6 p-4 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full shadow-2xl transition-all z-50 group"
      >
        <Settings className="w-6 h-6 text-white/50 group-hover:text-white group-hover:rotate-90 transition-all" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Admin Controls</h2>
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5 text-white/70" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Stats */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-mono text-white/50 uppercase">System Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-xs text-white/50">Total Indexed</div>
                        <div className="text-xl font-mono text-electric-cyan">
                          {stats?.total_indexed_stickers || 0}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="text-xs text-white/50">Status</div>
                        <div className="text-xl font-mono text-green-400">
                          {stats?.status || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-white/70">Sync Sticker Pack</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={packUrl}
                          onChange={(e) => setPackUrl(e.target.value)}
                          placeholder="https://t.me/addstickers/..."
                          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-electric-violet outline-none"
                        />
                        <button
                          onClick={handleSync}
                          disabled={loading || !packUrl}
                          className="p-2 bg-electric-violet/20 hover:bg-electric-violet/40 border border-electric-violet/50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleIndex}
                      disabled={loading}
                      className="w-full py-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                      <span>Trigger Re-Indexing</span>
                    </button>
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

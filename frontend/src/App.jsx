import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Plus, Sparkles, Image as ImageIcon, Loader2, AlertCircle,
  ChevronDown, Check, GitBranch, Terminal, History, Cloud, Clock,
  Trash2, ExternalLink, Zap, Palette, Layers, MousePointer2, User
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

// Helper components for better organization
const Camera = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>;

const STYLES = [
  { id: 'realistic', name: 'Realistic', icon: <Camera size={14} /> },
  { id: 'anime', name: 'Anime', icon: <Palette size={14} /> },
  { id: 'cinematic', name: 'Cinematic', icon: <Layers size={14} /> },
  { id: '3d render', name: '3D Render', icon: <Zap size={14} /> }
];

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter',
});

function App() {
  const [activeTab, setActiveTab] = useState('manifest');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(STYLES[0].id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mermaidRef = useRef(null);

  // History State
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archivistName, setArchivistName] = useState('');

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      mermaidRef.current.removeAttribute('data-processed');
      mermaid.render('mermaid-svg', mermaidCode).then(({ svg }) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;
        }
      }).catch(err => {
        console.error('Mermaid Render Error:', err);
      });
    }

    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [mermaidCode, activeTab]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const q = query(collection(db, "visuals"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHistoryItems(items);
    } catch (err) {
      console.error("Fetch History Error:", err);
      setError("Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleManifest = async () => {
    if (!prompt.trim()) return setError('Please enter a concept to manifest.');
    setLoading(true);
    setError(null);
    setImage(null);
    setMermaidCode('');

    try {
      // Parallel generation for speed
      const [imgResp, diagResp] = await Promise.all([
        axios.post(`${API_BASE_URL}/generate`, { prompt, style }),
        axios.post(`${API_BASE_URL}/generate-diagram`, { prompt })
      ]);

      setImage(imgResp.data.image);
      setEnhancedPrompt(imgResp.data.enhancedPrompt);
      setMermaidCode(diagResp.data.mermaidCode);
    } catch (err) {
      console.error("Manifest Error:", err);
      setError('Neural manifestation partially failed. Check your connection.');
    } finally {
      setLoading(false);
      setIsSaved(false); // Reset saved status for new generation
    }
  };

  const handleSaveToCloud = async () => {
    if (!image && !mermaidCode) return;
    if (isSaved) return;

    if (!archivistName.trim()) {
      setIsModalOpen(true);
      return;
    }

    setSaving(true);
    try {
      const data = {
        type: 'manifestation',
        prompt: prompt,
        image: image,
        enhancedPrompt: enhancedPrompt,
        mermaidCode: mermaidCode,
        style: style,
        archivist: archivistName,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "visuals"), data);
      setIsSaved(true);
      setIsModalOpen(false);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Save Error:", err);
      alert('Failed to archive manifestation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this visual?")) return;
    try {
      await deleteDoc(doc(db, "visuals", itemId));
      setHistoryItems(historyItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Failed to delete.");
    }
  };

  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = `manifest-${Date.now()}.jpg`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-papa-green-light selection:text-white pb-32">
      <div className="mesh-bg" />

      {/* Modern Background Layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="neural-orb w-[60vw] h-[60vw] -top-[10%] -left-[10%] bg-papa-green/20"
        />
        <motion.div
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="neural-orb w-[50vw] h-[50vw] -bottom-[10%] -right-[10%] bg-haze/10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="neural-orb w-[40vw] h-[40vw] top-[30%] left-[20%] bg-papa-green-light/10"
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto px-6 relative z-10"
      >
        {/* Sleek Navigation Bar */}
        <header className="py-8 flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex items-center gap-5"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-14 h-14 bg-papa-green rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(27,55,51,0.5)] ring-1 ring-white/20 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles className="text-haze" size={28} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-display font-black text-haze tracking-tight">AI Visual Suite</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-haze/20" />
                <p className="text-[9px] text-haze/30 font-black tracking-[0.5em] uppercase">v2.5 Aesthetic Edition</p>
              </div>
            </div>
          </motion.div>

          <nav className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-2xl relative">
            {['manifest', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(null); }}
                className={`relative px-12 py-3.5 rounded-full transition-all duration-500 text-sm font-bold flex items-center gap-3 overflow-hidden capitalize ${activeTab === tab ? 'text-papa-green' : 'text-haze/40 hover:text-haze hover:bg-white/5'}`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="tab-glow"
                    className="absolute inset-0 bg-haze shadow-[0_0_30px_rgba(234,238,239,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === 'manifest' && <Zap size={16} />}
                  {tab === 'history' && <History size={16} />}
                  {tab}
                </span>
              </button>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-4 py-2 px-5 bg-white/5 rounded-full border border-white/5 text-[11px] font-bold text-haze/60"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            STABILITY_AI_READY
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Input Control Panel */}
          <div className="lg:col-span-12 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4 mb-8"
            >
              <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight px-4 leading-[0.9]">
                Architect <span className="text-haze/20 italic">Visuals</span> <br />
                <span className="bg-gradient-to-r from-haze to-papa-green-light bg-clip-text text-transparent">With Intelligence.</span>
              </h1>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab !== 'history' ? (
                <motion.div
                  key="generation-workspace"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-12"
                >
                  <div className="glass-card rounded-[3.5rem] p-2 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-papa-green/10 via-transparent to-transparent pointer-events-none" />

                    <div className="p-8 space-y-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-haze/30">
                            Cognitive Input Stream
                          </label>
                          <div className="flex gap-2">
                            <span className="text-[10px] bg-haze/5 px-3 py-1 rounded-full text-haze/40 border border-white/5">Dual Synthesis Active</span>
                          </div>
                        </div>
                        <motion.textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          whileFocus={{ scale: 1.005, boxShadow: '0 0 50px rgba(234, 238, 239, 0.05)' }}
                          placeholder="Describe anything... the suite will architect both the Art and the Logic."
                          className="w-full h-44 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-10 text-2xl font-light focus:outline-none focus:border-haze/20 focus:bg-white/[0.03] transition-all resize-none shadow-inner placeholder:text-white/5 placeholder:font-display leading-relaxed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-4 relative group/select">
                          <label className="absolute -top-3 left-6 px-3 bg-papa-green-dark text-[9px] font-bold text-haze/40 uppercase tracking-widest z-10 border border-white/5 rounded-full">Artistic Style</label>
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full h-[72px] flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-8 hover:bg-white/[0.06] transition-all group overflow-hidden"
                          >
                            <div className="flex items-center gap-4 relative z-10">
                              <div className="p-2.5 rounded-xl bg-papa-green text-haze shadow-lg">{STYLES.find(s => s.id === style)?.icon}</div>
                              <span className="capitalize text-base font-bold tracking-tight text-haze/90">{style}</span>
                            </div>
                            <ChevronDown size={20} className={`text-haze/30 transition-transform relative z-10 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-haze/20 to-transparent translate-y-1 group-hover/select:translate-y-0 transition-transform" />
                          </button>

                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 15 }}
                                className="absolute bottom-full left-0 w-full mb-4 bg-black/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 p-2 z-[100] shadow-2xl overflow-hidden"
                              >
                                {STYLES.map((s) => (
                                  <button
                                    key={s.id}
                                    onClick={() => { setStyle(s.id); setIsDropdownOpen(false); }}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-[1.2rem] transition-all ${style === s.id ? 'bg-haze text-papa-green shadow-xl' : 'hover:bg-white/5 text-haze/50 hover:text-haze'}`}
                                  >
                                    <div className="flex items-center gap-4 font-bold text-sm">
                                      {s.icon}
                                      {s.name}
                                    </div>
                                    {style === s.id && <Check size={16} />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="md:col-span-8">
                          <motion.button
                            onClick={handleManifest}
                            disabled={loading}
                            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(234, 238, 239, 0.2)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full h-[72px] bg-haze rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] text-papa-green-dark flex items-center justify-center gap-4 shadow-2xl shadow-haze/10 transition-all disabled:opacity-20 group relative overflow-hidden"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            {loading ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="fill-current" />}
                            {loading ? 'Synthesizing Neural Flow...' : 'Execute Manifestation'}
                          </motion.button>
                        </div>
                      </div>

                      {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-center gap-4 text-red-200">
                          <div className="p-2 bg-red-500/20 rounded-lg"><AlertCircle size={18} /></div>
                          <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Output Display Zone */}
                  <div className="relative min-h-[500px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      {loading && (
                        <motion.div
                          key="loader"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex flex-col items-center gap-8 py-20"
                        >
                          <div className="relative">
                            <div className="w-24 h-24 border-2 border-haze/5 rounded-full absolute inset-0 animate-ping" />
                            <div className="w-24 h-24 border-t-2 border-r-2 border-haze rounded-full animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="text-haze animate-pulse" size={32} />
                            </div>
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="text-2xl font-display font-bold text-haze">Wait for Brilliance</h3>
                            <p className="text-haze/40 text-sm font-light">Gemini is architecting your visual narrative.</p>
                          </div>
                        </motion.div>
                      )}

                      {!loading && !image && !mermaidCode && (
                        <motion.div
                          key="empty"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="w-full flex flex-col items-center justify-center p-24 border border-dashed border-white/5 rounded-[3rem] text-center"
                        >
                          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 opacity-20">
                            <MousePointer2 size={40} className="text-haze animate-float" />
                          </div>
                          <p className="text-[10px] font-black tracking-[0.4em] text-haze/20 uppercase">Awaiting Cognitive Input</p>
                        </motion.div>
                      )}

                      {(image || mermaidCode) && !loading && (
                        <motion.div
                          key="output-dual"
                          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                          className="w-full space-y-20"
                        >
                          <div className="flex justify-center mb-10">
                            <motion.button
                              onClick={handleSaveToCloud}
                              disabled={saving || isSaved}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-12 py-5 rounded-full border border-white/20 flex items-center gap-4 font-black text-[10px] tracking-[0.4em] uppercase transition-all shadow-2xl ${isSaved ? 'bg-green-500 text-white shadow-green-500/40' : 'glass text-haze hover:bg-white/10 shadow-black/60 glow-heavy'}`}
                            >
                              {saving ? <Loader2 className="animate-spin" size={16} /> : isSaved ? <Check size={16} /> : <Cloud size={16} />}
                              {isSaved ? 'Manifestation Vaulted' : 'Archive Full Package to Vault'}
                            </motion.button>
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-start">
                            {/* Cinematic Art Side */}
                            <motion.div
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                              className="space-y-10"
                            >
                              <div className="flex items-center justify-between px-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-haze/30">Manifested Vision</h3>
                                <motion.button whileHover={{ scale: 1.2 }} onClick={handleDownload} className="text-haze/20 hover:text-haze"><Download size={20} /></motion.button>
                              </div>
                              <div className="relative group rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                                {image ? (
                                  <img src={image} className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" alt="Art Output" />
                                ) : (
                                  <div className="aspect-square bg-white/5 flex items-center justify-center border border-dashed border-white/10 rounded-[3.5rem]">
                                    <ImageIcon size={60} className="text-white/5" />
                                  </div>
                                )}
                              </div>
                              {enhancedPrompt && (
                                <div className="glass p-10 rounded-[3rem] border border-white/5 shadow-inner">
                                  <div className="flex items-center gap-3 mb-6 opacity-20">
                                    <Sparkles size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Neural Polish</span>
                                  </div>
                                  <p className="text-lg font-light italic text-haze/70 leading-relaxed font-display">"{enhancedPrompt}"</p>
                                </div>
                              )}
                            </motion.div>

                            {/* Technical Logic Side */}
                            <motion.div
                              initial={{ opacity: 0, x: 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                              className="space-y-10"
                            >
                              <div className="flex items-center justify-between px-8">
                                <h3 className="text-xs font-black uppercase tracking-[0.5em] text-haze/30">Architectural Logic</h3>
                                <div className="p-1.5 px-4 bg-white/5 rounded-full text-[10px] font-black text-haze/20 border border-white/5 uppercase tracking-widest">Mermaid.js</div>
                              </div>
                              <div className="w-full glass-card rounded-[3.5rem] p-16 shadow-[0_50px_100px_rgba(0,0,0,0.6)] min-h-[500px] flex items-center justify-center relative">
                                {mermaidCode ? (
                                  <div ref={mermaidRef} className="mermaid w-full h-full opacity-90 transition-opacity hover:opacity-100" />
                                ) : (
                                  <div className="flex flex-col items-center gap-6 opacity-5">
                                    <GitBranch size={60} />
                                    <span className="text-[12px] font-black uppercase tracking-widest">Awaiting Structural Data</span>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="history-zone"
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 pb-40"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-display font-bold text-haze">The Visual Crypt</h2>
                    <p className="text-haze/40 text-sm font-light">Stored iterations of neural creativity.</p>
                  </div>

                  {historyLoading ? (
                    <div className="py-40 text-center space-y-6 bg-white/5 rounded-[4rem] border border-white/5">
                      <div className="w-20 h-20 border-t-2 border-haze rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-haze/40">Syncing Crypt Data</p>
                    </div>
                  ) : historyItems.length === 0 ? (
                    <div className="py-40 text-center space-y-8 border-2 border-dashed border-white/5 rounded-[4rem]">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-10">
                        <History size={48} />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold">Crypt is Empty</h3>
                        <p className="text-haze/40 max-w-xs mx-auto">No manifestations have been archived in this session yet.</p>
                      </div>
                      <button onClick={() => setActiveTab('manifest')} className="bg-haze text-papa-green px-10 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:scale-110 active:scale-95 transition-all">Manifest Now</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {historyItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                          whileHover={{ y: -10, boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
                          className="glass-card rounded-[3rem] border border-white/5 overflow-hidden group hover:border-haze/30 transition-all duration-700 shadow-2xl"
                        >
                          <div className="aspect-[16/10] relative overflow-hidden">
                            {item.image ? (
                              <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Archived Visual" />
                            ) : (
                              <div className="w-full h-full bg-papa-green/20 flex flex-col items-center justify-center p-8 text-center gap-4">
                                <GitBranch size={40} className="text-haze" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-haze/30">Logic Manifestation</span>
                              </div>
                            )}
                            <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-haze">
                              Manifestation
                            </div>
                            <div className="absolute inset-0 bg-papa-green-dark/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 translate-y-full group-hover:translate-y-0">
                              <motion.button
                                onClick={() => {
                                  setImage(item.image);
                                  setEnhancedPrompt(item.enhancedPrompt);
                                  setMermaidCode(item.mermaidCode);
                                  setPrompt(item.prompt);
                                  setActiveTab('manifest');
                                }}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-16 h-16 rounded-3xl bg-haze text-papa-green flex items-center justify-center shadow-2xl shadow-haze/20 transition-all"
                              >
                                <ExternalLink size={24} />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDelete(item.id)}
                                whileHover={{ scale: 1.1, rotate: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-16 h-16 rounded-3xl bg-white/10 text-red-400 backdrop-blur-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-white/10"
                              >
                                <Trash2 size={24} />
                              </motion.button>
                            </div>
                          </div>
                          <div className="p-8 space-y-6">
                            <p className="text-sm font-light text-haze/60 leading-relaxed line-clamp-3 italic">"{item.prompt}"</p>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                              <span className="flex items-center gap-2 text-[10px] font-bold text-haze/20 uppercase tracking-widest">
                                <Clock size={12} /> {item.createdAt?.toDate().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) || 'Recent'}
                              </span>
                              {item.archivist && (
                                <span className="flex items-center gap-2 text-[10px] font-bold text-papa-green-light uppercase tracking-widest bg-papa-green/30 px-3 py-1 rounded-full">
                                  <User size={10} /> {item.archivist}
                                </span>
                              )}
                              <div className="w-2 h-2 rounded-full bg-haze/10" />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="mt-40 border-t border-white/5 pt-16 flex flex-col md:flex-row items-center justify-between gap-8 opacity-20 hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Workspace • Suite 2.5</p>
          <div className="flex gap-12">
            {['Stability AI', 'Gemini Pro', 'Firestore'].map(tech => (
              <span key={tech} className="text-[9px] font-bold uppercase tracking-widest">{tech}</span>
            ))}
          </div>
          <p className="text-[10px] text-haze/40">© 2026 AI Visual Lab</p>
        </footer>
      </motion.main>

      {/* Attribution Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-papa-green-dark/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-12 shadow-2xl relative z-10"
            >
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-haze/5 rounded-[2rem] flex items-center justify-center text-haze">
                  <User size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-bold text-haze">Identify Archivist</h3>
                  <p className="text-haze/40 text-sm font-light">Sign your neural manifestation before it's vaulted.</p>
                </div>
                <input
                  type="text"
                  value={archivistName}
                  onChange={(e) => setArchivistName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center text-xl font-bold focus:outline-none focus:ring-1 focus:ring-haze/20 transition-all placeholder:text-white/10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveToCloud()}
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-4 w-full pt-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="py-4 rounded-xl border border-white/5 hover:bg-white/5 text-haze/40 font-bold text-xs uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveToCloud}
                    className="py-4 rounded-xl bg-haze text-papa-green font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-haze/10"
                  >
                    Authorize Vault
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

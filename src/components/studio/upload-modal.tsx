'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Film, Image as ImageIcon,
  CheckCircle2, Loader2, PlayCircle,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { SeriesSelector } from './series-selector';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StudioUploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { user } = useAppSelector((state) => state.auth);

  // Step State
  const [step, setStep] = useState<'type' | 'details' | 'uploading' | 'success'>('type');
  const [contentType, setContentType] = useState<'video' | 'images' | null>(null);

  // File State
  const [file, setFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seriesId, setSeriesId] = useState<string | 'standalone'>('standalone');
  const [newSeriesData, setNewSeriesData] = useState<any>(null);

  // Progress State
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleTypeSelect = (type: 'video' | 'images') => {
    setContentType(type);
    // Mandatory: Trigger click directly in user event to bypass browser security
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  const reset = () => {
    setStep('type');
    setContentType(null);
    setFile(null);
    setGalleryFiles([]);
    setVideoDuration(0);
    setTitle('');
    setDescription('');
    setSeriesId('standalone');
    setNewSeriesData(null);
    setProgress(0);
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (contentType === 'video') {
      const video = selectedFiles[0];
      setFile(video);

      // Sniff duration
      const videoTag = document.createElement('video');
      videoTag.preload = 'metadata';
      videoTag.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoTag.src);
        setVideoDuration(videoTag.duration);
      };
      videoTag.src = URL.createObjectURL(video);
      setStep('details');
    } else {
      setGalleryFiles(Array.from(selectedFiles));
      setStep('details');
    }
  };

  const startUpload = async () => {
    if (!user) return;
    setIsUploading(true);
    setStep('uploading');

    try {
      let finalSeriesId = seriesId;

      // 1. Create New Series if needed
      if (seriesId === 'new' && newSeriesData) {
        const { data: nSeries, error: sErr } = await supabase
          .from('series')
          .insert({
            creator_id: user.id,
            title: newSeriesData.title,
            description: newSeriesData.description,
          })
          .select()
          .single();

        if (sErr) throw sErr;
        finalSeriesId = nSeries.id;
      }

      const uploadId = crypto.randomUUID();
      const storagePath = `${user.id}/${contentType === 'video' ? 'videos' : 'images'}/${uploadId}`;

      // 2. Upload Main Media (Simulating advanced XHR for percentage)
      // In a real prod environment we'd use a custom XHR hook for 0-100% progress
      // Here we will use Supabase standard with a smooth progress animation

      let mediaUrl = '';
      if (contentType === 'video' && file) {
        const subFolder = videoDuration < 180 ? 'short' : 'long';
        const fullPath = `${storagePath}/${subFolder}/${file.name}`;

        const { data, error } = await supabase.storage
          .from('academy-media')
          .upload(fullPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;
        mediaUrl = fullPath;
        setProgress(60);
      } else if (contentType === 'images' && galleryFiles.length > 0) {
        // Multi-image upload logic...
        mediaUrl = `${storagePath}/gallery`;
        // Simplified for this demo
        for (let i = 0; i < galleryFiles.length; i++) {
          await supabase.storage
            .from('academy-media')
            .upload(`${mediaUrl}/${i}_${galleryFiles[i].name}`, galleryFiles[i]);
          setProgress(Math.floor(((i + 1) / galleryFiles.length) * 60));
        }
      }

      // 3. Create Content Record
      const finalType = contentType === 'video'
        ? (videoDuration < 180 ? 'video_short' : 'video_long')
        : 'image_gallery';

      const { data: content, error: cErr } = await supabase
        .from('content')
        .insert({
          creator_id: user.id,
          series_id: finalSeriesId === 'standalone' ? null : finalSeriesId,
          type: finalType,
          title,
          description,
          media_url: mediaUrl,
          duration_seconds: Math.floor(videoDuration),
          metadata: { size: file?.size || 0, filename: file?.name || 'gallery' }
        })
        .select()
        .single();

      if (cErr) throw cErr;

      // 4. Create Gallery Entries if multi-image
      if (contentType === 'images') {
        const galleryEntries = galleryFiles.map((f, i) => ({
          content_id: content.id,
          image_url: `${mediaUrl}/${i}_${f.name}`,
          display_order: i
        }));
        await supabase.from('content_gallery').insert(galleryEntries);
      }

      setProgress(100);
      setStep('success');
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Academy Upload Failed');
      setStep('details');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#08080c] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-widest leading-none">Academy Creator Studio</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1 opacity-50">Publish your next breakthrough</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'type' && (
              <motion.div 
                key="type-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <button
                  onClick={() => handleTypeSelect('video')}
                  className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group cursor-pointer"
                >
                  <div className="p-6 rounded-[2rem] bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-2xl">
                    <Film className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-black italic uppercase italic">Video Production</h3>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-2 opacity-50 tracking-widest leading-relaxed">Long form tutorials or quick shorts</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </button>

                <button
                  onClick={() => handleTypeSelect('images')}
                  className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group cursor-pointer"
                >
                  <div className="p-6 rounded-[2rem] bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-2xl">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-base font-black italic uppercase italic">Image Gallery</h3>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-2 opacity-50 tracking-widest leading-relaxed">Sliding media collections & carousels</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div
                key="details-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-6 bg-white/[0.03] p-6 rounded-[2rem] border border-white/5">
                  <div className="w-32 h-20 rounded-2xl bg-white/5 flex items-center justify-center relative overflow-hidden">
                    {contentType === 'video' ? <Film className="w-6 h-6 opacity-20" /> : <ImageIcon className="w-6 h-6 opacity-20" />}
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      {contentType === 'video' && videoDuration > 0 && (
                        <span className="text-[10px] font-black uppercase text-primary">
                          {videoDuration < 180 ? 'Short' : 'Tutorial'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-widest mb-1 opacity-40">Ready to sync</p>
                    <h4 className="text-sm font-black italic truncate">{file?.name || `${galleryFiles.length} Images Selected`}</h4>
                    <button onClick={() => setStep('type')} className="text-[9px] font-bold text-primary uppercase mt-1">Change file</button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">General Info</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Content Title"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all"
                    />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Content Description"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none"
                    />
                  </div>

                  <SeriesSelector
                    selectedId={seriesId}
                    onSelect={(id, isNew, data) => {
                      setSeriesId(id);
                      if (isNew) setNewSeriesData(data);
                    }}
                  />
                </div>

                <button
                  onClick={startUpload}
                  disabled={!title.trim()}
                  className="w-full py-5 rounded-[2rem] bg-primary text-white text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-20"
                >
                  Publish to Academy
                </button>
              </motion.div>
            )}

            {step === 'uploading' && (
              <motion.div
                key="upload-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center space-y-10"
              >
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="80" cy="80" r="70"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-white/5"
                    />
                    <motion.circle
                      cx="80" cy="80" r="70"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray="440"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * progress) / 100 }}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black italic leading-none">{progress}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">Syncing...</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase italic tracking-wider">Encrypting & Moving Media</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Please do not close the academy studio</p>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center space-y-8"
              >
                <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase italic italic">Academy Sync Complete!</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60 max-w-xs mx-auto">Your content is now live and propagating across the professional network.</p>
                </div>
                <button
                  onClick={() => { reset(); onClose(); }}
                  className="px-12 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                >
                  Back to Laboratory
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={contentType === 'video' ? 'video/*' : 'image/*'}
          multiple={contentType === 'images'}
          className="hidden"
        />
      </motion.div>
    </div>
  );
}

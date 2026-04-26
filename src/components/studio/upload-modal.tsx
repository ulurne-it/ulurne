'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';
import { 
  UploadTypeStep, 
  UploadDetailsStep, 
  UploadProgressStep, 
  UploadSuccessStep 
} from './upload-steps';

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
    setTimeout(() => fileInputRef.current?.click(), 0);
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

      const sanitizeFileName = (name: string) => {
        const parts = name.split('.');
        const extension = parts.pop();
        const baseName = parts.join('.');
        return (baseName.replace(/[^\x00-\x7F]/g, '').replace(/[^\w\s-]/gi, '').trim().replace(/\s+/g, '_').toLowerCase() || 'media') + `.${extension}`;
      };

      const uploadId = crypto.randomUUID();
      const storagePath = `${user.id}/${contentType === 'video' ? 'videos' : 'images'}/${uploadId}`;
      let mediaUrl = '';

      // 2. Upload Main Media
      if (contentType === 'video' && file) {
        const subFolder = videoDuration < 180 ? 'short' : 'long';
        const cleanName = sanitizeFileName(file.name);
        const fullPath = `${storagePath}/${subFolder}/${cleanName}`;
        const { error } = await supabase.storage.from('academy-media').upload(fullPath, file, { cacheControl: '3600' });
        if (error) throw error;
        mediaUrl = fullPath;
        setProgress(60);
      } else if (contentType === 'images' && galleryFiles.length > 0) {
        mediaUrl = `${storagePath}/gallery`;
        for (let i = 0; i < galleryFiles.length; i++) {
          const cleanName = sanitizeFileName(galleryFiles[i].name);
          await supabase.storage.from('academy-media').upload(`${mediaUrl}/${i}_${cleanName}`, galleryFiles[i]);
          setProgress(Math.floor(((i + 1) / galleryFiles.length) * 60));
        }
      }

      // 3. Create Content Record
      const finalType = contentType === 'video' ? (videoDuration < 180 ? 'video_short' : 'video_long') : 'image_gallery';
      const { data: content, error: cErr } = await supabase.from('content').insert({
        creator_id: user.id,
        series_id: finalSeriesId === 'standalone' ? null : finalSeriesId,
        type: finalType,
        title,
        description,
        media_url: mediaUrl,
        duration_seconds: Math.floor(videoDuration),
        metadata: { size: file?.size || 0, filename: file?.name || 'gallery' }
      }).select().single();
      if (cErr) throw cErr;

      // 4. Create Gallery Entries if multi-image
      if (contentType === 'images') {
        const galleryEntries = galleryFiles.map((f, i) => ({
          content_id: content.id,
          image_url: `${mediaUrl}/${i}_${sanitizeFileName(f.name)}`,
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
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary"><Sparkles className="w-5 h-5" /></div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-widest leading-none">Academy Creator Studio</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1 opacity-50">Publish your next breakthrough</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all hover:rotate-90"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'type' && <UploadTypeStep onSelect={handleTypeSelect} />}
            {step === 'details' && (
              <UploadDetailsStep
                contentType={contentType} file={file} galleryFiles={galleryFiles} videoDuration={videoDuration}
                title={title} setTitle={setTitle} description={description} setDescription={setDescription}
                seriesId={seriesId} setSeriesId={setSeriesId} setNewSeriesData={setNewSeriesData}
                onBack={() => setStep('type')} onUpload={startUpload}
              />
            )}
            {step === 'uploading' && <UploadProgressStep progress={progress} />}
            {step === 'success' && <UploadSuccessStep onDone={() => { reset(); onClose(); }} />}
          </AnimatePresence>
        </div>

        <input
          type="file" ref={fileInputRef} onChange={handleFileChange}
          accept={contentType === 'video' ? 'video/*' : 'image/*'}
          multiple={contentType === 'images'} className="hidden"
        />
      </motion.div>
    </div>
  );
}

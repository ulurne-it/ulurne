'use client';

import { motion } from 'framer-motion';
import { Film, Image as ImageIcon, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SeriesSelector } from './series-selector';

/** 1. Type Selection Step **/
export function UploadTypeStep({ onSelect }: { onSelect: (type: 'video' | 'images') => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <TypeButton
        onClick={() => onSelect('video')}
        icon={Film}
        title="Video Production"
        description="Long form tutorials or quick shorts"
      />
      <TypeButton
        onClick={() => onSelect('images')}
        icon={ImageIcon}
        title="Image Gallery"
        description="Sliding media collections & carousels"
      />
    </motion.div>
  );
}

function TypeButton({ onClick, icon: Icon, title, description }: any) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-6 p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group cursor-pointer"
    >
      <div className="p-6 rounded-[2rem] bg-white/5 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all shadow-2xl">
        <Icon className="w-10 h-10" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-black italic uppercase italic">{title}</h3>
        <p className="text-[10px] uppercase font-bold text-muted-foreground mt-2 opacity-50 tracking-widest leading-relaxed">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
    </button>
  );
}

/** 2. Details Step **/
export function UploadDetailsStep({
  contentType,
  file,
  galleryFiles,
  videoDuration,
  title,
  setTitle,
  description,
  setDescription,
  seriesId,
  setSeriesId,
  setNewSeriesData,
  onBack,
  onUpload
}: any) {
  return (
    <motion.div
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
          <button onClick={onBack} className="text-[9px] font-bold text-primary uppercase mt-1">Change file</button>
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

        {/* Streaming Optimization Feature */}
        {contentType === 'video' && (
          <div className="p-5 rounded-[2rem] bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Auto-Optimization Active</span>
              </div>
              <div className="text-[9px] font-bold text-primary/60 uppercase">Streaming Ready</div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
              We'll automatically adjust bitrate and resolution to ensure smooth playback for users with limited bandwidth. 
              {file?.size > 100 * 1024 * 1024 && " Note: This large file may take a moment to optimize."}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onUpload}
        disabled={!title.trim()}
        className="w-full py-5 rounded-[2rem] bg-primary text-white text-xs font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-20"
      >
        Publish to Academy
      </button>
    </motion.div>
  );
}

/** 3. Progress Step **/
export function UploadProgressStep({ progress }: { progress: number }) {
  return (
    <motion.div
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
        <h3 className="text-lg font-black uppercase italic tracking-wider">
          {progress < 30 ? "Optimizing Bitrate & Resolution" : progress < 70 ? "Encrypting & Moving Media" : "Finalizing Academy Sync"}
        </h3>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Please do not close the academy studio</p>
      </div>
    </motion.div>
  );
}

/** 4. Success Step **/
export function UploadSuccessStep({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
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
        onClick={onDone}
        className="px-12 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
      >
        Back to Laboratory
      </button>
    </motion.div>
  );
}

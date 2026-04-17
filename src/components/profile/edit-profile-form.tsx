import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Save, X, Globe, User, Fingerprint, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const profileSchema = z.object({
  username: z.string().min(3, 'Username too short').max(20, 'Username too long').regex(/^[a-z0-9_]+$/, 'Only lowercase, numbers, and underscores'),
  full_name: z.string().min(2, 'Name too short'),
  avatar_url: z.string().optional().or(z.literal('')),
  bio: z.string().max(160, 'Bio too long').optional(),
  occupation: z.string().max(50).optional(),
  location: z.string().max(50).optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  userId: string;
  initialValues: any;
  onClose: () => void;
  onSave: (values: ProfileFormValues) => void;
}

export function EditProfileForm({ userId, initialValues, onClose, onSave }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: initialValues?.username || '',
      full_name: initialValues?.full_name || '',
      avatar_url: initialValues?.avatar_url || '',
      bio: initialValues?.bio || '',
      occupation: initialValues?.occupation || '',
      location: initialValues?.location || '',
      website: initialValues?.website || '',
    },
  });

  const avatarUrl = watch('avatar_url');

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setValue('avatar_url', publicUrl);
      toast.success('Avatar uploaded! Click save to apply changes.');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true);
    await onSave(values);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-widest italic">Edit Academy Profile</h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
             <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
             />
             <div 
              onClick={handleAvatarClick}
              className="relative group cursor-pointer"
             >
                <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-primary to-secondary p-1">
                   <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-8 h-8 text-white/20" />
                      )}
                   </div>
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   {isUploading ? (
                     <Loader2 className="w-6 h-6 text-white animate-spin" />
                   ) : (
                     <Camera className="w-6 h-6 text-white" />
                   )}
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">
               {isUploading ? 'Uploading Image...' : 'Change Training Avatar'}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username / Handle */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                  <Fingerprint className="w-3 h-3" /> Unique Handle
              </label>
              <input
                {...register('username')}
                placeholder="johndoe"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
              />
              {errors.username && <p className="text-[10px] text-red-500 ml-2">{errors.username.message}</p>}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                  <User className="w-3 h-3" /> Full Name
              </label>
              <input
                {...register('full_name')}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
              />
              {errors.full_name && <p className="text-[10px] text-red-500 ml-2">{errors.full_name.message}</p>}
            </div>

            {/* Occupation */}
            <div className="space-y-2">
               <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                   Occupation
               </label>
               <input
                 {...register('occupation')}
                 placeholder="Math Tutor / Web Developer"
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
               />
            </div>

            {/* Location */}
            <div className="space-y-2">
               <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                   Location
               </label>
               <input
                 {...register('location')}
                 placeholder="Lagos, Nigeria"
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
               />
            </div>

            {/* Website */}
            <div className="md:col-span-2 space-y-2">
               <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                   <Globe className="w-3 h-3" /> External Link / Portfolio
               </label>
               <input
                 {...register('website')}
                 placeholder="https://..."
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none"
               />
            </div>

            {/* Bio */}
            <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted ml-2">
                   Mini Biography
               </label>
               <textarea
                 {...register('bio')}
                 rows={3}
                 placeholder="Tell your students something about yourself..."
                 className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-xs font-black focus:border-primary/50 focus:bg-white/10 transition-all outline-none resize-none"
               />
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.02]">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            className="w-full py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Syncing...' : 'Save Profile Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

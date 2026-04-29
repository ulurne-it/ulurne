'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { UserAvatar } from '@/components/ui/user-avatar';
import { toast } from 'sonner';

interface CommentInputProps {
  contentId: string;
  parentId?: string;
  onSubmit: (text: string, parentId?: string) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentInput({ 
  contentId, 
  parentId, 
  onSubmit, 
  placeholder = "Write a comment...",
  autoFocus = false 
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector(state => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(text, parentId);
      setText('');
    } catch (err) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <form 
      onSubmit={handleSubmit}
      className="sticky bottom-0 p-4 bg-[#050505]/80 backdrop-blur-2xl border-t border-white/5 flex items-center gap-4 z-20"
    >
      <div className="hidden md:block">
        <UserAvatar 
          src={user.user_metadata?.avatar_url} 
          name={user.user_metadata?.username || user.email} 
          size="sm" 
        />
      </div>

      <div className="flex-1 relative group">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-5 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300"
        />
        
        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:grayscale disabled:hover:scale-100 transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </form>
  );
}

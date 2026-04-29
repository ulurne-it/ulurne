'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { CommentItem } from './comment-item';
import { CommentInput } from './comment-input';
import { toast } from 'sonner';

interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentCreatorId: string;
}

export function CommentSection({ isOpen, onClose, contentId, contentCreatorId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector(state => state.auth);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, contentId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_comments')
        .select('*, profiles(username, avatar_url, full_name)')
        .eq('content_id', contentId)
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (text: string, parentId?: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_comments')
        .insert({
          content_id: contentId,
          user_id: user.id,
          parent_id: parentId || null,
          text
        })
        .select('*, profiles(username, avatar_url, full_name)')
        .single();

      if (error) throw error;

      if (!parentId && data) {
        setComments(prev => [data, ...prev]);
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error('Failed to post comment');
      throw err;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-black border-l border-white/10 shadow-2xl z-[101] flex flex-col
              max-md:top-auto max-md:bottom-0 max-md:h-[85vh] max-md:rounded-t-[1.5rem] max-md:border-t max-md:border-l-0
            `}
          >
            {/* Flat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-[14px] font-bold text-white uppercase tracking-tight text-center flex-1">Comments</h2>
              <button 
                onClick={onClose}
                className="absolute right-4 p-2 text-white hover:opacity-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-2 space-y-1 hide-scrollbar bg-black"
            >
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-white/20" />
                </div>
              ) : comments.length > 0 ? (
                <div className="pb-24">
                  {comments.map((comment) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      contentCreatorId={contentCreatorId}
                      onPostReply={(text, parentId) => handlePostComment(text, parentId)}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-2 opacity-30">
                  <MessageCircle className="w-8 h-8" />
                  <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
                </div>
              )}
            </div>

            {/* Input Section */}
            <CommentInput 
              contentId={contentId} 
              onSubmit={(text) => handlePostComment(text)}
              placeholder="Add a comment..."
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

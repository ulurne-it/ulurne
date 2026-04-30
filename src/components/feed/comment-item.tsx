'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, Pin, Trash2, Edit2, Check, X as CloseIcon, MoreHorizontal } from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentInput } from './comment-input';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

interface CommentItemProps {
  comment: any;
  contentCreatorId: string;
  onPostReply: (text: string, parentId: string) => Promise<void>;
  depth?: number;
  replyingTo?: string;
}

export function CommentItem({ 
  comment, 
  contentCreatorId, 
  onPostReply, 
  depth = 0,
  replyingTo
}: CommentItemProps) {
  const [localComment, setLocalComment] = useState(comment);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useAppSelector(state => state.auth);

  const isAuthor = user?.id === comment.user_id;
  const isVideoOwner = user?.id === contentCreatorId;
  const canDelete = isAuthor || isVideoOwner;
  const canPin = isVideoOwner && depth === 0;

  useEffect(() => {
    if (user && comment.id) {
      checkIfLiked();
    }
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user, comment.id]);

  const checkIfLiked = async () => {
    const { data } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', comment.id)
      .eq('user_id', user!.id)
      .single();
    if (data) setIsLiked(true);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLocalComment((prev: any) => ({
      ...prev,
      likes_count: prev.likes_count + (wasLiked ? -1 : 1)
    }));
    try {
      if (wasLiked) {
        await supabase.from('comment_likes').delete().match({ comment_id: comment.id, user_id: user.id });
      } else {
        await supabase.from('comment_likes').insert({ comment_id: comment.id, user_id: user.id });
      }
    } catch (err) {
      setIsLiked(wasLiked);
      setLocalComment((prev: any) => ({ ...prev, likes_count: prev.likes_count + (wasLiked ? 1 : -1) }));
    }
  };

  const handlePin = async () => {
    try {
      const newPinnedStatus = !localComment.is_pinned;
      await supabase.from('content_comments').update({ is_pinned: newPinnedStatus }).eq('id', comment.id);
      setLocalComment((prev: any) => ({ ...prev, is_pinned: newPinnedStatus }));
      setShowActions(false);
      toast.success(newPinnedStatus ? 'Comment pinned' : 'Comment unpinned');
    } catch (err: any) {
      toast.error('Failed to pin comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setIsDeleting(true);
    try {
      await supabase.from('content_comments').delete().eq('id', comment.id);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim()) return;
    try {
      await supabase.from('content_comments').update({ text: editText }).eq('id', comment.id);
      setLocalComment((prev: any) => ({ ...prev, text: editText }));
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error('Failed to update comment');
    }
  };

  const fetchReplies = async (force = false) => {
    if (!force && (replies.length > 0 || loadingReplies)) {
      setShowReplies(!showReplies);
      return;
    }
    setLoadingReplies(true);
    setShowReplies(true);
    try {
      const { data } = await supabase
        .from('content_comments')
        .select('*, profiles(username, avatar_url, full_name)')
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });
      if (data) setReplies(data);
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handlePostReply = async (text: string) => {
    await onPostReply(text, comment.id);
    setShowReplyInput(false);
    fetchReplies(true);
  };

  if (isDeleting) return null;

  const timeStr = formatDistanceToNow(new Date(localComment.created_at), { addSuffix: false })
    .replace('about ', '')
    .replace('minutes', 'm').replace('minute', 'm')
    .replace('hours', 'h').replace('hour', 'h')
    .replace('days', 'd').replace('day', 'd');

  const indentClass = depth === 1 ? 'ml-10' : '';

  return (
    <div className={`relative ${depth > 0 ? 'mt-4' : 'mt-6'} ${indentClass}`}>
      {localComment.is_pinned && (
        <div className="flex items-center gap-1 text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5 ml-11">
           <Pin className="w-3 h-3 rotate-45 fill-current" /> Pinned Insight
        </div>
      )}

      <div className="flex gap-3 pr-2 group/item">
        {/* Avatar */}
        <div className="flex-shrink-0 pt-0.5">
          <UserAvatar 
            src={localComment.profiles?.avatar_url} 
            name={localComment.profiles?.username} 
            size={depth > 0 ? 'xs' : 'sm'} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2 pb-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-white/[0.03] border border-blue-500/30 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest">Save</button>
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 rounded-lg bg-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] leading-[1.4] break-words">
                  <span className="font-bold text-white mr-1.5 cursor-pointer hover:text-blue-400 transition-colors">
                    {localComment.profiles?.username || 'anonymous'}
                  </span>
                  <span className="text-white/80">
                    {depth > 0 && replyingTo && (
                      <span className="text-blue-500/80 mr-1">@{replyingTo}</span>
                    )}
                    {localComment.text}
                  </span>
                </p>
              )}

              {/* Meta Line */}
              <div className="flex items-center gap-4 mt-1.5">
                <span className="text-[11px] font-medium text-white/20">{timeStr}</span>
                {localComment.likes_count > 0 && (
                  <span className="text-[11px] font-black text-white/20 tracking-tight">{localComment.likes_count} likes</span>
                )}
                <button 
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  className="text-[11px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-wider"
                >
                  Reply
                </button>

                {/* Modern More Menu Trigger */}
                {(canPin || isAuthor || canDelete) && (
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setShowActions(!showActions)}
                      className="p-1 rounded-full hover:bg-white/5 text-white/10 hover:text-white/40 transition-all opacity-0 group-hover/item:opacity-100"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {showActions && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute top-full left-0 mt-2 w-36 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100] p-1"
                        >
                          {canPin && (
                            <button onClick={handlePin} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                              <Pin className={`w-3.5 h-3.5 ${localComment.is_pinned ? 'fill-current' : ''}`} />
                              {localComment.is_pinned ? 'Unpin' : 'Pin'}
                            </button>
                          )}
                          {isAuthor && (
                            <button onClick={() => { setIsEditing(true); setShowActions(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                              <Edit2 className="w-3.5 h-3.5" />
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={handleDelete} className="w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>

            {/* Heart */}
            <button 
              onClick={handleLike}
              className={`flex-shrink-0 pt-1 transition-all active:scale-150 ${isLiked ? 'text-blue-500' : 'text-white/10 hover:text-white/30'}`}
            >
              <Heart className={`w-[14px] h-[14px] ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showReplyInput && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="mt-3">
                 <CommentInput 
                  contentId={localComment.content_id}
                  parentId={localComment.id}
                  placeholder={`Reply to @${localComment.profiles?.username}...`}
                  autoFocus
                  onSubmit={handlePostReply}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies Container - Aligned perfectly */}
      {localComment.replies_count > 0 && (
        <div className="mt-2.5">
          <button 
            onClick={() => fetchReplies()}
            className="flex items-center gap-3 text-[11px] font-black text-white/20 hover:text-blue-500 transition-all group/replies"
          >
            <div className="w-6 h-[1px] bg-white/10 group-hover/replies:bg-blue-500/30" />
            {showReplies ? 'Hide' : `View ${localComment.replies_count} replies`}
          </button>
          
          <AnimatePresence>
            {showReplies && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                {replies.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    contentCreatorId={contentCreatorId}
                    onPostReply={onPostReply}
                    depth={depth + 1}
                    replyingTo={localComment.profiles?.username}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

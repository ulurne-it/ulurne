'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, NotificationType } from '@/hooks/use-notifications';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  MessageSquare, 
  CheckCheck,
  Loader2,
  Inbox,
  ArrowRight
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const { notifications, loading, markAsRead, unreadCount } = useNotifications();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);

  const recentNotifications = notifications.slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-3 h-3 text-blue-400" />;
      case 'like': return <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />;
      case 'comment': return <MessageCircle className="w-3 h-3 text-emerald-400" />;
      case 'reply': return <MessageSquare className="w-3 h-3 text-amber-400" />;
      default: return <Bell className="w-3 h-3 text-primary" />;
    }
  };

  const getMessage = (n: any) => {
    switch (n.type) {
      case 'follow': return 'started following you';
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      default: return 'sent a notification';
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    onClose();
    if (n.type === 'follow') {
      router.push(`/profile/${n.actor?.username}`);
    } else if (n.content_id) {
      router.push(`/app/${n.content_id}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute top-full right-0 mt-3 w-80 bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[8px] font-black">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead()}
                className="p-1.5 rounded-lg hover:bg-white/5 text-muted hover:text-primary transition-all"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 max-h-[350px] overflow-y-auto hide-scrollbar">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-3 opacity-20">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <p className="text-[8px] font-black uppercase tracking-widest">Syncing...</p>
              </div>
            ) : recentNotifications.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 flex items-start gap-3 cursor-pointer transition-all hover:bg-white/[0.03] relative ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <UserAvatar 
                        src={n.actor?.avatar_url} 
                        name={n.actor?.username} 
                        size="xs" 
                        className="border border-white/10"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-black border border-white/10 scale-75">
                        {getIcon(n.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] leading-snug">
                        <span className="font-bold text-white mr-1 italic">@{n.actor?.username}</span>
                        <span className="text-white/60">{getMessage(n)}</span>
                      </p>
                      <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {!n.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center gap-3 opacity-10">
                <Inbox className="w-8 h-8" />
                <p className="text-[9px] font-black uppercase tracking-widest">Clear inbox</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Link 
            href="/notifications" 
            onClick={onClose}
            className="p-3 border-t border-white/5 bg-white/[0.02] flex items-center justify-center gap-2 group hover:bg-primary/10 transition-all"
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-muted group-hover:text-primary">View all alerts</span>
            <ArrowRight className="w-3 h-3 text-muted group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

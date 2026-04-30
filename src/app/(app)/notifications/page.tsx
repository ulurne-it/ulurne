'use client';

import { useState, useMemo } from 'react';
import { useNotifications, NotificationType } from '@/hooks/use-notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  MessageSquare, 
  CheckCheck,
  Loader2,
  Inbox
} from 'lucide-react';
import { UserAvatar } from '@/components/ui/user-avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const tabs = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'follow', label: 'Follows', icon: UserPlus },
  { id: 'like', label: 'Likes', icon: Heart },
  { id: 'comment', label: 'Comments', icon: MessageCircle },
];

import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { notifications, loading, markAsRead, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'comment') {
      return notifications.filter(n => n.type === 'comment' || n.type === 'reply');
    }
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

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
      case 'like': return `liked your post ${n.content?.title ? `"${n.content.title}"` : ''}`;
      case 'comment': return `commented on your post: "${n.content?.title || ''}"`;
      case 'reply': return 'replied to your comment';
      default: return 'sent you a notification';
    }
  };

  const handleNotificationClick = async (n: any) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    
    if (n.type === 'follow') {
      router.push(`/profile/${n.actor?.username}`);
    } else if (n.content_id) {
      router.push(`/app/${n.content_id}`);
    }
  };

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="px-4 lg:px-6 pt-8 lg:pt-12 pb-4 space-y-5 bg-linear-to-b from-primary/5 to-transparent border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl lg:text-3xl font-black font-heading uppercase italic tracking-tighter text-white">
              Notifications
            </h1>
            <p className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-white/20">
              {unreadCount > 0 ? `${unreadCount} new alerts` : 'No new alerts'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={() => markAsRead()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
              <CheckCheck className="w-3 lg:w-3.5 h-3 lg:h-3.5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-white/60">Mark all</span>
            </button>
          )}
        </div>

        {/* Tabs - Mobile Dropdown / Desktop Flex */}
        <div className="relative">
          {/* Mobile Dropdown Trigger */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = tabs.find(t => t.id === activeTab)?.icon || Bell;
                  return <Icon className="w-3.5 h-3.5 text-primary" />;
                })()}
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isFilterOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Bell className="w-3 h-3 text-white/20" /> {/* Using Bell as a chevron-like indicator or just replace with ChevronDown if preferred */}
              </motion.div>
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 z-50 p-1.5 rounded-2xl bg-black border border-white/10 shadow-2xl backdrop-blur-2xl"
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-white/40 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                        {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Flex Row */}
          <div className="hidden lg:flex items-center gap-1.5 pb-1 hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 border ${
                    isActive 
                      ? 'bg-primary border-primary/50 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
                      : 'bg-white/5 border-white/5 text-white/30 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 opacity-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-[8px] font-black uppercase tracking-[0.4em]">Syncing Feed...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-1.5 py-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: i * 0.03 }}
                  className={`group relative p-3 rounded-2xl transition-all cursor-pointer border ${
                    n.is_read 
                      ? 'bg-white/[0.01] border-white/[0.02] opacity-50 hover:opacity-100 hover:bg-white/[0.03] hover:border-white/5' 
                      : 'bg-white/[0.04] border-white/10 shadow-lg shadow-black/20 hover:border-primary/30'
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-center gap-3">
                    {/* Actor Avatar */}
                    <div className="relative flex-shrink-0">
                      <UserAvatar 
                        src={n.actor?.avatar_url} 
                        name={n.actor?.username} 
                        size="sm"
                        className="border border-white/10 group-hover:border-primary/50 transition-colors"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-black border border-white/10 scale-75">
                        {getIcon(n.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-1 gap-y-0 text-[12px] leading-tight">
                        <span className="font-black text-white italic">
                          @{n.actor?.username}
                        </span>
                        <span className="text-white/60 font-medium">{getMessage(n)}</span>
                      </div>
                      <p className="text-[8px] text-white/20 font-black uppercase tracking-widest mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Content Thumbnail if applicable */}
                    {n.content?.thumbnail_url && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/30 transition-all bg-white/5">
                          <img 
                            src={n.content.thumbnail_url} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt="" 
                          />
                        </div>
                      </div>
                    )}

                    {/* Unread Indicator */}
                    {!n.is_read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-4 opacity-10 py-20">
            <Inbox className="w-10 h-10" />
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nothing to report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

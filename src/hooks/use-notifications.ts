'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';

export type NotificationType = 'follow' | 'like' | 'comment' | 'reply';

export interface Notification {
  id: string;
  receiver_id: string;
  actor_id: string;
  type: NotificationType;
  content_id?: string;
  comment_id?: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    username: string;
    avatar_url: string;
  };
  content?: {
    title: string;
    thumbnail_url: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAppSelector((state) => state.auth);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!actor_id(username, avatar_url),
          content:content(title, thumbnail_url)
        `)
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId?: string) => {
    if (!user) return;

    try {
      if (notificationId) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
        
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // Mark all as read
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);
        
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel(`notifications_realtime_${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch the full notification data including actor profile
          const { data, error } = await supabase
            .from('notifications')
            .select(`
              *,
              actor:profiles!actor_id(username, avatar_url),
              content:content(title, thumbnail_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: fetchNotifications
  };
}

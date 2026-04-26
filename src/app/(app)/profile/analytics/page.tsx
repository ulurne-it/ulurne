'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Eye,
  UserMinus,
  Calendar,
  BarChart2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppSelector } from '@/store/hooks';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';

export default function AnalyticsPage() {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7); // Days
  const [data, setData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalViews: 0,
    totalFollowers: 0,
    totalUnfollowers: 0,
    likesTrend: 0,
    viewsTrend: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = subDays(new Date(), timeRange);
      const startDateISO = startDate.toISOString();

      // 1. Fetch Likes
      const { data: likes } = await supabase
        .from('content_likes')
        .select('created_at, content!inner(creator_id)')
        .eq('content.creator_id', user!.id)
        .gte('created_at', startDateISO);

      // 2. Fetch Views
      const { data: views } = await supabase
        .from('content_views')
        .select('created_at, content!inner(creator_id)')
        .eq('content.creator_id', user!.id)
        .gte('created_at', startDateISO);

      // 3. Fetch Follows/Unfollows from logs
      const { data: followLogs } = await supabase
        .from('follow_logs')
        .select('*')
        .eq('following_id', user!.id)
        .gte('created_at', startDateISO);

      // Process data for charts
      const days = eachDayOfInterval({
        start: startOfDay(startDate),
        end: endOfDay(new Date())
      });

      const chartData = days.map(day => {
        const dateStr = format(day, 'MMM dd');
        const dayLikes = likes?.filter(l => format(new Date(l.created_at), 'MMM dd') === dateStr).length || 0;
        const dayViews = views?.filter(v => format(new Date(v.created_at), 'MMM dd') === dateStr).length || 0;
        const dayFollows = followLogs?.filter(l => l.event_type === 'follow' && format(new Date(l.created_at), 'MMM dd') === dateStr).length || 0;
        const dayUnfollows = followLogs?.filter(l => l.event_type === 'unfollow' && format(new Date(l.created_at), 'MMM dd') === dateStr).length || 0;

        return {
          name: dateStr,
          likes: dayLikes,
          views: dayViews,
          followers: dayFollows,
          unfollowers: dayUnfollows,
          netGrowth: dayFollows - dayUnfollows
        };
      });

      setData(chartData);

      // Calculate totals
      const totalLikes = likes?.length || 0;
      const totalViews = views?.length || 0;
      const totalFollowers = followLogs?.filter(l => l.event_type === 'follow').length || 0;
      const totalUnfollowers = followLogs?.filter(l => l.event_type === 'unfollow').length || 0;

      setStats({
        totalLikes,
        totalViews,
        totalFollowers,
        totalUnfollowers,
        likesTrend: calculateTrend(likes, timeRange),
        viewsTrend: calculateTrend(views, timeRange),
      });

    } catch (err) {
      console.error('Analytics Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (items: any[] | null, days: number) => {
    if (!items || items.length === 0) return 0;
    const midPoint = subDays(new Date(), days / 2);
    const recent = items.filter(i => new Date(i.created_at) > midPoint).length;
    const previous = items.length - recent;
    if (previous === 0) return recent * 100;
    return Math.round(((recent - previous) / previous) * 100);
  };

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Link
              href="/profile"
              className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Profile
            </Link>
            <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter">
              Academy Insights
            </h1>
            <p className="text-muted-foreground text-sm">Deep analysis of your content performance.</p>
          </div>

          {/* Time Selector */}
          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 p-1">
            {[7, 30, 90].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-white'
                  }`}
              >
                {range === 7 ? '1 Week' : range === 30 ? '1 Month' : '3 Months'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Likes"
            value={stats.totalLikes}
            trend={stats.likesTrend}
            icon={Heart}
            color="text-rose-500"
          />
          <StatCard
            title="Video Views"
            value={stats.totalViews}
            trend={stats.viewsTrend}
            icon={Eye}
            color="text-primary"
          />
          <StatCard
            title="New Followers"
            value={stats.totalFollowers}
            icon={Users}
            color="text-secondary"
          />
          <StatCard
            title="Unfollowers"
            value={stats.totalUnfollowers}
            icon={UserMinus}
            color="text-muted-foreground"
          />
        </div>

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ChartSection
            title="Engagement Growth"
            description="Likes and Views over time"
            data={data}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff20"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#12121a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="likes" stroke="#f43f5e" fillOpacity={1} fill="url(#colorLikes)" strokeWidth={3} />
                <Area type="monotone" dataKey="views" stroke="#6366f1" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection
            title="Audience Dynamics"
            description="Follows vs Unfollows"
            data={data}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart2_Placeholder data={data} />
            </ResponsiveContainer>
          </ChartSection>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-black ${trend >= 0 ? 'text-green-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{title}</p>
        <h3 className="text-3xl font-black font-heading italic tracking-tighter mt-1">
          {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
        </h3>
      </div>
    </div>
  );
}

function ChartSection({ title, description, children }: any) {
  return (
    <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] space-y-8 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black font-heading uppercase italic tracking-tighter">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white/5">
          <BarChart2 className="w-5 h-5 text-primary" />
        </div>
      </div>
      {children}
    </div>
  );
}

// Recharts sometimes has issues with SSR, using a safe wrapper or simplified components
function BarChart2_Placeholder({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#ffffff20"
          fontSize={10}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis hide />
        <Tooltip
          contentStyle={{ backgroundColor: '#12121a', border: '1px solid #ffffff10', borderRadius: '12px' }}
          itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
        />
        <Line type="monotone" dataKey="followers" stroke="#a855f7" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="unfollowers" stroke="#52525b" strokeWidth={3} dot={false} strokeDasharray="5 5" />
      </LineChart>
    </ResponsiveContainer>
  );
}

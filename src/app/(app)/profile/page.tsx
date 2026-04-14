'use client';

import { useAppSelector } from '@/store/hooks';

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="p-8 space-y-8 text-center max-w-2xl mx-auto">
      <div className="relative inline-block">
         <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary to-secondary p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-black">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
         </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-widest">
          {user?.user_metadata.full_name || 'Guest User'}
        </h1>
        <p className="text-muted font-medium">{user?.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 h-24">
        {[
          { label: 'Courses', val: '12' },
          { label: 'Followers', val: '840' },
          { label: 'Following', val: '124' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/5">
            <span className="text-xl font-black">{s.val}</span>
            <span className="text-[10px] uppercase font-black tracking-widest text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      <button className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all">
        Edit Profile
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter">Notifications</h1>
        <p className="text-muted font-medium">Stay updated with your learning journey.</p>
      </div>
      
      <div className="space-y-4">
        {[
          { title: "New Course Available", time: "2h ago", desc: "Check out the new 'UI/UX Principles' bite!" },
          { title: "Task Completed", time: "5h ago", desc: "You've successfully finished 'Intro to Calculus'." },
          { title: "Welcome to ULurne", time: "1d ago", desc: "Start your journey by exploring the feed." },
        ].map((n, i) => (
          <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all flex items-start gap-4">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-black uppercase tracking-widest text-sm">{n.title}</h3>
                <span className="text-[10px] text-muted font-black">{n.time}</span>
              </div>
              <p className="text-sm text-muted font-medium">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

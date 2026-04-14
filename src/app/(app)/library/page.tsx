export default function LibraryPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter">My Library</h1>
        <p className="text-muted font-medium">Continue where you left off.</p>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-6 group cursor-pointer hover:bg-white/[0.08] transition-all">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-black text-2xl">{i}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black uppercase tracking-widest">Advanced Mathematics - Module {i}</h3>
              <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className="w-1/3 h-full bg-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

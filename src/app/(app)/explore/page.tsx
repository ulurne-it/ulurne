export default function ExplorePage() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter">Explore</h1>
        <p className="text-muted font-medium">Discover the best educational bites for you.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-video rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center group cursor-pointer hover:border-primary/20 transition-all">
            <span className="text-white/20 font-black group-hover:text-primary/40 transition-colors">Course Placeholder</span>
          </div>
        ))}
      </div>
    </div>
  );
}

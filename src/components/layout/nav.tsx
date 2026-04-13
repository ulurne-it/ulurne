import { GraduationCap } from "lucide-react";

export function Nav() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-heading font-black tracking-tighter uppercase italic">ULurne</span>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          {["Courses", "Tutors", "Features", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:block text-sm font-black uppercase tracking-widest text-muted hover:text-white transition-colors">
            Login
          </button>
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
            Join Now
          </button>
        </div>
      </div>
    </nav>
  );
}

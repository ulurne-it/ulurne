"use client";

import { useState } from "react";
import { GraduationCap, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { LogoutModal } from "@/components/auth/logout-modal";

export function Nav() {
  const { user } = useAppSelector((state) => state.auth);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 glass">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <LogOut className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-heading font-black tracking-tighter uppercase italic">ULurne</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {["Courses", "Tutors", "Features", "Pricing"].map((item) => (
              <a
                key={item}
                href={`/#${item.toLowerCase()}`}
                className="text-sm font-bold text-muted hover:text-primary transition-colors uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold truncate max-w-[100px]">
                    {user.user_metadata.full_name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/10 hover:text-red-500 border border-white/5 transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-black uppercase tracking-widest text-muted hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <LogoutModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} />
    </>
  );
}

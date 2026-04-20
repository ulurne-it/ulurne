import { GraduationCap, Camera, Send, Briefcase } from "lucide-react";
import Image from "next/image";

const SOCIAL_LINKS = [
  { Icon: Camera, label: "Instagram" },
  { Icon: Send, label: "Twitter / X" },
  { Icon: Briefcase, label: "LinkedIn" },
];

const PRODUCT_LINKS = ["Courses", "Vertical Feed", "Tutoring System"];
const COMPANY_LINKS = ["Careers", "About Us", "Press Kit", "Privacy Policy"];

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-white/5 bg-surface/50">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex mb-5 items-center gap-2 group cursor-pointer">
            <div className="relative group-hover:scale-110 transition-transform">
              <Image
                src="/logos/logo.png"
                alt="ULurne Logo"
                width={40}
                height={40}
              />
            </div>
          </div>
          <p className="text-muted text-sm font-medium leading-relaxed max-w-xs mb-8">
            The addictive education ecosystem for the next generation of African students. The ultimate student learning media platform built to make you grow.
          </p>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:text-primary hover:bg-white/10 transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8 italic">Product</h4>
          <ul className="space-y-4 text-sm font-bold text-muted">
            {PRODUCT_LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-primary transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-8 italic">Company</h4>
          <ul className="space-y-4 text-sm font-bold text-muted">
            {COMPANY_LINKS.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-primary transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
        &copy; 2026 ULurne Technologies Inc. All Rights Reserved.
      </div>
    </footer>
  );
}

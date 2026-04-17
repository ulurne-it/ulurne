export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-2xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-black font-heading uppercase italic tracking-tighter">Settings</h1>
        <p className="text-muted font-medium">Manage your account preferences.</p>
      </div>
      
      <div className="space-y-6">
        {[
          "Account Security",
          "Notification Settings",
          "Privacy & Safety",
          "Display Preferences",
          "Language & Region"
        ].map((s) => (
          <div key={s} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group">
            <span className="font-black uppercase tracking-widest text-sm">{s}</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary translation-colors">
              &rarr;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

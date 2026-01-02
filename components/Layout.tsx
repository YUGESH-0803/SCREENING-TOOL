
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = "NeuroScreen" }) => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center p-4 md:p-8">
      <header className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Early Detection Screening</p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <i className="fas fa-shield-halved text-blue-500 mr-2"></i> PRIVATE & SECURE
          </span>
        </div>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-slate-200/40 p-6 md:p-10 border border-slate-50 relative overflow-hidden">
        {children}
      </main>

      <footer className="mt-12 text-slate-400 text-[10px] text-center max-w-lg leading-relaxed uppercase tracking-tighter opacity-70">
        <p>Disclaimer: NeuroScreen is an experimental screening tool. It does not provide medical diagnoses. Always consult with a qualified neurologist for clinical evaluations.</p>
      </footer>
    </div>
  );
};

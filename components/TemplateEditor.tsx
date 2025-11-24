import React from 'react';
import { MessageSquareText, Info } from 'lucide-react';

interface TemplateEditorProps {
  template: string;
  setTemplate: (val: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, setTemplate }) => {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/5 p-6 h-full flex flex-col backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
          <MessageSquareText className="w-5 h-5 text-violet-400" />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">Sua Copy</h2>
      </div>
      
      <div className="flex-1 relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-20 transition duration-500 blur"></div>
        <textarea
          className="relative w-full h-40 md:h-full p-4 text-zinc-300 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none text-sm leading-relaxed outline-none font-mono placeholder:text-zinc-700"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 bg-black/60 px-2 py-1 rounded border border-white/5 pointer-events-none font-mono">
            {template.length} chars
        </div>
      </div>
      
      <div className="mt-5 flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/10">
        <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-200/80 leading-relaxed">
          Use <strong className="text-white bg-white/10 px-1 rounded">{' {nome} '}</strong> para substituição dinâmica.
        </p>
      </div>
    </div>
  );
};
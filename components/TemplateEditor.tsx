import React from 'react';
import { MessageSquareText, Info } from 'lucide-react';

interface TemplateEditorProps {
  template: string;
  setTemplate: (val: string) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, setTemplate }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <MessageSquareText className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">Sua Copy (Mensagem)</h2>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          className="w-full h-40 md:h-full p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-sm leading-relaxed"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Digite sua mensagem aqui..."
        />
        <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none">
            {template.length} caracteres
        </div>
      </div>
      
      <div className="mt-4 flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">
          Use <strong>{'{nome}'}</strong> para substituir automaticamente pelo nome do contato importado da planilha.
        </p>
      </div>
    </div>
  );
};
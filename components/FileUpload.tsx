import React from 'react';
import { Upload, FileSpreadsheet, CheckCircle, ShieldCheck } from 'lucide-react';
import { parseExcelFile } from '../utils/excel';
import { Lead } from '../types';

interface FileUploadProps {
  onDataLoaded: (leads: Lead[], filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const leads = await parseExcelFile(file);
      onDataLoaded(leads, file.name);
    } catch (error) {
      console.error("Erro ao ler arquivo", error);
      alert("Erro ao ler o arquivo Excel. Certifique-se de que é um formato válido.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded-3xl hover:border-violet-500 hover:bg-zinc-800/80 transition-all cursor-pointer group backdrop-blur-sm relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 blur-[50px] rounded-full pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-fuchsia-500/20 blur-[50px] rounded-full pointer-events-none"></div>

      <label className="flex flex-col items-center cursor-pointer w-full h-full relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 rounded-full group-hover:opacity-40 transition-opacity"></div>
          <div className="relative p-5 bg-zinc-800 rounded-2xl group-hover:scale-110 transition-all duration-300 mb-6 border border-white/10 shadow-2xl shadow-black/50">
            <Upload className="w-10 h-10 text-zinc-300 group-hover:text-white" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-white mb-3 tracking-tight font-['Space_Grotesk']">
          Importar Base de Leads
        </h3>
        <p className="text-zinc-400 text-center max-w-md mb-8 leading-relaxed text-sm">
          Arraste sua planilha do Excel ou CSV aqui.<br/>
          O sistema detecta automaticamente Telefones e Usuários.
        </p>
        
        {/* Compatibility Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/20">
              <ShieldCheck className="w-3 h-3" />
              Compatível com Growman
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20">
              <CheckCircle className="w-3 h-3" />
              Formatos Padrão
           </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/40 px-4 py-2 rounded-lg border border-white/5 font-mono">
           <FileSpreadsheet className="w-3 h-3" />
           <span>Suporta .xlsx, .xls, .csv</span>
        </div>

        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          className="hidden" 
          onChange={handleFileChange} 
        />
      </label>
    </div>
  );
};
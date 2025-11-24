import React from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center p-12 bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded-2xl hover:border-violet-500 hover:bg-zinc-800/80 transition-all cursor-pointer group backdrop-blur-sm">
      <label className="flex flex-col items-center cursor-pointer w-full h-full">
        <div className="p-4 bg-zinc-800 rounded-full group-hover:bg-violet-600/20 group-hover:scale-110 transition-all duration-300 mb-6 border border-white/5 group-hover:border-violet-500/50">
          <Upload className="w-8 h-8 text-zinc-400 group-hover:text-violet-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Importar planilha</h3>
        <p className="text-zinc-400 text-center max-w-sm mb-8 leading-relaxed">
          Arraste ou clique para selecionar seu arquivo Excel.
          <br/>
          <span className="text-sm opacity-60">Reconhecemos "Nome", "Usuário" e "Telefone".</span>
        </p>
        
        <div className="flex items-center gap-2 text-xs text-zinc-500 bg-black/20 px-4 py-2 rounded-full border border-white/5">
           <FileSpreadsheet className="w-4 h-4" />
           <span>Suporta .xlsx e .csv</span>
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
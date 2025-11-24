import React, { useCallback } from 'react';
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
    <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer group shadow-sm">
      <label className="flex flex-col items-center cursor-pointer w-full h-full">
        <div className="p-4 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors mb-4">
          <Upload className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Importar planilha</h3>
        <p className="text-slate-500 text-center max-w-sm mb-6">
          Arraste ou clique para selecionar seu arquivo Excel (.xlsx, .csv).
          Certifique-se de ter colunas como "Nome", "Usuário" e "Telefone".
        </p>
        
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded border border-slate-200">
           <FileSpreadsheet className="w-4 h-4" />
           <span>Formatos suportados: .xlsx, .xls, .csv</span>
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
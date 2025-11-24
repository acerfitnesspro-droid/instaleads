import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { LeadTable } from './components/LeadTable';
import { TemplateEditor } from './components/TemplateEditor';
import { Lead } from './types';
import { LayoutDashboard, Users, Smartphone, RefreshCw, X, Star } from 'lucide-react';

// Default template
const DEFAULT_TEMPLATE = "Olá {nome}, tudo bem? Vi seu perfil no Instagram e achei seu trabalho incrível! Gostaria de conversar sobre uma oportunidade.";

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filename, setFilename] = useState<string | null>(null);
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATE);

  const handleDataLoaded = (loadedLeads: Lead[], name: string) => {
    setLeads(loadedLeads);
    setFilename(name);
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja limpar os dados importados?')) {
      setLeads([]);
      setFilename(null);
    }
  };

  const updateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  // Stats
  const stats = {
    total: leads.length,
    validPhones: leads.filter(l => l.phone).length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    prospects: leads.filter(l => l.status === 'prospect').length
  };

  if (leads.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">InstaLead Direct</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A ferramenta mais simples para transformar sua lista de contatos do Excel em leads qualificados. 
            Sem automação complexa, sem IA, apenas você no controle total.
          </p>
        </div>
        
        <div className="w-full max-w-xl">
           <FileUpload onDataLoaded={handleDataLoaded} />
           <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="text-emerald-500 font-bold mb-1">Importação Fácil</div>
                <div className="text-xs text-slate-500">Suporte a .xlsx e .csv</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="text-indigo-500 font-bold mb-1">Link Direto</div>
                <div className="text-xs text-slate-500">Abra WhatsApp e Instagram em 1 clique</div>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-100">
                <div className="text-purple-500 font-bold mb-1">Personalizado</div>
                <div className="text-xs text-slate-500">Mensagens com nome do lead</div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 shrink-0 z-20 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <LayoutDashboard className="w-4 h-4 text-white" />
             </div>
             <div>
                <h1 className="font-bold text-slate-800 text-lg leading-tight">InstaLead Direct</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                   Arquivo: <span className="font-medium text-slate-700">{filename}</span>
                </p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Total</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> {stats.total}
                    </span>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Com WhatsApp</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> {stats.validPhones}
                    </span>
                </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <div className="flex flex-col items-end">
                     <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Prospects</span>
                     <span className="font-bold text-amber-500 flex items-center gap-1">
                         <Star className="w-3 h-3" /> {stats.prospects}
                     </span>
                 </div>
                 <div className="h-8 w-px bg-slate-200"></div>
                 <div className="flex flex-col items-end">
                     <span className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Contactados</span>
                     <span className="font-bold text-indigo-600">
                         {stats.contacted}
                     </span>
                 </div>
             </div>

             <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-colors"
             >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Limpar</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-[1600px] mx-auto w-full p-4 gap-4">
        
        {/* Left Sidebar: Template Editor */}
        <aside className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-4">
            <TemplateEditor template={template} setTemplate={setTemplate} />
            
            {/* Quick Tips Box */}
            <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2">Dica Pro</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
                        Sempre personalize a mensagem antes de clicar em "Enviar". 
                        Isso aumenta drasticamente sua taxa de resposta no WhatsApp.
                    </p>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                <div className="absolute top-10 -left-10 w-20 h-20 bg-white opacity-10 rounded-full"></div>
            </div>
        </aside>

        {/* Center: List */}
        <section className="flex-1 h-full min-w-0">
            <LeadTable leads={leads} messageTemplate={template} onStatusChange={updateLeadStatus} />
        </section>

      </main>
    </div>
  );
}

export default App;
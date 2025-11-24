import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { LeadTable } from './components/LeadTable';
import { TemplateEditor } from './components/TemplateEditor';
import { Lead } from './types';
import { LayoutDashboard, Users, Smartphone, Zap, X, Star, Rocket } from 'lucide-react';

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
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-4xl w-full text-center mb-12 z-10">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-2xl mb-8 backdrop-blur-sm">
            <Rocket className="w-10 h-10 text-violet-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight font-['Space_Grotesk']">
            Acelera <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white">Leads</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A ferramenta definitiva para prospecção manual de alta performance. 
            Transforme planilhas em conexões reais no WhatsApp e Instagram. Sem IA, sem bloqueios.
          </p>
        </div>
        
        <div className="w-full max-w-xl z-10">
           <FileUpload onDataLoaded={handleDataLoaded} />
           
           <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/50 transition-colors">
                <div className="text-violet-400 mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="text-white font-bold mb-1">Importação Flash</div>
                <div className="text-sm text-zinc-500">Excel e CSV processados em milissegundos.</div>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/50 transition-colors">
                 <div className="text-fuchsia-400 mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-white font-bold mb-1">Click-to-Chat</div>
                <div className="text-sm text-zinc-500">Links diretos para WhatsApp e Direct.</div>
              </div>
              <div className="p-6 bg-zinc-900/50 border border-white/5 rounded-2xl backdrop-blur-sm hover:bg-zinc-800/50 transition-colors">
                 <div className="text-emerald-400 mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <div className="text-white font-bold mb-1">Gestão de Prospects</div>
                <div className="text-sm text-zinc-500">Organize seus contatos quentes facilmente.</div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 h-16 shrink-0 z-20">
        <div className="max-w-[1800px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/20">
                <Rocket className="w-5 h-5 text-white" />
             </div>
             <div>
                <h1 className="font-bold text-white text-xl tracking-tight font-['Space_Grotesk']">Acelera Leads</h1>
                {filename && (
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     {filename}
                  </p>
                )}
             </div>
          </div>

          <div className="flex items-center gap-6">
             {/* Stats Bar */}
             <div className="hidden md:flex items-center gap-2 bg-zinc-900/80 p-1.5 rounded-xl border border-white/5">
                <div className="px-4 py-1.5 rounded-lg bg-zinc-800/50 border border-white/5 flex flex-col items-center min-w-[80px]">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total</span>
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-zinc-400" /> {stats.total}
                    </span>
                </div>
                <div className="px-4 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/10 flex flex-col items-center min-w-[100px]">
                    <span className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-wider">Whats</span>
                    <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3" /> {stats.validPhones}
                    </span>
                </div>
                 <div className="px-4 py-1.5 rounded-lg bg-amber-950/20 border border-amber-500/10 flex flex-col items-center min-w-[100px]">
                     <span className="text-[10px] text-amber-500/70 uppercase font-bold tracking-wider">Prospects</span>
                     <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                         <Star className="w-3 h-3" /> {stats.prospects}
                     </span>
                 </div>
                 <div className="px-4 py-1.5 rounded-lg bg-violet-950/20 border border-violet-500/10 flex flex-col items-center min-w-[100px]">
                     <span className="text-[10px] text-violet-500/70 uppercase font-bold tracking-wider">Feito</span>
                     <span className="font-bold text-violet-400 text-sm">
                         {stats.contacted}
                     </span>
                 </div>
             </div>

             <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-all"
             >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Limpar</span>
             </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-[1800px] mx-auto w-full p-4 gap-6">
        
        {/* Left Sidebar: Template Editor */}
        <aside className="w-full md:w-80 lg:w-[400px] shrink-0 flex flex-col gap-6">
            <TemplateEditor template={template} setTemplate={setTemplate} />
            
            {/* Quick Tips Box */}
            <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-noise opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2 text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Dica Pro
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                        Personalize sua mensagem para aumentar a conversão. 
                        Use <code className="bg-white/10 px-1 py-0.5 rounded text-white text-xs">{'{nome}'}</code> para citar o nome do lead.
                    </p>
                </div>
            </div>
        </aside>

        {/* Center: List */}
        <section className="flex-1 h-full min-w-0 bg-zinc-900/50 rounded-2xl border border-white/5 flex flex-col overflow-hidden backdrop-blur-sm shadow-xl">
            <LeadTable leads={leads} messageTemplate={template} onStatusChange={updateLeadStatus} />
        </section>

      </main>
    </div>
  );
}

export default App;
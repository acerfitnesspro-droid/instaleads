import React, { useState, useMemo } from 'react';
import { Lead } from '../types';
import { MessageCircle, Instagram, CheckCircle2, User, Search, Filter, Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatPhoneNumberDisplay, generateInstagramLink, generateWhatsAppLink } from '../utils/formatters';

interface LeadTableProps {
  leads: Lead[];
  messageTemplate: string;
  onStatusChange: (id: string, newStatus: Lead['status']) => void;
}

type SortKey = 'name' | 'phone' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, messageTemplate, onStatusChange }) => {
  const [filter, setFilter] = useState<'all' | 'with_phone' | 'prospects'>('all');
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // 1. Filter
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(search.toLowerCase()) || 
        lead.username.toLowerCase().includes(search.toLowerCase());
      
      if (filter === 'with_phone') {
        return matchesSearch && lead.phone !== null;
      }
      if (filter === 'prospects') {
        return matchesSearch && lead.status === 'prospect';
      }
      return matchesSearch;
    });
  }, [leads, search, filter]);

  // 2. Sort
  const sortedLeads = useMemo(() => {
    if (!sortConfig) return filteredLeads;

    return [...filteredLeads].sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.key) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'phone':
          // Sort by existence of phone number
          const aHasPhone = a.phone ? 1 : 0;
          const bHasPhone = b.phone ? 1 : 0;
          comparison = aHasPhone - bHasPhone;
          break;
        case 'status':
          // Custom weight for status: Prospect > Pending > Contacted > Skipped
          const statusWeight: Record<string, number> = {
            'prospect': 4,
            'pending': 3,
            'contacted': 2,
            'skipped': 1
          };
          comparison = (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
          break;
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredLeads, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' }; // Default to ascending (or logic specific per col)
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null; // Reset if clicked again
    });
  };

  const handleWhatsAppClick = (lead: Lead) => {
    if (!lead.phone) return;
    const link = generateWhatsAppLink(lead.phone, messageTemplate, lead.name);
    window.open(link, '_blank');
    onStatusChange(lead.id, 'contacted');
  };

  const handleInstagramClick = (lead: Lead) => {
    if (!lead.username) return;
    const link = generateInstagramLink(lead.username);
    window.open(link, '_blank');
  };

  const toggleProspect = (lead: Lead) => {
    const newStatus = lead.status === 'prospect' ? 'pending' : 'prospect';
    onStatusChange(lead.id, newStatus);
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-violet-400" />
      : <ArrowDown className="w-3 h-3 text-violet-400" />;
  };

  const HeaderCell = ({ label, column, align = 'left' }: { label: string, column?: SortKey, align?: 'left' | 'right' }) => (
    <th 
      className={`px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider ${align === 'right' ? 'text-right' : 'text-left'} ${column ? 'cursor-pointer select-none hover:text-zinc-300 transition-colors group' : ''}`}
      onClick={() => column && handleSort(column)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {label}
        {column && <SortIcon column={column} />}
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
      {/* Table Header / Toolbar */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-2.5 rounded-xl border border-white/5 flex-1 max-w-md focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
          <Search className="w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou usuário..." 
            className="bg-transparent text-sm outline-none w-full text-zinc-200 placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${filter === 'all' ? 'bg-zinc-800 text-white border-white/10 shadow-lg' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
            >
                Todos
            </button>
            <button 
                onClick={() => setFilter('with_phone')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${filter === 'with_phone' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-900/20' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
            >
                <Filter className="w-3 h-3" />
                Com WhatsApp
            </button>
            <button 
                onClick={() => setFilter('prospects')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap ${filter === 'prospects' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-900/20' : 'text-zinc-500 border-transparent hover:bg-white/5 hover:text-zinc-300'}`}
            >
                <Star className="w-3 h-3" />
                Prospects
            </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-950/50 sticky top-0 z-10 backdrop-blur-md border-b border-white/5 shadow-sm">
            <tr>
              <HeaderCell label="Perfil" column="name" />
              <HeaderCell label="Contato" column="phone" />
              <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ações Rápidas</th>
              <HeaderCell label="Status" column="status" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors group">
                {/* Profile Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all shadow-lg ${lead.status === 'prospect' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/10'}`}>
                      {lead.status === 'prospect' ? <Star className="w-5 h-5 fill-current" /> : (lead.username ? lead.username.charAt(0).toUpperCase() : (lead.name.charAt(0).toUpperCase() || <User className="w-5 h-5"/>))}
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100">{lead.name || 'Sem nome'}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">
                        {lead.username ? `@${lead.username}` : ''}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {lead.phone ? (
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-900/20">
                         <MessageCircle className="w-3 h-3" />
                         {formatPhoneNumberDisplay(lead.phone)}
                       </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-zinc-800 text-zinc-500 border border-white/5">
                            Sem WhatsApp
                        </span>
                    )}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {/* WhatsApp Button */}
                    <button
                      onClick={() => handleWhatsAppClick(lead)}
                      disabled={!lead.phone}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all transform active:scale-95 ${
                        lead.phone 
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/30' 
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                      }`}
                      title={lead.phone ? "Enviar mensagem no WhatsApp" : "Telefone inválido ou ausente"}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>

                    {/* Instagram Button */}
                    <button
                      onClick={() => handleInstagramClick(lead)}
                      disabled={!lead.username}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all active:scale-95 ${
                        lead.username
                        ? 'bg-gradient-to-tr from-orange-600/20 to-pink-600/20 border border-white/10 text-pink-400 hover:text-white hover:border-pink-500/50 hover:from-orange-500 hover:to-pink-600'
                        : 'bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5'
                      }`}
                      title={lead.username ? `Ir para instagram.com/${lead.username}` : "Usuário não identificado"}
                    >
                      <Instagram className="w-4 h-4" />
                    </button>

                    {/* Prospect Button */}
                    <button
                      onClick={() => toggleProspect(lead)}
                      className={`flex items-center justify-center p-2 rounded-lg transition-all active:scale-95 border ${
                        lead.status === 'prospect'
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                      title={lead.status === 'prospect' ? "Remover de Prospects" : "Marcar como Prospect"}
                    >
                      <Star className={`w-4 h-4 ${lead.status === 'prospect' ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </td>
                
                 {/* Status Column */}
                <td className="px-6 py-4 text-right">
                    {lead.status === 'contacted' && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> FEITO
                        </div>
                    )}
                    {lead.status === 'prospect' && (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                            <Star className="w-3 h-3 fill-current" /> PROSPECT
                        </div>
                    )}
                    {(lead.status === 'pending' || lead.status === 'skipped') && (
                        <div className="text-[10px] font-medium text-zinc-600 uppercase tracking-wide">Pendente</div>
                    )}
                </td>
              </tr>
            ))}
            
            {sortedLeads.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <Search className="w-8 h-8 mb-3 opacity-20" />
                          <p>Nenhum contato encontrado.</p>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Lead } from '../types';
import { MessageCircle, Instagram, CheckCircle2, User, Search, Filter, Star } from 'lucide-react';
import { formatPhoneNumberDisplay, generateInstagramLink, generateWhatsAppLink } from '../utils/formatters';

interface LeadTableProps {
  leads: Lead[];
  messageTemplate: string;
  onStatusChange: (id: string, newStatus: Lead['status']) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, messageTemplate, onStatusChange }) => {
  const [filter, setFilter] = useState<'all' | 'with_phone' | 'prospects'>('all');
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter(lead => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Table Header / Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou usuário..." 
            className="bg-transparent text-sm outline-none w-full text-slate-700 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                Todos
            </button>
            <button 
                onClick={() => setFilter('with_phone')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'with_phone' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <Filter className="w-3 h-3" />
                Com WhatsApp
            </button>
            <button 
                onClick={() => setFilter('prospects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${filter === 'prospects' ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
                <Star className="w-3 h-3" />
                Prospects
            </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Perfil</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Contato</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Ações Rápidas</th>
              <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                {/* Profile Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 transition-colors ${lead.status === 'prospect' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {lead.status === 'prospect' ? <Star className="w-5 h-5 fill-current" /> : (lead.username ? lead.username.charAt(0).toUpperCase() : (lead.name.charAt(0).toUpperCase() || <User className="w-5 h-5"/>))}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{lead.name || 'Sem nome'}</div>
                      <div className="text-sm text-slate-500 font-mono">
                        {lead.username ? `@${lead.username}` : ''}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {lead.phone ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                         <MessageCircle className="w-3 h-3" />
                         {formatPhoneNumberDisplay(lead.phone)}
                       </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
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
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-200' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
                        ? 'border border-slate-200 text-slate-600 hover:border-pink-500 hover:text-pink-600 hover:bg-pink-50'
                        : 'border border-slate-100 text-slate-300 cursor-not-allowed'
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
                        ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                        : 'border-slate-200 text-slate-400 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-50'
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
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Contactado
                        </div>
                    )}
                    {lead.status === 'prospect' && (
                        <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <Star className="w-3 h-3 fill-current" /> Prospect
                        </div>
                    )}
                    {(lead.status === 'pending' || lead.status === 'skipped') && (
                        <div className="text-xs text-slate-400">Pendente</div>
                    )}
                </td>
              </tr>
            ))}
            
            {filteredLeads.length === 0 && (
                <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        <p>Nenhum contato encontrado com os filtros atuais.</p>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
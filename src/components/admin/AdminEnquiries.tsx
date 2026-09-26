import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CustomerEnquiry } from '../../types';
import { Inbox, Mail, Phone, Calendar, Trash2, RefreshCw, Tag } from 'lucide-react';

export function AdminEnquiries() {
  const { enquiries, updateEnquiryStatus, deleteEnquiry, loadEnquiries, isLoadingEnquiries } = useCMS();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEnquiries = enquiries.filter((e) => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recent';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Lead Management
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Customer Enquiries & Consultations</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Review and track inbound leads submitted through the website contact forms and showroom consultations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadEnquiries()}
            disabled={isLoadingEnquiries}
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh leads list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEnquiries ? 'animate-spin text-[#b89753]' : ''}`} />
            <span>Refresh</span>
          </button>
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full">
            {['all', 'New', 'Contacted', 'Resolved'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  filterStatus === st
                    ? 'bg-[#1a1a1a] text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                {st === 'all' ? 'All Leads' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredEnquiries.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-400">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <h3 className="font-serif text-lg text-neutral-700">No enquiries found</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {filterStatus === 'all'
                ? 'All new leads submitted by clients through the website will appear here.'
                : `No leads currently marked with status "${filterStatus}".`}
            </p>
          </div>
        ) : (
          filteredEnquiries.map((enq) => {
            const clientName = enq.fullName || enq.name || 'Valued Client';
            return (
              <div
                key={enq.id}
                className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-neutral-300 transition-all"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-serif text-lg text-[#1a1a1a] font-medium">{clientName}</h3>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                        enq.status === 'New'
                          ? 'bg-amber-100 text-amber-800'
                          : enq.status === 'Contacted'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {enq.status}
                    </span>

                    {enq.channel && (
                      <span className="text-[10px] uppercase tracking-wider text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md font-medium">
                        {enq.channel}
                      </span>
                    )}

                    {(enq.categoryInterest || enq.productTitle) && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#b89753] bg-amber-50/80 border border-amber-200/50 px-2.5 py-0.5 rounded-full">
                        <Tag className="w-3 h-3" />
                        <span>{enq.productTitle ? `Product: ${enq.productTitle}` : enq.categoryInterest}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-700 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 leading-relaxed font-light">
                    "{enq.message}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 pt-1">
                    {enq.email && (
                      <a href={`mailto:${enq.email}`} className="flex items-center gap-1.5 hover:text-[#b89753] transition-colors">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{enq.email}</span>
                      </a>
                    )}
                    {enq.phone && (
                      <a href={`tel:${enq.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1.5 hover:text-[#b89753] transition-colors">
                        <Phone className="w-3.5 h-3.5 text-neutral-400" />
                        <span>{enq.phone}</span>
                      </a>
                    )}
                    <div className="flex items-center gap-1.5 text-neutral-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(enq.createdAt || enq.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <select
                    value={enq.status}
                    onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as any)}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] cursor-pointer"
                  >
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Resolved">Status: Resolved</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => deleteEnquiry(enq.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                    title="Delete lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useUserProfile } from '../../lib/useUserProfile';
import { recordActivity } from '../../lib/activityStore';
import {
  Building,
  Key,
  Calendar,
  DollarSign,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  FileText,
  X,
  Phone,
  User,
  Plus,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TenantModalProps {
  onClose: () => void;
}

interface MaintenanceTicket {
  id: string;
  category: string;
  description: string;
  status: 'submitted' | 'scheduled' | 'resolved';
  date: string;
}

export const TenantModal: React.FC<TenantModalProps> = ({ onClose }) => {
  const userProfile = useUserProfile();

  const [activeTab, setActiveTab] = useState<'lease' | 'maintenance' | 'payments'>('lease');
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([
    {
      id: 'ticket-1',
      category: 'Plumbing',
      description: 'Bathroom sink faucet aerator dripping slightly.',
      status: 'scheduled',
      date: 'Yesterday at 2:30 PM',
    },
    {
      id: 'ticket-2',
      category: 'HVAC Filter',
      description: 'Annual AC filter replacement and inspection.',
      status: 'resolved',
      date: 'Last month',
    },
  ]);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Plumbing');
  const [ticketDescription, setTicketDescription] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) return;

    const newTicket: MaintenanceTicket = {
      id: `ticket-${Date.now()}`,
      category: ticketCategory,
      description: ticketDescription.trim(),
      status: 'submitted',
      date: 'Just now',
    };

    setTickets([newTicket, ...tickets]);
    setShowNewTicket(false);
    setTicketDescription('');

    recordActivity({
      type: 'tenant_action',
      title: `Tenant Request: ${ticketCategory}`,
      description: ticketDescription.trim().substring(0, 70),
    });

    setToastMessage('Maintenance request submitted to property management!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div
      id="tenant-portal-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold tracking-tight">Tenant Portal</h2>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-bold border border-emerald-500/40">
                  Verified Lease
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">Unit 4B · Horizon Residence</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-100 bg-neutral-50 px-2 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('lease')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'lease'
                ? 'bg-white text-neutral-900 shadow-2xs border-t border-x border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Lease Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'bg-white text-neutral-900 shadow-2xs border-t border-x border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Maintenance ({tickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-white text-neutral-900 shadow-2xs border-t border-x border-neutral-200'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Rent & Ledger</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {/* Toast message */}
          {toastMessage && (
            <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'lease' && (
            <div className="space-y-3">
              {/* Active Lease Card */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Residential Agreement
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full">
                    Active (12 Months)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-neutral-800">
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 block">Monthly Rent</span>
                    <span className="font-bold text-neutral-900 text-sm">$1,450 / mo</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-400 block">Next Due Date</span>
                    <span className="font-bold text-neutral-900 text-sm">Oct 1, 2026</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-neutral-200/80 space-y-1">
                  <span className="text-[10px] text-neutral-400 block">Property & Unit</span>
                  <p className="font-bold text-neutral-900">Apartment 4B, 742 Evergreen Terrace</p>
                  <p className="text-[11px] text-neutral-500">
                    Tenant: {userProfile?.fullName || 'Registered Tenant'}
                  </p>
                </div>
              </div>

              {/* Landlord Contact */}
              <div className="p-3 bg-white rounded-2xl border border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                    PM
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">Apex Property Management</p>
                    <p className="text-[11px] text-neutral-500">Property Manager: Robert King</p>
                  </div>
                </div>
                <a
                  href="tel:+15550198"
                  className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl cursor-pointer"
                  title="Call Manager"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900">Maintenance Tickets</h3>
                <button
                  type="button"
                  onClick={() => setShowNewTicket(!showNewTicket)}
                  className="px-2.5 py-1 bg-neutral-900 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Request</span>
                </button>
              </div>

              {showNewTicket && (
                <form
                  onSubmit={handleCreateTicket}
                  className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2.5"
                >
                  <h4 className="font-bold text-neutral-900 text-[11px]">Submit Repair Request</h4>
                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">
                      Issue Category
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value="Plumbing">Plumbing / Leaks</option>
                      <option value="Electrical">Electrical / Lighting</option>
                      <option value="HVAC / Heating">HVAC / Heating / AC</option>
                      <option value="Lock / Security">Door Lock / Windows</option>
                      <option value="Appliance">Kitchen Appliance</option>
                      <option value="Other">Other Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 font-semibold mb-0.5">
                      Description of Problem
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      placeholder="Explain what needs fixing and when maintenance can enter..."
                      className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowNewTicket(false)}
                      className="px-2.5 py-1 bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              )}

              {/* Tickets list */}
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">{t.category}</span>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[9px] font-bold capitalize ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'scheduled'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600">{t.description}</p>
                    <span className="text-[10px] text-neutral-400 block pt-0.5">{t.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-neutral-900 text-white rounded-2xl space-y-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                  Current Balance Due
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold">$0.00</span>
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Rent Paid Up
                  </span>
                </div>
                <p className="text-[10px] text-neutral-300">
                  Next automated debit of $1,450 scheduled for Oct 1st.
                </p>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-neutral-200 space-y-2">
                <h4 className="font-bold text-neutral-900 text-xs">Payment Receipts</h4>
                <div className="flex items-center justify-between py-1.5 border-b border-neutral-100">
                  <div>
                    <p className="font-semibold text-neutral-800">September Rent</p>
                    <span className="text-[10px] text-neutral-400">Sep 1, 2026 · Auto-Pay</span>
                  </div>
                  <span className="font-bold text-neutral-900">$1,450.00</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="font-semibold text-neutral-800">August Rent</p>
                    <span className="text-[10px] text-neutral-400">Aug 1, 2026 · Auto-Pay</span>
                  </div>
                  <span className="font-bold text-neutral-900">$1,450.00</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

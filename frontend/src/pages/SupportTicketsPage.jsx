import React, { useState, useEffect } from 'react';
import supportService from '../services/supportService';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  LifeBuoy, 
  PlusCircle, 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Clock 
} from 'lucide-react';

const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected ticket for conversation thread
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportService.getTickets();
      setTickets(data || []);
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch support tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) {
      setCreateError('Please fill in both subject and description.');
      return;
    }

    try {
      setSubmitting(true);
      setCreateError('');
      const created = await supportService.createTicket(newTicket);
      setShowCreateModal(false);
      setNewTicket({ subject: '', category: 'GENERAL', priority: 'MEDIUM', message: '' });
      await loadTickets();
      setSelectedTicket(created);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create support ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const newMsg = await supportService.addMessage(selectedTicket.ticketId, replyText.trim());
      
      // Update selected ticket messages locally
      const updatedMessages = [...(selectedTicket.messages || []), newMsg];
      const updatedTicket = { ...selectedTicket, messages: updatedMessages };
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.ticketId === selectedTicket.ticketId ? updatedTicket : t));
      setReplyText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Support Desk & Inquiries</h1>
          <p className="page-subheading">
            Submit virtual inquiries, transaction investigations, and limit requests to administrators
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <PlusCircle size={16} /> Open New Support Ticket
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <LoadingSkeleton count={3} height="120px" />
      ) : tickets.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '3.5rem 1rem' }}>
            <LifeBuoy size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Support Tickets</h3>
            <p className="text-muted" style={{ maxWidth: '450px', margin: '0 auto 1.5rem' }}>
              Have questions regarding simulated limits or virtual transaction receipts? Open a ticket below.
            </p>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle size={16} /> Create Support Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="ticket-system-grid">
          {/* Left: Ticket List */}
          <div className="card ticket-list-card">
            <div className="card-header">
              <strong>Your Inquiries ({tickets.length})</strong>
            </div>
            <div className="ticket-sidebar-list">
              {tickets.map(t => (
                <div
                  key={t.ticketId}
                  className={`ticket-summary-item ${selectedTicket?.ticketId === t.ticketId ? 'active' : ''}`}
                  onClick={() => setSelectedTicket(t)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span className="ticket-num">#{t.ticketReference || t.ticketId}</span>
                    <Badge status={t.status} />
                  </div>
                  <strong className="ticket-subject-title">{t.subject}</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>{t.category}</span>
                    <span>{formatDateTime(t.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Conversation Thread */}
          {selectedTicket && (
            <div className="card ticket-thread-card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>{selectedTicket.subject}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{selectedTicket.category}</strong> • Priority: <Badge status={selectedTicket.priority} />
                  </div>
                </div>
                <Badge status={selectedTicket.status} />
              </div>

              {/* Message History */}
              <div className="ticket-messages-pane">
                <div className="ticket-bubble original-ticket">
                  <div className="bubble-header">
                    <strong>Original Request by You</strong>
                    <span>{formatDateTime(selectedTicket.createdAt)}</span>
                  </div>
                  <p>{selectedTicket.description}</p>
                </div>

                {(selectedTicket.messages || []).map(msg => (
                  <div 
                    key={msg.messageId} 
                    className={`ticket-bubble ${msg.isStaffReply ? 'staff-reply' : 'user-reply'}`}
                  >
                    <div className="bubble-header">
                      <strong>{msg.isStaffReply ? 'FinCore Support Admin' : 'You'}</strong>
                      <span>{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'CLOSED' ? (
                <div className="ticket-reply-box">
                  <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sendingReply || !replyText.trim()}
                    >
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="ticket-closed-notice">
                  This ticket has been marked as CLOSED. Open a new ticket if further assistance is required.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* New Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Open New Support Ticket"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateTicket}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Support Ticket'}
            </button>
          </div>
        }
      >
        {createError && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {createError}
          </div>
        )}

        <form onSubmit={handleCreateTicket}>
          <div className="form-group">
            <label className="form-label" htmlFor="ticketSubject">Subject *</label>
            <input
              id="ticketSubject"
              type="text"
              className="form-control"
              placeholder="e.g. Query regarding transfer limit expansion"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="ticketCategory">Category</label>
              <select
                id="ticketCategory"
                className="form-control"
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              >
                <option value="GENERAL">General Banking Inquiry</option>
                <option value="TRANSACTION_QUERY">Transaction Verification</option>
                <option value="ACCOUNT_ISSUE">Account Status Support</option>
                <option value="LIMIT_INCREASE">Transfer Limit Increase</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ticketPriority">Priority</label>
              <select
                id="ticketPriority"
                className="form-control"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ticketMessage">Description of Issue *</label>
            <textarea
              id="ticketMessage"
              className="form-control"
              rows={4}
              placeholder="Provide relevant synthetic transaction references or questions..."
              value={newTicket.message}
              onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupportTicketsPage;

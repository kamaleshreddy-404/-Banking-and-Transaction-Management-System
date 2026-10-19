import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import Badge from '../components/common/Badge';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import { formatDateTime } from '../utils/dateFormatter';
import { 
  Headphones, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock 
} from 'lucide-react';

const SupportTicketsAdminPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusSelect, setStatusSelect] = useState('OPEN');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getTickets();
      setTickets(data || []);
      if (data && data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
        setStatusSelect(data[0].status);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch support tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = (t) => {
    setSelectedTicket(t);
    setStatusSelect(t.status);
    setReplyText('');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await adminService.updateTicketStatus(selectedTicket.ticketId, newStatus);
      setSelectedTicket(updated);
      setStatusSelect(updated.status);
      setTickets(prev => prev.map(t => t.ticketId === updated.ticketId ? updated : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setSubmittingReply(true);
      const newMsg = await adminService.addTicketResponse(selectedTicket.ticketId, replyText.trim());
      
      const updatedMessages = [...(selectedTicket.messages || []), newMsg];
      const updatedTicket = { ...selectedTicket, messages: updatedMessages };
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.ticketId === selectedTicket.ticketId ? updatedTicket : t));
      setReplyText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post staff response');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Customer Inquiries & Support Queue</h1>
          <p className="page-subheading">
            Review simulated support inquiries, provide resolution comments, and transition ticket lifecycle
          </p>
        </div>
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
            <Headphones size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
            <h3>No Customer Inquiries</h3>
            <p className="text-muted">The customer support queue is currently clear.</p>
          </div>
        </div>
      ) : (
        <div className="ticket-system-grid">
          {/* Left: Ticket Queue */}
          <div className="card ticket-list-card">
            <div className="card-header">
              <strong>All Inquiries ({tickets.length})</strong>
            </div>
            <div className="ticket-sidebar-list">
              {tickets.map(t => (
                <div
                  key={t.ticketId}
                  className={`ticket-summary-item ${selectedTicket?.ticketId === t.ticketId ? 'active' : ''}`}
                  onClick={() => handleSelectTicket(t)}
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

          {/* Right: Conversation & Admin Actions */}
          {selectedTicket && (
            <div className="card ticket-thread-card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem' }}>{selectedTicket.subject}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Priority: <Badge status={selectedTicket.priority} /> • Category: <strong>{selectedTicket.category}</strong>
                  </div>
                </div>
                
                {/* Status Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Status:</label>
                  <select
                    className="form-control form-control-sm"
                    style={{ width: 'auto' }}
                    value={statusSelect}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>

              {/* Message History */}
              <div className="ticket-messages-pane">
                <div className="ticket-bubble original-ticket">
                  <div className="bubble-header">
                    <strong>Customer Inquiry</strong>
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
                      <strong>{msg.isStaffReply ? 'FinCore Administrator (You)' : 'Customer'}</strong>
                      <span>{formatDateTime(msg.createdAt)}</span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>

              {/* Staff Reply Box */}
              <div className="ticket-reply-box">
                <form onSubmit={handleSendAdminReply} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Provide official resolution comment or update to customer..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingReply || !replyText.trim()}
                  >
                    <Send size={16} /> Post Response
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportTicketsAdminPage;

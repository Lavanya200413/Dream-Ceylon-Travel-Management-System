import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  EyeOff,
  RotateCcw,
  Trash2,
  CheckCircle,
  Flag,
  Filter,
  AlertTriangle,
  Search,
  History,
  ListFilter
} from 'lucide-react';
import api from '../services/api';
import StarRating from './StarRating';

/**
 * Administrator Review Moderation & Report Management Interface
 * Supports:
 * - Flagged / Moderated Queue (/api/reviews/admin/reported)
 * - All Platform Reviews (/api/reviews/admin/all)
 * - Individual Reports Log (/api/reports & PUT /api/reports/:id/status)
 * - Filtering by targetType (destination, guide, hotel), status, and keyword search
 * - Moderation Audit History display
 */
const AdminReportedReviews = () => {
  const [viewMode, setViewMode] = useState('reported'); // 'reported' | 'all' | 'reports'
  const [reviews, setReviews] = useState([]);
  const [reportsLog, setReportsLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [moderationNotes, setModerationNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetchModerationData = useCallback(async () => {
    setLoading(true);
    try {
      if (viewMode === 'reports') {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        const res = await api.get('/reports', { params });
        setReportsLog(res.data?.data || []);
      } else {
        const params = {};
        if (statusFilter !== 'all') params.status = statusFilter;
        if (targetTypeFilter !== 'all') params.targetType = targetTypeFilter;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        const endpoint =
          viewMode === 'all' ? '/reviews/admin/all' : '/reviews/admin/reported';
        const res = await api.get(endpoint, { params });
        setReviews(res.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load moderation data:', err);
    } finally {
      setLoading(false);
    }
  }, [viewMode, statusFilter, targetTypeFilter, searchQuery]);

  useEffect(() => {
    fetchModerationData();
  }, [fetchModerationData]);

  const handleModerate = async (reviewId, action) => {
    setProcessingId(reviewId);
    setFeedback('');
    try {
      const note = moderationNotes[reviewId] || '';
      const res = await api.patch(`/reviews/admin/${reviewId}/moderate`, {
        action,
        note
      });
      setFeedback(res.data?.message || `Action "${action}" completed.`);
      await fetchModerationData();
    } catch (err) {
      alert(err.response?.data?.error || 'Moderation action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    setProcessingId(reportId);
    setFeedback('');
    try {
      const res = await api.put(`/reports/${reportId}/status`, { status });
      setFeedback(res.data?.message || `Report marked as ${status}.`);
      await fetchModerationData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update report status');
    } finally {
      setProcessingId(null);
    }
  };

  const statusBadge = (status) => {
    if (status === 'active' || status === 'published') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      );
    }
    if (status === 'hidden') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
          Hidden
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800">
        Removed
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={22} />
            Review Moderation & Reported Feedback
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Inspect user-reported reviews and hide, approve/restore, dismiss reports, or reject/remove policy-violating content without altering original rating scores.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setViewMode('reported');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'reported'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Flagged / Moderated Queue
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('all');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'all'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Platform Reviews
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('reports');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'reports'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports Log
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
        {viewMode !== 'reports' ? (
          <>
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search review comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <ListFilter size={14} className="text-gray-400" />
                <select
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="all">All Target Types</option>
                  <option value="destination">Destinations</option>
                  <option value="guide">Tour Guides</option>
                  <option value="hotel">Hotels</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="hidden">Hidden</option>
                  <option value="rejected">Rejected</option>
                  <option value="removed">Removed</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-600">Report Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-gray-300 rounded-xl px-3 py-2 bg-white"
            >
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{feedback}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          Loading moderation data...
        </div>
      ) : viewMode === 'reports' ? (
        reportsLog.length === 0 ? (
          <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
            <p className="font-bold text-gray-800 text-sm">No Reports Found</p>
            <p className="text-xs text-gray-500 mt-1">
              No user-submitted review reports match the selected status.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportsLog.map((rep) => (
              <div
                key={rep._id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-red-100 text-red-800">
                      Reason: {rep.reason}
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {rep.targetType}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      Status: <strong className="uppercase">{rep.status}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-gray-800 font-medium">
                    Reported Review: &ldquo;{rep.reviewComment}&rdquo; ({rep.reviewScore}★)
                  </p>
                  {rep.details && (
                    <p className="text-xs text-gray-600">
                      Reporter Details: {rep.details}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    Reported by {rep.reportedBy?.name || 'User'} on{' '}
                    {new Date(rep.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rep.status !== 'resolved' && (
                    <button
                      type="button"
                      disabled={processingId === rep._id}
                      onClick={() => handleUpdateReportStatus(rep._id, 'resolved')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {rep.status !== 'dismissed' && (
                    <button
                      type="button"
                      disabled={processingId === rep._id}
                      onClick={() => handleUpdateReportStatus(rep._id, 'dismissed')}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition disabled:opacity-50"
                    >
                      Dismiss Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : reviews.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <CheckCircle size={32} className="mx-auto text-green-500 mb-2" />
          <p className="font-bold text-gray-800 text-sm">Moderation Queue Clear</p>
          <p className="text-xs text-gray-500 mt-1">
            No reviews match the current filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-4"
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {statusBadge(rev.status)}
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {rev.targetType}: {rev.targetName}
                    </span>
                    {rev.verifiedBooking && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Verified Experience
                      </span>
                    )}
                    {rev.pendingReportsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        <Flag size={11} /> {rev.pendingReportsCount} Pending Report
                        {rev.pendingReportsCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Author: <strong className="text-gray-800">{rev.authorId?.name || 'Unknown'}</strong> ({rev.authorId?.email || 'N/A'}) • Posted{' '}
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <StarRating rating={rev.score} size={16} showValue={true} />
              </div>

              {/* Review Content */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-sm text-gray-800">
                {rev.comment}
              </div>

              {/* Reports list */}
              {rev.reports && rev.reports.length > 0 && (
                <div className="bg-red-50/60 border border-red-100 rounded-xl p-3 space-y-2">
                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    Submitted Reports ({rev.reports.length})
                  </div>
                  <div className="space-y-1.5">
                    {rev.reports.map((rep, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white p-2 rounded-lg border border-red-100 flex flex-wrap justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold uppercase text-red-700 mr-2">
                            [{rep.reason}]
                          </span>
                          <span className="text-gray-700">
                            {rep.details || 'No additional details provided'}
                          </span>
                        </div>
                        <span className="text-gray-400">
                          by {rep.reportedBy?.name || 'User'} • Status: {rep.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderation Audit History */}
              {rev.moderationHistory && rev.moderationHistory.length > 0 && (
                <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <History size={12} /> Moderation Audit Log ({rev.moderationHistory.length})
                  </div>
                  {rev.moderationHistory.map((log, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex flex-wrap justify-between gap-2">
                      <span>
                        Action: <strong className="uppercase">{log.action}</strong>
                        {log.note ? ` — "${log.note}"` : ''}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Moderation Note & Action Buttons */}
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pt-2 border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Optional moderation note (saved in audit history)..."
                  value={moderationNotes[rev._id] || ''}
                  onChange={(e) =>
                    setModerationNotes({
                      ...moderationNotes,
                      [rev._id]: e.target.value
                    })
                  }
                  className="flex-1 text-xs p-2.5 border border-gray-300 rounded-xl bg-white"
                />

                <div className="flex flex-wrap gap-2">
                  {rev.status !== 'hidden' && (
                    <button
                      type="button"
                      disabled={processingId === rev._id}
                      onClick={() => handleModerate(rev._id, 'hide')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition disabled:opacity-50"
                    >
                      <EyeOff size={13} /> Hide Review
                    </button>
                  )}

                  {rev.status !== 'active' && (
                    <button
                      type="button"
                      disabled={processingId === rev._id}
                      onClick={() => handleModerate(rev._id, 'approve')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition disabled:opacity-50"
                    >
                      <RotateCcw size={13} /> Approve / Restore
                    </button>
                  )}

                  {rev.isReported && rev.status === 'active' && (
                    <button
                      type="button"
                      disabled={processingId === rev._id}
                      onClick={() => handleModerate(rev._id, 'dismiss_reports')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
                    >
                      <CheckCircle size={13} /> Dismiss Reports
                    </button>
                  )}

                  {rev.status !== 'removed' && rev.status !== 'rejected' && (
                    <button
                      type="button"
                      disabled={processingId === rev._id}
                      onClick={() => handleModerate(rev._id, 'reject')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                    >
                      <Trash2 size={13} /> Reject / Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportedReviews;

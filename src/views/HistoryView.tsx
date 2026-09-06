import React, { useState } from 'react';
import {
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { Conversation } from '../types';
import * as api from '../services/api';

interface HistoryViewProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRefresh: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  conversations,
  onSelectConversation,
  onNewChat,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const pinnedConvs = filtered.filter((c) => c.pinned);
  const otherConvs = filtered.filter((c) => !c.pinned);

  const handleTogglePin = async (conv: Conversation) => {
    try {
      await api.updateConversation(conv.id, { pinned: !conv.pinned });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRename = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) return;
    try {
      await api.updateConversation(id, { title: editTitle.trim() });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteConversation(deleteTargetId);
      setDeleteTargetId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 text-slate-900">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past explorations..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all shadow-xs"
          />
        </div>

        <button
          onClick={onNewChat}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2"
        >
          <Plus size={15} />
          <span>New Exploration</span>
        </button>
      </div>

      {/* Empty State */}
      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No Explorations Found"
          description="You haven't embarked on any conversations yet. Launch a new dive to start conversing with Buddy."
          actionLabel="Start First Exploration"
          onAction={onNewChat}
        />
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-500">
          <p className="text-sm">No conversations match "{searchQuery}".</p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {/* Pinned Section */}
          {pinnedConvs.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 uppercase tracking-wider px-1">
                <Pin size={13} className="text-slate-700" />
                <span>Pinned Explorations ({pinnedConvs.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pinnedConvs.map((conv) => (
                  <ConversationCard
                    key={conv.id}
                    conv={conv}
                    editingId={editingId}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    onSaveRename={handleSaveRename}
                    onCancelRename={() => setEditingId(null)}
                    onStartRename={handleStartRename}
                    onTogglePin={handleTogglePin}
                    onDelete={(id) => setDeleteTargetId(id)}
                    onSelect={onSelectConversation}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All / Other Conversations */}
          <div className="space-y-3">
            {pinnedConvs.length > 0 && (
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                All Explorations ({otherConvs.length})
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {otherConvs.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conv={conv}
                  editingId={editingId}
                  editTitle={editTitle}
                  setEditTitle={setEditTitle}
                  onSaveRename={handleSaveRename}
                  onCancelRename={() => setEditingId(null)}
                  onStartRename={handleStartRename}
                  onTogglePin={handleTogglePin}
                  onDelete={(id) => setDeleteTargetId(id)}
                  onSelect={onSelectConversation}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Delete Exploration"
        message="Are you sure you want to delete this conversation? All associated messages will be permanently removed."
        confirmLabel="Delete Permanently"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

interface ConversationCardProps {
  conv: Conversation;
  editingId: string | null;
  editTitle: string;
  setEditTitle: (val: string) => void;
  onSaveRename: (id: string) => void;
  onCancelRename: () => void;
  onStartRename: (conv: Conversation) => void;
  onTogglePin: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conv,
  editingId,
  editTitle,
  setEditTitle,
  onSaveRename,
  onCancelRename,
  onStartRename,
  onTogglePin,
  onDelete,
  onSelect
}) => {
  const isEditing = editingId === conv.id;

  return (
    <GlassCard
      interactive={!isEditing}
      onClick={() => !isEditing && onSelect(conv.id)}
      className="p-4 flex flex-col justify-between hover:border-slate-300 group relative shadow-xs"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-white border border-slate-400 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none"
              />
              <button
                onClick={() => onSaveRename(conv.id)}
                className="px-2.5 py-1 rounded bg-slate-900 text-white font-medium text-xs"
              >
                Save
              </button>
              <button
                onClick={onCancelRename}
                className="px-2 py-1 rounded text-slate-500 text-xs hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 flex-1">
              {conv.title}
            </h4>
          )}

          {/* Action buttons */}
          <div
            className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onTogglePin(conv)}
              title={conv.pinned ? 'Unpin' : 'Pin to top'}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                conv.pinned
                  ? 'text-slate-900 bg-slate-100'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Pin size={13} />
            </button>
            <button
              onClick={() => onStartRename(conv)}
              title="Rename"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition-colors"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => onDelete(conv.id)}
              title="Delete"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {conv.lastMessagePreview || 'Conversation saved.'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {new Date(conv.updatedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
        <span className="text-slate-600 font-medium">
          {conv.messageCount || 0} messages
        </span>
      </div>
    </GlassCard>
  );
};


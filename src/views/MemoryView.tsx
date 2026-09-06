import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Edit2,
  Check,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { SavedMemory } from '../types';
import * as api from '../services/api';

interface MemoryViewProps {
  memories: SavedMemory[];
  memoriesEnabled: boolean;
  onToggleGlobalMemory: (enabled: boolean) => void;
  onRefresh: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  memoriesEnabled,
  onToggleGlobalMemory,
  onRefresh
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SavedMemory['category']>('preference');
  const [editingMemory, setEditingMemory] = useState<SavedMemory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: { id: SavedMemory['category']; label: string; color: string }[] = [
    { id: 'preference', label: 'Response Style', color: 'text-slate-800 bg-slate-100 border-slate-200' },
    { id: 'interest', label: 'Domain & Interest', color: 'text-slate-800 bg-slate-100 border-slate-200' },
    { id: 'project', label: 'Active Projects', color: 'text-slate-800 bg-slate-100 border-slate-200' },
    { id: 'personal', label: 'Personal Context', color: 'text-slate-800 bg-slate-100 border-slate-200' },
    { id: 'custom', label: 'Custom Note', color: 'text-slate-800 bg-slate-100 border-slate-200' }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      await api.createMemory({
        content: newContent.trim(),
        category: newCategory
      });
      setNewContent('');
      setIsAdding(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory || !editingMemory.content.trim()) return;
    setIsSubmitting(true);
    try {
      await api.updateMemory(editingMemory.id, {
        content: editingMemory.content.trim(),
        category: editingMemory.category,
        enabled: editingMemory.enabled
      });
      setEditingMemory(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSingle = async (memory: SavedMemory) => {
    try {
      await api.updateMemory(memory.id, { enabled: !memory.enabled });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteMemory(deleteId);
      setDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 text-slate-900">
      {/* Header & Global Control Banner */}
      <GlassCard className="p-8 border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-2">
              <Shield size={14} className="text-slate-600" />
              <span>Personalization Vault</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Memory Vault
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Buddy only remembers what you explicitly save here. No shadow telemetry or secret profiling.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Global Memory Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-medium text-slate-700">
                Personalization
              </span>
              <button
                type="button"
                onClick={() => onToggleGlobalMemory(!memoriesEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                  memoriesEnabled ? 'bg-slate-900 justify-end' : 'bg-slate-300 justify-start'
                }`}
                title={memoriesEnabled ? 'Memory enabled' : 'Memory paused'}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Add Memory</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Add Memory Modal */}
      {isAdding && (
        <GlassCard className="p-6 border-slate-300 shadow-sm animate-fade-in">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-slate-700" />
            <span>Store New Explicit Memory</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNewCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      newCategory === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Memory Statement (Max 300 chars)
              </label>
              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                maxLength={300}
                placeholder="e.g. I prefer code snippets in TypeScript with strict typing..."
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !newContent.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs disabled:opacity-40"
              >
                Save Memory
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Edit Memory Modal */}
      {editingMemory && (
        <GlassCard className="p-6 border-slate-300 shadow-sm animate-fade-in">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Edit2 size={16} className="text-slate-700" />
            <span>Edit Stored Memory</span>
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setEditingMemory({ ...editingMemory, category: cat.id })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      editingMemory.category === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'text-slate-600 bg-white border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Memory Statement
              </label>
              <textarea
                rows={3}
                value={editingMemory.content}
                onChange={(e) => setEditingMemory({ ...editingMemory, content: e.target.value })}
                maxLength={300}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:outline-none focus:border-slate-400 shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingMemory(null)}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !editingMemory.content.trim()}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all shadow-xs disabled:opacity-40"
              >
                Update Memory
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Memories List */}
      {memories.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Memory Vault is Empty"
          description="You have not saved any personalization items yet. Click 'Add Memory' to specify facts, preferences, or project contexts Buddy should remember."
          actionLabel="Add First Memory"
          onAction={() => setIsAdding(true)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{memories.length} saved memories ({memories.filter((m) => m.enabled).length} active)</span>
            {!memoriesEnabled && (
              <span className="text-amber-700 font-medium">
                Personalization is currently paused globally
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((mem) => {
              const catObj = categories.find((c) => c.id === mem.category) || categories[0];
              return (
                <GlassCard
                  key={mem.id}
                  className={`p-5 flex flex-col justify-between transition-all duration-200 shadow-xs ${
                    mem.enabled && memoriesEnabled
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'opacity-50 border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-md border ${catObj.color}`}>
                        {catObj.label}
                      </span>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSingle(mem)}
                          title={mem.enabled ? 'Disable memory' : 'Enable memory'}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            mem.enabled
                              ? 'text-slate-900 bg-slate-100'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {mem.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => setEditingMemory(mem)}
                          title="Edit memory"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(mem.id)}
                          title="Delete memory"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed">
                      "{mem.content}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                    <span>
                      {mem.enabled ? 'Included in context' : 'Excluded from context'}
                    </span>
                    <span>
                      {new Date(mem.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Saved Memory"
        message="Are you sure you want to delete this memory? Buddy will no longer recall this preference."
        confirmLabel="Delete Memory"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};


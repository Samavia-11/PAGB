'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, Settings, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext';
import { showNotification } from '@/utils/notifications';

interface User {
  id: number;
  username: string;
  role: 'author' | 'reviewer' | 'editor' | 'administrator';
  full_name?: string;
}

type EditorialBoardSection =
  | 'executive_leadership'
  | 'editorial_team_editor'
  | 'editorial_team_sub_editor'
  | 'advisory_board'
  | 'peer_review_committee';

interface EditorialBoardItem {
  id: number;
  section: EditorialBoardSection;
  title: string | null;
  name: string;
  affiliation: string | null;
  sort_order: number;
}

type ModalMode = 'add' | 'edit';

interface ModalState {
  open: boolean;
  mode: ModalMode;
  section: EditorialBoardSection;
  item?: EditorialBoardItem;
}

const JournalSettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [executiveLeadership, setExecutiveLeadership] = useState<EditorialBoardItem[]>([]);
  const [editors, setEditors] = useState<EditorialBoardItem[]>([]);
  const [subEditors, setSubEditors] = useState<EditorialBoardItem[]>([]);
  const [advisoryBoard, setAdvisoryBoard] = useState<EditorialBoardItem[]>([]);
  const [peerReviewCommittee, setPeerReviewCommittee] = useState<EditorialBoardItem[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false, mode: 'add', section: 'executive_leadership' });
  const [form, setForm] = useState({ title: '', name: '', affiliation: '' });
  const [submitting, setSubmitting] = useState(false);
  
  const router = useRouter();
  const confirm = useConfirmDialog();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && user?.role === 'administrator') {
      loadEditorialBoard();
    }
  }, [loading, user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'administrator') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadEditorialBoard = async () => {
    setBoardLoading(true);
    setBoardError(null);
    try {
      const response = await fetch('/api/editorial-board');
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to load Editorial Board');
      }

      const data = await response.json();
      const items = (data?.items || []) as EditorialBoardItem[];

      setExecutiveLeadership(items.filter((i) => i.section === 'executive_leadership'));
      setEditors(items.filter((i) => i.section === 'editorial_team_editor'));
      setSubEditors(items.filter((i) => i.section === 'editorial_team_sub_editor'));
      setAdvisoryBoard(items.filter((i) => i.section === 'advisory_board'));
      setPeerReviewCommittee(items.filter((i) => i.section === 'peer_review_committee'));
    } catch (error: any) {
      console.error('Failed to load editorial board:', error);
      setBoardError(error?.message || 'Failed to load Editorial Board');
    } finally {
      setBoardLoading(false);
    }
  };

  const openAddModal = (section: EditorialBoardSection) => {
    setModal({ open: true, mode: 'add', section });
    setForm({ title: '', name: '', affiliation: '' });
  };

  const openEditModal = (item: EditorialBoardItem) => {
    setModal({ open: true, mode: 'edit', section: item.section, item });
    setForm({
      title: item.title || '',
      name: item.name || '',
      affiliation: item.affiliation || '',
    });
  };

  const closeModal = () => {
    if (submitting) return;
    setModal({ open: false, mode: 'add', section: 'executive_leadership' });
    setForm({ title: '', name: '', affiliation: '' });
  };

  const submitModal = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const section = modal.section;
      const payload: any = { section };

      if (section === 'executive_leadership') {
        if (!form.title.trim() || !form.name.trim()) {
          showNotification.warning('Please fill all required fields.');
          return;
        }
        payload.title = form.title.trim();
        payload.name = form.name.trim();
        payload.affiliation = form.affiliation.trim() || null;
      } else if (section === 'editorial_team_editor') {
        if (!form.title.trim() || !form.name.trim()) {
          showNotification.warning('Please fill all required fields.');
          return;
        }
        payload.title = form.title.trim();
        payload.name = form.name.trim();
      } else if (section === 'editorial_team_sub_editor') {
        if (!form.name.trim()) {
          showNotification.warning('Please fill all required fields.');
          return;
        }
        payload.name = form.name.trim();
        payload.title = null;
      } else {
        if (!form.name.trim()) {
          showNotification.warning('Please fill all required fields.');
          return;
        }
        payload.name = form.name.trim();
        payload.title = form.title.trim() || null;
      }

      if (modal.mode === 'add') {
        const res = await fetch('/api/editorial-board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to create entry');
        }
      } else {
        const res = await fetch(`/api/editorial-board/${modal.item?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to update entry');
        }
      }

      closeModal();
      await loadEditorialBoard();
    } catch (error: any) {
      console.error('Failed to submit editorial board item:', error);
      showNotification.error(error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteItem = async (id: number) => {
    const ok = await confirm({
      title: 'Delete this entry?'
      ,
      message: 'Delete this entry?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`/api/editorial-board/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to delete entry');
      }
      await loadEditorialBoard();
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      showNotification.error(error?.message || 'Delete failed');
    }
  };

  const renderList = (items: EditorialBoardItem[], showAffiliation: boolean) => {
    if (items.length === 0) {
      return <p className="text-sm text-academic-600">No entries yet.</p>;
    }

    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 bg-academic-50 rounded-lg border border-academic-200 p-4">
            <div>
              {item.title ? <div className="text-sm font-semibold text-academic-800">{item.title}</div> : null}
              <div className="text-base font-semibold text-academic-900">{item.name}</div>
              {showAffiliation && item.affiliation ? (
                <div className="text-sm text-academic-600">{item.affiliation}</div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal(item)} className="btn-secondary px-3 py-2" type="button">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteItem(item.id)} className="btn-secondary px-3 py-2" type="button">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-academic-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-academic-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-academic-900 font-serif">Journal Settings</h1>
              <p className="text-academic-600 mt-1">Configure journal information and policies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-academic-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-academic-900 mb-2">Editorial Board</h2>
              <p className="text-sm text-academic-600">Manage the Editorial Board sections shown on the public website.</p>
            </div>
            <button onClick={loadEditorialBoard} className="btn-secondary" type="button" disabled={boardLoading}>
              Refresh
            </button>
          </div>

          {boardError ? <div className="mt-4 text-sm text-red-600">{boardError}</div> : null}
          {boardLoading ? <div className="mt-4 text-sm text-academic-600">Loading Editorial Board...</div> : null}

          <div className="mt-6 space-y-10">
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-academic-900">Executive Leadership</h3>
                <button onClick={() => openAddModal('executive_leadership')} className="btn-primary flex items-center" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>
              {renderList(executiveLeadership, true)}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-academic-900">Editorial Team</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => openAddModal('editorial_team_editor')} className="btn-primary flex items-center" type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Editor
                  </button>
                  <button onClick={() => openAddModal('editorial_team_sub_editor')} className="btn-secondary flex items-center" type="button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Sub Editor
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-academic-50 rounded-lg border border-academic-200 p-4">
                  <h4 className="font-semibold text-academic-900 mb-3">Editors</h4>
                  {renderList(editors, false)}
                </div>
                <div className="bg-academic-50 rounded-lg border border-academic-200 p-4">
                  <h4 className="font-semibold text-academic-900 mb-3">Sub Editors</h4>
                  {renderList(subEditors, false)}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-academic-900">Advisory Board</h3>
                <button onClick={() => openAddModal('advisory_board')} className="btn-primary flex items-center" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>
              {renderList(advisoryBoard, false)}
            </div>

            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-academic-900">Peer Review Committee</h3>
                <button onClick={() => openAddModal('peer_review_committee')} className="btn-primary flex items-center" type="button">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </button>
              </div>
              {renderList(peerReviewCommittee, false)}
            </div>
          </div>
        </div>
      </div>

      {modal.open ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg border border-academic-200 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-academic-200">
              <div>
                <h3 className="text-lg font-semibold text-academic-900">{modal.mode === 'add' ? 'Add Entry' : 'Edit Entry'}</h3>
              </div>
              <button onClick={closeModal} className="btn-secondary px-3 py-2" type="button" disabled={submitting}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {modal.section === 'executive_leadership' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Designation / Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="form-input"
                      placeholder="Patron-in-Chief"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="form-input"
                      placeholder="Field Marshal Syed Asim Munir, NI(M), SJ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Affiliation / Organization</label>
                    <input
                      type="text"
                      value={form.affiliation}
                      onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
                      className="form-input"
                      placeholder="IGT&E"
                    />
                  </div>
                </>
              ) : null}

              {modal.section === 'editorial_team_editor' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Role / Designation</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="form-input"
                      placeholder="Editor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="form-input"
                      placeholder="Name"
                    />
                  </div>
                </>
              ) : null}

              {modal.section === 'editorial_team_sub_editor' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="form-input"
                      placeholder="Name"
                    />
                  </div>
                </>
              ) : null}

              {modal.section === 'advisory_board' || modal.section === 'peer_review_committee' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="form-input"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academic-700 mb-2">Designation / Professional Title</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="form-input"
                      placeholder="Dean, Faculty of Contemporary Studies (FCS), NDU"
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-academic-200 flex items-center justify-end gap-2">
              <button onClick={closeModal} className="btn-secondary" type="button" disabled={submitting}>
                Cancel
              </button>
              <button onClick={submitModal} className="btn-primary" type="button" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};

export default JournalSettingsPage;

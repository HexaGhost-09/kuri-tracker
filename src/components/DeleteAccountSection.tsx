import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

export const DeleteAccountSection: React.FC<{ userId: number }> = ({ userId }) => {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Account deleted');
        // Refresh page or redirect to landing
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete account');
      }
    } catch (e) {
      console.error(e);
      alert('Unexpected error');
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
        title="Delete your account"
        disabled={deleting}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <DeleteConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
        resourceName="account"
      />
    </>
  );
};

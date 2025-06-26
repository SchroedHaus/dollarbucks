import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const EditTransactionModal = ({
  isOpen,
  onClose,
  transaction,
  onUpdated,
  selectedProfile,
  setProfiles,
  onDelete,
}) => {
  const [form, setForm] = useState({ note: "", adjustment: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transaction) {
      setForm({
        note: transaction.note || "",
        adjustment: transaction.adjustment || 0,
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const oldAdjustment = parseFloat(transaction.adjustment);
    const newAdjustment = parseFloat(form.adjustment);
    const adjustmentDiff = newAdjustment - oldAdjustment;

    const { error } = await supabase
      .from("transactions")
      .update({
        note: form.note,
        adjustment: newAdjustment,
      })
      .eq("id", transaction.id);

    if (!error && selectedProfile) {
      // Update profile balance in database
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedProfile.id)
        .single();
      if (!profileError && profile) {
        const newBalance = parseFloat(profile.balance) + adjustmentDiff;
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", selectedProfile.id);
        // Also update in UI
        setProfiles &&
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === selectedProfile.id ? { ...p, balance: newBalance } : p
            )
          );
      }
    }
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onUpdated && onUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    setLoading(true);
    // Delete from transaction_join first
    await supabase
      .from("transaction_join")
      .delete()
      .eq("transaction_id", transaction.id);
    // Then delete from transactions
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transaction.id);
    // Update profile balance in database
    if (selectedProfile) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", selectedProfile.id)
        .single();
      if (!profileError && profile) {
        const newBalance =
          parseFloat(profile.balance) - parseFloat(transaction.adjustment);
        await supabase
          .from("profiles")
          .update({ balance: newBalance })
          .eq("id", selectedProfile.id);
        // Also update in UI
        setProfiles &&
          setProfiles((prev) =>
            prev.map((p) =>
              p.id === selectedProfile.id ? { ...p, balance: newBalance } : p
            )
          );
      }
    }
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
    onDelete();
  };

  if (!isOpen || !transaction) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Edit Transaction
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Note"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="number"
            name="adjustment"
            value={form.adjustment}
            onChange={handleChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border rounded-xl"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
              disabled={loading}
            >
              Save
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
              disabled={loading}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTransactionModal;

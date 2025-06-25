import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const EditScheduleModal = ({ isOpen, onClose, transaction, onUpdated, onDeleted }) => {
  const [form, setForm] = useState({
    note: transaction?.note || "",
    start_date: transaction?.start_date || "",
    adjustment: transaction?.adjustment || 0,
    frequency: transaction?.frequency || "once",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (transaction) {
      setForm({
        note: transaction.note || "",
        start_date: transaction.start_date || "",
        adjustment: transaction.adjustment || 0,
        frequency: transaction.frequency || "once",
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
    const { error } = await supabase
      .from("scheduled_transactions")
      .update({
        note: form.note,
        start_date: form.start_date,
        adjustment: parseFloat(form.adjustment),
        frequency: form.frequency,
      })
      .eq("id", transaction.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onUpdated && onUpdated();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this scheduled transaction?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("scheduled_transactions")
      .delete()
      .eq("id", transaction.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      onDeleted && onDeleted();
      onClose();
    }
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
        <h2 className="text-xl font-semibold mb-4 text-center">Edit Scheduled Transaction</h2>
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
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
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
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
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

export default EditScheduleModal;

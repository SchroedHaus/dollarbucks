import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import EditScheduleModal from "./EditScheduleModal";

const ScheduledTransactionsModal = ({ isOpen, onClose, profileId }) => {
  const [scheduledTransactions, setScheduledTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const fetchScheduled = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scheduled_transactions")
      .select("id, adjustment, note, start_date, frequency")
      .eq("profile_id", profileId);
    if (!error) setScheduledTransactions(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen || !profileId) return;
    fetchScheduled();
    // eslint-disable-next-line
  }, [isOpen, profileId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">
          Scheduled Transactions
        </h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : scheduledTransactions.length === 0 ? (
          <p className="text-center text-gray-500">
            No scheduled transactions found.
          </p>
        ) : (
          <ul className="space-y-4">
            {scheduledTransactions.map((tx) => (
              <li
                key={tx.id}
                className="border p-4 rounded-xl flex flex-col gap-1 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setEditTx(tx)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {tx.note || "(No note)"}
                  </span>
                  <span className="text-sm text-gray-500">{tx.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={
                      tx.adjustment > 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {tx.adjustment > 0 ? "+" : ""}
                    {tx.adjustment.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {tx.start_date
                      ? new Date(tx.start_date).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <EditScheduleModal
          isOpen={!!editTx}
          onClose={() => setEditTx(null)}
          transaction={editTx}
          onUpdated={fetchScheduled}
          onDeleted={fetchScheduled}
        />
      </div>
    </div>
  );
};

export default ScheduledTransactionsModal;

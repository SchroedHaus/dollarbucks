import React, { useState } from "react";
import EditTransactionModal from "./EditTransactionModal";

const HistoryModal = ({
  isOpen,
  onClose,
  selectedProfile,
  transactions,
  onTransactionUpdated,
}) => {
  const [editTx, setEditTx] = useState(null);
  const [search, setSearch] = useState("");

  // Filter transactions by note or adjustment
  const filteredTransactions = transactions.filter((t) => {
    const noteMatch = t.note?.toLowerCase().includes(search.toLowerCase());
    const adjustmentMatch =
      search !== "" && !isNaN(Number(search))
        ? Number(t.adjustment).toFixed(2).includes(Number(search).toFixed(2))
        : false;
    return noteMatch || adjustmentMatch;
  });

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
        <h2 className="text-xl font-semibold mb-4">
          {selectedProfile?.name || "Profile"} - Transaction History
        </h2>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by note or amount..."
          className="w-full mb-4 px-4 py-2 border rounded-xl"
        />
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTransactions.map((t) => (
              <li
                key={t.id}
                className="border p-3 rounded-xl flex justify-between items-start cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setEditTx(t)}
              >
                <div>
                  <p
                    className={`font-semibold ${
                      t.adjustment > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.adjustment > 0 ? "+" : ""}
                    {t.adjustment.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">{t.note}</p>
                </div>
                <p className="text-sm text-gray-400">
                  {new Date(t.created_at).toLocaleString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
        <EditTransactionModal
          isOpen={!!editTx}
          onClose={() => setEditTx(null)}
          transaction={editTx}
          onUpdated={onTransactionUpdated}
          onDeleted={onTransactionUpdated}
        />
      </div>
    </div>
  );
};

export default HistoryModal;

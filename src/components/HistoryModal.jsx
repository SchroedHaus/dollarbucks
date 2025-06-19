import React, { useState } from "react";

const HistoryModal = ({ isOpen, onClose, selectedProfile, transactions, onDeleteTransaction }) => {

  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((t) => {
    const note = t.note?.toLowerCase() || "";
    const amount = t.adjustment.toFixed(2);
    const query = searchQuery.toLowerCase();

    return note.includes(query) || amount.includes(query);
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
          placeholder="Search by note or amount"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-xl"
        />

        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {filteredTransactions.map((t) => (
              <li
                key={t.id}
                className="border p-3 rounded-xl flex justify-between items-start"
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

                  <p className="text-sm text-gray-400">
                    {new Date(t.created_at).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  className="text-sm text-red-500 underline"
                  onClick={() => onDeleteTransaction(t)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;

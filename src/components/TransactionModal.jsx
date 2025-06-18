import React from "react";

const TransactionModal = ({ isOpen, onClose, transactionType, transactionData, onChange, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-red-500"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {transactionType === "withdraw" ? "Withdraw Money" : "Add Money"}
        </h2>
        <div className="space-y-3">
          <input
            type="number"
            name="amount"
            value={transactionData.amount}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <textarea
            name="note"
            value={transactionData.note}
            onChange={onChange}
            placeholder="Note"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <button
            onClick={onSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;

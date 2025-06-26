import React, { useEffect, useState } from "react";
import { evaluate } from "mathjs";

const TransactionModal = ({
  isOpen,
  onClose,
  transactionType,
  transactionData,
  onChange,
  onSubmit,
  onDelete,
}) => {
  const [evaluatedAmount, setEvaluatedAmount] = useState(null);
  const [parseError, setParseError] = useState(null);

  useEffect(() => {
    console.log('transactionmodal open')
    try {
      if (transactionData.amount.trim() === "") {
        setEvaluatedAmount(null);
        return;
      }

      const value = evaluate(transactionData.amount);
      if (typeof value === "number" && !isNaN(value)) {
        setEvaluatedAmount(value);
        setParseError(null);
      } else {
        setEvaluatedAmount(null);
        setParseError("Invalid amount");
      }
    } catch (e) {
      setEvaluatedAmount(null);
      setParseError("Invalid math expression");
    }
  }, [transactionData.amount]);

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
            type="text"
            name="amount"
            value={transactionData.amount}
            onChange={onChange}
            placeholder="Amount"
            className="w-full px-4 py-2 border rounded-xl"
          />
          {parseError && <p className="text-sm text-red-500">{parseError}</p>}
          {evaluatedAmount !== null && !parseError && (
            <p className="text-sm text-gray-600">
              = {transactionType === "withdraw" ? "-" : ""}{" "}
              {evaluatedAmount.toFixed(2)}
            </p>
          )}
          <textarea
            name="note"
            value={transactionData.note}
            onChange={onChange}
            placeholder="Note"
            className="w-full px-4 py-2 border rounded-xl"
          />

          <div className="border-t pt-4 mt-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isScheduled"
                checked={transactionData.isScheduled}
                onChange={onChange}
              />
              Schedule this transaction
            </label>

            {transactionData.isScheduled && (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="block text-sm mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={transactionData.start_date}
                    onChange={onChange}
                    className="w-full px-4 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Repeat</label>
                  <select
                    name="frequency"
                    value={transactionData.frequency}
                    onChange={onChange}
                    className="w-full px-4 py-2 border rounded-xl"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (evaluatedAmount === null || isNaN(evaluatedAmount)) {
                alert("Invalid amount entered.");
                return;
              }
              onSubmit(
                evaluatedAmount,
                transactionData.isScheduled,
                transactionData.start_date,
                transactionData.frequency,
              );
            }}
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

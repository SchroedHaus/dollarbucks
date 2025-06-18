import React from "react";

const EditProfileModal = ({ isOpen, onClose, formData, onChange, onSave }) => {
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
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <div className="space-y-3">
          <img
            src={formData.imageUrl || "https://via.placeholder.com/100"}
            alt={formData.name || "Unnamed"}
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="number"
            name="balance"
            value={parseFloat(formData.balance).toFixed(2)}
            onChange={onChange}
            placeholder="Balance"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="text"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={onChange}
            placeholder="Image URL"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <button
            onClick={onSave}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

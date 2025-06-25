import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const EditProfileModal = ({
  isOpen,
  onClose,
  formData,
  onChange,
  onSave,
  onDelete,
  profileId,
  onEditScheduledTransactions, // Add this line
}) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${profileId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("profile-images")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("Image upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(data.path);

    onChange({
      target: { name: "imageUrl", value: publicUrlData.publicUrl },
    });
    setUploading(false);
  };

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
          <div className="flex flex-col items-center space-y-2">
            <label className="cursor-pointer relative group">
              <img
                src={
                  formData.imageUrl ||
                  "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                }
                alt={formData.name || "Unnamed"}
                className="w-24 h-24 rounded-2xl object-cover border group-hover:brightness-90 transition"
              />
              <span className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black bg-opacity-60 rounded-b-2xl py-1 text-center opacity-0 group-hover:opacity-100 transition">
                Change Photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {uploading && (
              <p className="text-sm text-gray-500 mt-1">Uploading image…</p>
            )}
          </div>

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
            value={formData.balance}
            onChange={onChange}
            placeholder="Balance"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <button
            onClick={onSave}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
          >
            Save Changes
          </button>
          <div className="text-center space-y-2">
            <a
              href="#"
              className="w-full text-blue-600 py-2 rounded-xl underline cursor-pointer hover:no-underline"
              onClick={(e) => {
                e.preventDefault();
                if (typeof onEditScheduledTransactions === "function") {
                  onEditScheduledTransactions();
                }
              }}
            >
              Edit Scheduled Transactions
            </a>
          </div>
          <div className="text-center space-y-2">
            <a
              onClick={onDelete}
              className="w-full text-red-600 py-2 rounded-xl underline cursor-pointer hover:no-underline"
            >
              Delete Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;

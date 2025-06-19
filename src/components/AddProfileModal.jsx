import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const AddProfileModal = ({ isOpen, onClose, onProfileCreated }) => {
  const [newProfile, setNewProfile] = useState({
    name: "",
    balance: "",
    imageUrl: "",
  });
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    try {
      setUploading(true);
      let imageUrl = null;

      if (newProfileImageFile) {
        const fileExt = newProfileImageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(fileName, newProfileImageFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(uploadData.path);

        imageUrl = publicUrlData.publicUrl;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            name: newProfile.name,
            balance: parseFloat(newProfile.balance),
            imageUrl,
          },
        ])
        .select()
        .single();

      if (profileError) throw profileError;

      const { error: joinError } = await supabase
        .from("profile_user_join")
        .insert([{ user_id: userData.user.id, profile_id: profile.id }]);

      if (joinError) throw joinError;

      onProfileCreated(profile);
      setNewProfile({ name: "", balance: "", imageUrl: "" });
      setNewProfileImageFile(null);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
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
        <h2 className="text-xl font-semibold mb-4">Add New Profile</h2>
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            value={newProfile.name}
            onChange={(e) =>
              setNewProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Name"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="number"
            name="balance"
            value={newProfile.balance}
            onChange={(e) =>
              setNewProfile((prev) => ({
                ...prev,
                balance: e.target.value,
              }))
            }
            placeholder="Initial Balance"
            className="w-full px-4 py-2 border rounded-xl"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewProfileImageFile(e.target.files[0])}
            className="w-full px-4 py-2 border rounded-xl"
          />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
            disabled={uploading}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProfileModal;

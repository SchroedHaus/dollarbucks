import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import EditProfileModal from "../components/EditProfileModal";
import TransactionModal from "../components/TransactionModal";
import HistoryModal from "../components/HistoryModal";
import {
  fetchProfiles,
  updateProfile,
  submitTransaction,
  fetchTransactionHistory,
} from "../utils/profileService";
import { supabase } from "../supabaseClient";

const Home = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    balance: "",
    imageUrl: "",
  });
  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState(""); // 'add' or 'withdraw'
  const [transactionData, setTransactionData] = useState({
    amount: "",
    note: "",
  });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    balance: "",
    imageUrl: "",
  });


  useEffect(() => {
    fetchProfiles().then(setProfiles).catch(console.error);
  }, []);

  const openModal = (profile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name || "",
      balance: profile.balance || 0,
      imageUrl: profile.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const openTransactionModal = (profile, type) => {
    setSelectedProfile(profile);
    setTransactionType(type);
    setTransactionData({ amount: "", note: "" });
    setTransactionModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(selectedProfile.id, formData);
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? { ...p, ...formData } : p))
      );
      setIsModalOpen(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransactionSubmit = async () => {
    try {
      const newBalance = await submitTransaction(selectedProfile, transactionType, transactionData);
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? { ...p, balance: newBalance } : p))
      );
      setTransactionModalOpen(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const openHistoryModal = async (profile) => {
    setSelectedProfile(profile);
    setHistoryModalOpen(true);
    try {
      const txs = await fetchTransactionHistory(profile.id);
      setTransactions(txs);
    } catch (error) {
      alert("Error loading history: " + error.message);
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-end px-6 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          onClick={() => setAddModalOpen(true)}
        >
          + Add Profile
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition"
          >
            <img
              src={profile.imageUrl || "https://via.placeholder.com/100"}
              alt={profile.name || "Unnamed"}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
            <h2 className="text-lg font-semibold">
              {profile.name || "Unnamed"}
            </h2>
            <p className="text-gray-500">
              Balance: {parseFloat(profile.balance).toFixed(2) ?? 0}
            </p>

            <div className="flex gap-2 mt-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-xl text-sm"
                onClick={() => openTransactionModal(profile, "add")}
              >
                Add Money
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-xl text-sm"
                onClick={() => openTransactionModal(profile, "withdraw")}
              >
                Withdraw
              </button>
            </div>

            <button
              className="text-sm text-blue-500 mt-2"
              onClick={() => openModal(profile)}
            >
              Edit Profile
            </button>
            <button
              className="text-sm text-gray-600 underline"
              onClick={() => openHistoryModal(profile)}
            >
              View History
            </button>
          </div>
        ))}

        {isModalOpen && (
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            formData={formData}
            onChange={handleInputChange}
            onSave={handleSave}
          />
        )}
        {transactionModalOpen && (
          <TransactionModal
            isOpen={transactionModalOpen}
            onClose={() => setTransactionModalOpen(false)}
            transactionType={transactionType}
            transactionData={transactionData}
            onChange={handleTransactionChange}
            onSubmit={handleTransactionSubmit}
          />
        )}
        {historyModalOpen && (
          <HistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            transactions={transactions}
            profileName={selectedProfile?.name}
          />
        )}
        {addModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
              <button
                onClick={() => setAddModalOpen(false)}
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
                  type="text"
                  name="imageUrl"
                  value={newProfile.imageUrl}
                  onChange={(e) =>
                    setNewProfile((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }))
                  }
                  placeholder="Image URL (optional)"
                  className="w-full px-4 py-2 border rounded-xl"
                />
                <button
                  onClick={async () => {
                    const { data, error } = await supabase
                      .from("profiles")
                      .insert([
                        {
                          name: newProfile.name,
                          balance: parseFloat(newProfile.balance),
                          imageUrl: newProfile.imageUrl || null,
                        },
                      ])
                      .select()
                      .single();

                    if (error) {
                      alert("Error adding profile: " + error.message);
                      return;
                    }

                    setProfiles((prev) => [...prev, data]);
                    setAddModalOpen(false);
                    setNewProfile({ name: "", balance: "", imageUrl: "" });
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;

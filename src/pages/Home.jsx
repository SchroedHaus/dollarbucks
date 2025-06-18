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
import ProfileCard from "../components/ProfileCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { evaluate } from "mathjs";

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
        prev.map((p) =>
          p.id === selectedProfile.id ? { ...p, ...formData } : p
        )
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

  const handleTransactionSubmit = async (parsedAmount) => {
    try {

        const raw = transactionData.amount;
        const amount = evaluate(raw);

        if (isNaN(amount)) throw new Error("Invalid amount");


      const newBalance = await submitTransaction(
        selectedProfile,
        transactionType,
        {...transactionData, amount: parsedAmount}
      );
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id ? { ...p, balance: newBalance } : p
        )
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

      <div className="hidden md:grid p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            openModal={openModal}
            openTransactionModal={openTransactionModal}
            openHistoryModal={openHistoryModal}
          />
        ))}
        </div>

        {/* Slider view for mobile */}
        <div className="block md:hidden px-4">
          <Swiper
            spaceBetween={16}
            slidesPerView={1.2}
            onSlideChange={() => {}}
            onSwiper={(swiper) => {}}
          >
            {profiles.map((profile) => (
              <SwiperSlide key={profile.id}>
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  openModal={openModal}
                  openTransactionModal={openTransactionModal}
                  openHistoryModal={openHistoryModal}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

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

    </>
  );
};

export default Home;

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import EditProfileModal from "../components/EditProfileModal";
import TransactionModal from "../components/TransactionModal";
import HistoryModal from "../components/HistoryModal";
import {
  updateProfile,
  submitTransaction,
  fetchTransactionHistory,
  fetchUserProfiles,
} from "../utils/profileService";
import { supabase } from "../supabaseClient";
import ProfileCard from "../components/ProfileCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { evaluate } from "mathjs";
import AddProfileModal from "../components/AddProfileModal";

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
  const [newProfileImageFile, setNewProfileImageFile] = useState(null);

  useEffect(() => {
    fetchUserProfiles().then(setProfiles).catch(console.error);
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
        { ...transactionData, amount: parsedAmount }
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

  const handleDeleteTransaction = async (transaction) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      // 1. Delete from transaction_join
      const { error: joinError } = await supabase
        .from("transaction_join")
        .delete()
        .eq("transaction_id", transaction.id)
        .eq("profile_id", selectedProfile.id);

      if (joinError) throw joinError;

      // 2. Delete from transactions
      const { error: txError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);

      if (txError) throw txError;

      // 3. Update profile balance locally
      const updatedBalance =
        parseFloat(selectedProfile.balance) - transaction.adjustment;
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === selectedProfile.id ? { ...p, balance: updatedBalance } : p
        )
      );

      // 4. Update transaction list in modal
      setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    } catch (err) {
      alert("Error deleting transaction: " + err.message);
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this profile?"))
      return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedProfile.id);

      if (error) throw error;

      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id));
      setIsModalOpen(false);
      setSelectedProfile(null);
    } catch (err) {
      alert("Error deleting profile: " + err.message);
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
      <div className="block md:hidden p-4">
        <Swiper
          spaceBetween={24}
          slidesPerView={1.1}
          centeredSlides={true}
          style={{overflow: "visible"}}
          onSlideChange={() => {}}
          onSwiper={(swiper) => {}}
        >
          {profiles.map((profile) => (
            <SwiperSlide key={profile.id} style={{overflow: "visible"}} className="!overflow-visible">
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
          onDelete={handleDelete}
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
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {addModalOpen && (
        <AddProfileModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onProfileCreated={(newProfile) => 
          setProfiles((prev) => [...prev, newProfile])
        }
        />
      )}
    </>
  );
};

export default Home;

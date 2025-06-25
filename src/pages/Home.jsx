import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import EditProfileModal from "../components/EditProfileModal";
import TransactionModal from "../components/TransactionModal";
import HistoryModal from "../components/HistoryModal";
import ScheduledTransactionsModal from "../components/ScheduledTransactionsModal";
import {
  updateProfile,
  submitTransaction,
  fetchTransactionHistory,
  fetchUserProfiles,
  checkUserLoggedIn,
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
    isScheduled: false,
    start_date: "",
    frequency: "once",
  });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [scheduledModalOpen, setScheduledModalOpen] = useState(false);

  useEffect(() => {
    checkUserLoggedIn();
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
    setTransactionData({
      amount: "",
      note: "",
      isScheduled: false,
      start_date: "",
      frequency: "once",
    });
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
    const { name, value, type, checked } = e.target;
    setTransactionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTransactionSubmit = async (
    parsedAmount,
    isScheduled,
    start_date,
    frequency
  ) => {
    try {
      const raw = transactionData.amount;
      const amount = parsedAmount ?? raw;
      if (isNaN(amount)) throw new Error("Invalid amount");
      if (isScheduled) {
        await supabase.from("scheduled_transactions").insert([
          {
            profile_id: selectedProfile.id,
            adjustment: amount,
            note: transactionData.note,
            start_date: start_date,
            frequency: frequency,
          },
        ]);
      } else {
        const newBalance = await submitTransaction(
          selectedProfile,
          transactionType,
          {
            ...transactionData,
            amount,
          }
        );
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === selectedProfile.id ? { ...p, balance: newBalance } : p
          )
        );
      }
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

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this profile? This action cannot be undone."
      )
    )
      return;
    try {
      await supabase.from("profiles").delete().eq("id", selectedProfile.id);
      setProfiles((prev) => prev.filter((p) => p.id !== selectedProfile.id));
      setIsModalOpen(false);
      setSelectedProfile(null);
    } catch (error) {
      alert("Error deleting profile: " + error.message);
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
          style={{ overflow: "visible" }}
          onSlideChange={() => {}}
          onSwiper={(swiper) => {}}
        >
          {profiles.map((profile) => (
            <SwiperSlide
              key={profile.id}
              style={{ overflow: "visible" }}
              className="!overflow-visible"
            >
              <ProfileCard
                key={profile.id}
                profile={profile}
                openModal={openModal}
                openTransactionModal={openTransactionModal}
                openHistoryModal={openHistoryModal}
                onDelete={handleDeleteProfile}
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
          onDelete={handleDeleteProfile}
          profileId={selectedProfile?.id}
          onEditScheduledTransactions={() => setScheduledModalOpen(true)}
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

      {scheduledModalOpen && (
        <ScheduledTransactionsModal
          isOpen={scheduledModalOpen}
          onClose={() => setScheduledModalOpen(false)}
          profileId={selectedProfile?.id}
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

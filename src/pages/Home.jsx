import { useEffect, useState } from "react";
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
    // check that the user is logged in
    checkUserLoggedIn();

    // set the profiles for the user
    fetchUserProfiles().then(setProfiles).catch(console.error);
  }, []);

  // Open the Edit Profile Modal
  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name || "",
      balance: profile.balance || 0,
      imageUrl: profile.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  // Open the Transaction Modal to add or withdraw money
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

  // Make updates to the Profile form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Profile changes to the database
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

  // Make updates to the transaction form
  const handleTransactionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTransactionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    console.log("changes made to transaction form");
  };

  // Save transaction to database
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

  const openHistoryModal = async (profile) => {
    setSelectedProfile(profile);
    setHistoryModalOpen(true);
    await refreshTransactions(profile.id);
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

  // Helper to refresh transactions for the selected profile
  const refreshTransactions = async (profileId) => {
    try {
      const txs = await fetchTransactionHistory(profileId);
      setTransactions(txs);
    } catch (error) {
      alert("Error loading history: " + error.message);
    }
  };

  // Always keep profiles sorted alphabetically by name
  const sortedProfiles = [...profiles].sort((a, b) =>
    (a.name || "").localeCompare(b.name || "", undefined, {
      sensitivity: "base",
    })
  );

  return (
    <>
      <Header />
      <div className="flex justify-center pt-[60px]">
        <div className="max-w-[1200px] w-full">
          <div className="flex justify-end px-6 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
              onClick={() => setAddModalOpen(true)}
            >
              + Add Profile
            </button>
          </div>

          <div className="hidden md:grid p-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sortedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                openProfileModal={openProfileModal}
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
              {sortedProfiles.map((profile) => (
                <SwiperSlide
                  key={profile.id}
                  style={{ overflow: "visible" }}
                  className="!overflow-visible"
                >
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    openProfileModal={openProfileModal}
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
              selectedProfile={selectedProfile}
              transactions={transactions}
              onTransactionUpdated={() =>
                refreshTransactions(selectedProfile?.id)
              }
              onTransactionDeleted={() =>
                refreshTransactions(selectedProfile?.id)
              }
              setProfiles={setProfiles}
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
        </div>
      </div>
    </>
  );
};

export default Home;

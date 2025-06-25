const ProfileCard = ({
  profile,
  openModal,
  openTransactionModal,
  openHistoryModal,
}) => (
  <div
    key={profile.id}
    className="bg-white rounded-2xl shadow-md p-4 flex flex-col items-center space-y-2 hover:shadow-lg transition"
  >
    <img
      src={
        profile.imageUrl ||
        "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
      }
      alt={profile.name || "Unnamed"}
      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-300"
    />
    <h2 className="text-lg font-semibold">{profile.name || "Unnamed"}</h2>
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
);

export default ProfileCard;

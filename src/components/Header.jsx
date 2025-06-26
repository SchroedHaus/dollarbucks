import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        background: "#f5f5f5",
      }}
    >
      <div
        className="max-w-[1200px] w-full"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem",
          background: "#f5f5f5",
        }}
      >
        <img src="/DollarBucks logo.svg" alt="" className="w-[200px]" />
        <button
          onClick={handleSignOut}
          style={{ padding: "0.5rem 1rem", cursor: "pointer"}}
          className="hover:underline"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;

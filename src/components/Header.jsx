import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

return (
  <header className="shadow-md fixed top-0 left-0 w-full z-50 bg-white dark:bg-[#343434]">
    <div className="max-w-[1200px] mx-auto px-4 py-3 flex justify-between items-center">
      <div>
      <img src="/DollarBucks logo.svg" alt="" className="w-[200px]" />
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex space-x-6">
        <a
          onClick={() => handleSignOut()}
          className="cursor-pointer
      hover:text-indigo-600"
        >
          Sign Out
        </a>
      </nav>

      {/* Mobile Menu Button */}
      <button
        id="menuButton"
        className="md:hidden text-gray-700"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? (
          <X size={24} />
        ) : (
          <Menu size={24} className="dark:stroke-white" />
        )}
      </button>
    </div>

    {/* Mobile Nav */}
    {menuOpen && (
      <div className="bg-white dark:bg-[#343434] md:hidden shadow-lg px-4 py-4 space-y-2 text-gray-700">
        <a
          onClick={() => handleSignOut()}
          className="cursor-pointer
      hover:text-indigo-600 block text-right"
        >
          Sign Out
        </a>
      </div>
    )}
  </header>
);
};

export default Header;

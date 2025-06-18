import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f5f5f5' }}>
      <h2 style={{ margin: 0 }}>DollarBucks</h2>
      <button onClick={handleSignOut} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Sign Out
      </button>
    </header>
  );
};

export default Header;

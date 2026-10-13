// src/pages/UnauthorizedPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Unauthorized Access</h1>

      <button
        onClick={() => navigate("/login")}
        style={{
          marginTop: '1rem',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go to Login
      </button>

      <p style={{ marginTop: '1rem' }}>
        You do not have permission to view this page.
      </p>
    </div>
  );
};

export default UnauthorizedPage;

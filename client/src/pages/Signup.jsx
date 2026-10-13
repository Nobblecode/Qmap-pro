import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const { register, login, apiError } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ProductOwner');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const TypeRoleMap = {
        ProductOwner: 'Product Owner',
        Affiliate: 'Affiliate',
        Admin: 'Admin',
      }

      const response = await register({
        FullName: fullName,
        Email: email,
        Password: password,
        role,
        Type: TypeRoleMap[role],
      });

      if (response && !response.Error) {
        await login({ Email: email, Password: password, role });

        if (role === 'Admin') navigate('/admin-dashboard');
        else if (role === 'ProductOwner') navigate('/product-owner-dashboard');
        else if (role === 'Affiliate') navigate('/affiliate-dashboard');
        else navigate('/unauthorized');
      }
    } catch (err) {
      alert(err?.response?.data?.Error || err?.message || "Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#FAF9F6] flex items-center justify-center text-black px-4">
      <div className="w-full max-w-lg backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-4xl font-bold text-center text-indigo-600">Sign Up</h2>
        <p className="text-center text-black/80 mb-4">
          Create your account and start managing your products and affiliates.
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-md bg-black/10 border border-black/20 text-black placeholder-black/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-md bg-black/10 border border-black/20 text-black placeholder-black/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-md bg-black/10 border border-black/20 text-black placeholder-black/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-md bg-black/10 border border-black/20 text-black backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            {/* <option value="Admin">Admin</option> */}
            <option value="ProductOwner">ProductOwner</option>
            <option value="Affiliate">Affiliate</option>
          </select>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-md hover:opacity-90 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-black/70 mt-4">
          Already have an account?{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="text-indigo-600 underline hover:text-indigo-500">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;

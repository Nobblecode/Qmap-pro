import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, apiError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ProductOwner');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ Email: email, Password: password, role });

      if (role === 'Admin') navigate('/admin-dashboard');
      else if (role === 'ProductOwner') navigate('/product-owner-dashboard');
      else if (role === 'Affiliate') navigate('/affiliate-dashboard');
      else navigate('/unauthorized');
    } catch (error) {
      alert(error?.response?.data?.Error || error?.message || "Login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#FAF9F6] flex items-center justify-center text-black px-6 py-10">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 space-y-6">
        <h2 className="text-4xl font-bold text-center text-indigo-600">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-black/10 border border-black/20 text-black placeholder-black/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg bg-black/10 border border-black/20 text-black placeholder-black/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/10 border border-black/20 text-black backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          >
            <option value="ProductOwner">ProductOwner</option>
            <option value="Affiliate">Affiliate</option>
            <option value="Admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition"
          >
            Login
          </button>

          <p className="text-center text-sm text-black/70 mt-4">
            Don’t have an account?{' '}
            <a href="/signup" onClick={(e) => { e.preventDefault(); navigate("/signup"); }} className="text-indigo-500 underline hover:text-indigo-700">
              Sign up here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

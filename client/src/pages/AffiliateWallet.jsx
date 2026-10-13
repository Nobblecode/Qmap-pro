import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AffiliateWallet = () => {
  const { user } = useAuth();
  const BASE_API_URL = import.meta.env.VITE_API_BASE;
  const userEmail = user?.Data?.Details?.Email || user?.email || '';
  const [affiliateWallet, setAffiliateWallet] = useState({ balance: 0, transactions: [] });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawOtp, setWithdrawOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const fetchAffiliateWallet = async () => {
    const loadLocalWallet = () => {
      const storedBalance = Number.parseFloat(localStorage.getItem(`wallet_${userEmail}`) || '0');
      let transactions = [];
      try {
        transactions = JSON.parse(localStorage.getItem(`wallet_txn_${userEmail}`) || '[]');
        if (!Array.isArray(transactions)) transactions = [];
      } catch {
        transactions = [];
      }
      setAffiliateWallet({
        balance: Number.isNaN(storedBalance) ? 0 : storedBalance,
        transactions,
      });
    };

    const token = user?.Data?.Auth;
    if (!BASE_API_URL || !token) {
      loadLocalWallet();
      return;
    }

    try {
      const res = await axios.get(`${BASE_API_URL}/affiliate/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      const balance = res.data?.Balance;
      const transactions = res.data?.Transactions || [];
      setAffiliateWallet({ balance: balance || 0, transactions });
    } catch (err) {
      loadLocalWallet();
    }
  };

  useEffect(() => {
    fetchAffiliateWallet();
    const refreshWallet = () => fetchAffiliateWallet();
    const handleStorage = (event) => {
      if (!event.key || event.key === `wallet_${userEmail}` || event.key === `wallet_txn_${userEmail}`) {
        refreshWallet();
      }
    };
    window.addEventListener('walletUpdated', refreshWallet);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('walletUpdated', refreshWallet);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user, userEmail, BASE_API_URL]);

  const sendWithdrawOtp = async () => {
    try {
      const token = user?.Data?.Auth;
      if (!token) return toast.error('Not authenticated');
      const res = await axios.post(`${BASE_API_URL}/affiliate/wallet/withdraw/sendOtp`, { Amount: Number(withdrawAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      setAwaitingOtp(true);
      toast.success(res.data?.Message || 'OTP sent');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.Error || 'Failed to send OTP');
    }
  };

  const confirmWithdraw = async () => {
    try {
      const token = user?.Data?.Auth;
      if (!token) return toast.error('Not authenticated');
      const payload = { Amount: Number(withdrawAmount), OTP: withdrawOtp };
      const res = await axios.post(`${BASE_API_URL}/affiliate/wallet/withdraw`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setAwaitingOtp(false);
      setWithdrawAmount('');
      setWithdrawOtp('');
      toast.success(res.data?.Message || 'Withdrawal requested');
      // refresh wallet
      fetchAffiliateWallet();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.Error || 'Failed to withdraw');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-6 text-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Affiliate Wallet</h2>
        <p className="mb-4">Balance: <strong>{affiliateWallet.balance || 0}</strong></p>
        {(!BASE_API_URL || !user?.Data?.Auth) && (
          <p className="mb-4 text-sm text-white/70">Demo commissions are stored in this browser; no real payout is made.</p>
        )}

        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="font-semibold">Withdraw Funds</h3>
          <p className="text-sm text-white/80 mb-2">Request withdrawal by sending an OTP to your email and confirming.</p>

          <input
            type="number"
            placeholder="Amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="p-2 rounded bg-white/5 border border-white/10 text-white w-full mb-2"
          />

          {!awaitingOtp ? (
            <button onClick={sendWithdrawOtp} className="bg-indigo-600 px-4 py-2 rounded text-white">Send OTP</button>
          ) : (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Enter OTP"
                value={withdrawOtp}
                onChange={(e) => setWithdrawOtp(e.target.value)}
                className="p-2 rounded bg-white/5 border border-white/10 text-white flex-1"
              />
              <button onClick={confirmWithdraw} className="bg-green-600 px-4 py-2 rounded text-white">Confirm Withdraw</button>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Recent Transactions</h3>
          <div className="space-y-2">
            {affiliateWallet.transactions && affiliateWallet.transactions.length > 0 ? (
              affiliateWallet.transactions.map((t) => (
                <div key={t._id || t.id} className="bg-white/5 p-3 rounded">
                  <div className="flex justify-between text-sm">
                    <div>{t.Title || `${t.Type || t.type} — ${t.Process || t.process}`}</div>
                    <div>{t.Amount || t.amount}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-white/70">No transactions yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateWallet;

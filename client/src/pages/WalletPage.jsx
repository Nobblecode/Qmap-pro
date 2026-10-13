import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const WalletPage = () => {
  const { user } = useAuth();
  const BASE_API_URL = import.meta.env.VITE_API_BASE;
  const token = user?.Data?.Auth;
  const userEmail = user?.Data?.Details?.Email || user?.email || '';
  const userFullName = user?.Data?.Details?.FullName || user?.fullName || '';
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [otp, setOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const publicKey = 'pk_test_5b6f375ec06c72c9d92d2fc6cfb0968cffbda981';
  const walletKey = `wallet_${userEmail || user?.id || 'anonymous'}`;
  const txnKey = `wallet_txn_${userEmail || user?.id || 'anonymous'}`;

  const loadWalletLocally = () => {
    const storedBalance = parseFloat(localStorage.getItem(walletKey));
    const storedTxns = localStorage.getItem(txnKey);
    setBalance(Number.isNaN(storedBalance) ? 0 : storedBalance);
    if (storedTxns) {
      try {
        setTransactions(JSON.parse(storedTxns));
      } catch (err) {
        console.error('Transaction parsing failed', err);
        setTransactions([]);
      }
    }
  };

  useEffect(() => {
    const loadWallet = async () => {
      if (!BASE_API_URL || !token) {
        loadWalletLocally();
        return;
      }

      try {
        const res = await axios.get(`${BASE_API_URL}/productowner/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setBalance(res.data?.Balance || 0);
        setTransactions(res.data?.Transactions || []);
      } catch (err) {
        console.log({ err });
        loadWalletLocally();
      }
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === walletKey || event.key === txnKey) loadWallet();
    };

    loadWallet();
    window.addEventListener('walletUpdated', loadWallet);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('walletUpdated', loadWallet);
      window.removeEventListener('storage', handleStorage);
    };
  }, [BASE_API_URL, token, user, walletKey, txnKey]);

  const triggerWalletUpdate = () => {
    window.dispatchEvent(new Event('walletUpdated'));
  };

  const onSuccess = () => {
    // On success, the server webhook will credit the user's balance. Refresh wallet from server.
    (async () => {
      try {
        if (!BASE_API_URL || !token) {
          toast.error('Wallet payments require a configured API and authenticated account.');
          return;
        }
        const res = await axios.get(`${BASE_API_URL}/productowner/wallet`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAmount('');
        setBalance(res.data?.Balance || 0);
        setTransactions(res.data?.Transactions || []);
        toast.success('Deposit successful (pending confirmation).');
        triggerWalletUpdate();
      } catch (e) {
        toast.success('Deposit recorded locally; will refresh when server available');
      }
    })();
  };

  const onClose = () => toast("Payment cancelled");

  const handleFundWallet = async () => {
    if (!BASE_API_URL || !token) {
      const nextBalance = balance + validAmount;
      const nextTransactions = [
        {
          _id: `demo_${Date.now()}`,
          Type: 'Credit',
          Amount: validAmount,
          Title: 'Demo wallet top-up',
          createdAt: new Date().toISOString(),
        },
        ...transactions,
      ];

      localStorage.setItem(walletKey, String(nextBalance));
      localStorage.setItem(txnKey, JSON.stringify(nextTransactions));
      setBalance(nextBalance);
      setTransactions(nextTransactions);
      setAmount('');
      triggerWalletUpdate();
      toast.success('Demo funds added locally. No real payment was processed.');
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_API_URL}/productowner/wallet/deposit/initialize`,
        { Amount: validAmount, ReturnUrl: window.location.href },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const link = res.data?.PaymentLink;
      if (link) {
        window.location.href = link;
      } else {
        toast.error('Could not initialize payment');
      }
    } catch (error) {
      console.error(error);
      toast.error('Payment initialization failed');
    }
  };

  const handleWithdraw = async () => {
    try {
      const num = parseFloat(withdrawAmount);
      if (isNaN(num) || num <= 0) return toast.error('Enter a valid amount');
      if (num > balance) return toast.error('Insufficient balance');
      if (!BASE_API_URL || !token) {
        const nextBalance = balance - num;
        const nextTransactions = [
          {
            _id: `demo_${Date.now()}`,
            Type: 'Debit',
            Amount: num,
            Title: 'Demo withdrawal',
            createdAt: new Date().toISOString(),
          },
          ...transactions,
        ];

        localStorage.setItem(walletKey, String(nextBalance));
        localStorage.setItem(txnKey, JSON.stringify(nextTransactions));
        setBalance(nextBalance);
        setTransactions(nextTransactions);
        setWithdrawAmount('');
        setBank('');
        setAccountNumber('');
        setAccountName('');
        triggerWalletUpdate();
        toast.success('Demo withdrawal recorded locally. No funds were transferred.');
        return;
      }

      // send OTP and create temporary withdrawal on server
      const res = await axios.post(
        `${BASE_API_URL}/productowner/wallet/withdraw/sendOtp`,
        { Amount: num, Bank: bank, AccountNumber: accountNumber, AccountName: accountName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.Sent) {
        setAwaitingOtp(true);
        // backend returns Otp in dev; do not rely on this in production, user should receive via email
        if (res.data.Otp) setOtp(res.data.Otp); // TODO: Remove this line before pushing
        toast.success('OTP sent. Enter the code to confirm withdrawal.');
      } else {
        toast.error('Could not initiate withdrawal.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.Error || 'Withdrawal initiation failed');
    }
  };

  const confirmWithdraw = async () => {
    try {
      if (!otp) return toast.error('Enter OTP');
      if (!BASE_API_URL || !token) {
        return toast.error('Withdrawals require a configured API and authenticated account.');
      }
      const res = await axios.post(
        `${BASE_API_URL}/productowner/wallet/withdraw`,
        { OTP: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.Withdrawn) {
        toast.success('Withdrawal initiated successfully');
        // refresh wallet from server
        const r = await axios.get(`${BASE_API_URL}/productowner/wallet`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setBalance(r.data?.Balance || 0);
        setTransactions(r.data?.Transactions || []);
        setWithdrawAmount('');
        setBank('');
        setAccountNumber('');
        setAccountName('');
        setOtp('');
        setAwaitingOtp(false);
        triggerWalletUpdate();
      } else {
        toast.error('Withdrawal failed to start');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.Error || 'Withdrawal confirmation failed');
    }
  };

  const validAmount = parseFloat(amount);
  const componentProps = {
    email: userEmail,
    amount: validAmount * 100,
    metadata: { name: userFullName },
    publicKey,
    text: 'Fund Wallet',
    onSuccess,
    onClose,
    currency: 'NGN',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] text-white p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">My Wallet</h1>

      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-md mx-auto mb-8">
        <p className="text-lg mb-4">
          Current Balance: <strong>₦{balance.toFixed(2)}</strong>
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (₦)"
          className="w-full p-2 rounded bg-white/20 border border-white/30 mb-4 text-white placeholder-white/70"
        />

        {validAmount > 0 ? (
          <button
            onClick={handleFundWallet}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
          >
            {!BASE_API_URL || !token ? 'Add Demo Funds' : 'Fund Wallet'}
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-500 text-white py-2 rounded-md opacity-50"
          >
            Enter valid amount
          </button>
        )}
        {(!BASE_API_URL || !token) && (
          <p className="mt-2 text-sm text-white/70">
            Demo mode: funds stay in this browser; no payment is processed.
          </p>
        )}

        <div className="mt-6">
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Withdraw amount (₦)"
            className="w-full p-2 rounded bg-white/20 border border-white/30 mb-2 text-white placeholder-white/70"
          />

          <input
            type="text"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Bank code (e.g. 058)"
            className="w-full p-2 rounded bg-white/20 border border-white/30 mb-2 text-white placeholder-white/70"
          />

          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Account number"
            className="w-full p-2 rounded bg-white/20 border border-white/30 mb-2 text-white placeholder-white/70"
          />

          <input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Account name"
            className="w-full p-2 rounded bg-white/20 border border-white/30 mb-2 text-white placeholder-white/70"
          />

          {!awaitingOtp ? (
            <button
              onClick={handleWithdraw}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
            >
              {!BASE_API_URL || !token ? 'Record Demo Withdrawal' : 'Withdraw'}
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full p-2 rounded bg-white/20 border border-white/30 mb-2 text-white placeholder-white/70"
              />
              <button
                onClick={confirmWithdraw}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
              >
                Confirm Withdrawal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-white/70">No transactions yet.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {transactions.map((txn) => (
              <li
                key={txn._id}
                className="bg-white/5 p-3 rounded-md border border-white/20"
              >
                <div className="flex justify-between">
                  <span
                    className={`font-bold ${
                      txn.Type === 'Credit' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {txn.Type === 'Credit' ? '+' : '-'}₦{txn.Amount.toFixed(2)}
                  </span>
                  <span className="text-sm">{txn.createdAt}</span>
                </div>
                <p className="text-sm text-white/80">{txn.Title}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default WalletPage;

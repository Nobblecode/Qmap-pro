import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaWallet } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const AffiliateDashboard = () => {
  const { user, logout } = useAuth();
  const userEmail = user?.Data?.Details?.Email || user?.email || '';
  const [groupedProducts, setGroupedProducts] = useState({});
  const [generatedLinks, setGeneratedLinks] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletBalances, setWalletBalances] = useState({});
  const [affiliateWallet, setAffiliateWallet] = useState({ balance: 0, transactions: [] });
  const [serverCounts, setServerCounts] = useState({});

  const affiliateLinksKey = `affiliateLinks_${userEmail}`;
  const BASE_API_URL = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchAffiliateWallet = async () => {
      const loadLocalWallet = () => {
        const localBalance = Number.parseFloat(localStorage.getItem(`wallet_${userEmail}`) || '0');
        let transactions = [];
        try {
          transactions = JSON.parse(localStorage.getItem(`wallet_txn_${userEmail}`) || '[]');
          if (!Array.isArray(transactions)) transactions = [];
        } catch {
          transactions = [];
        }
        setAffiliateWallet({ balance: Number.isNaN(localBalance) ? 0 : localBalance, transactions });
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

    fetchAffiliateWallet();

    const fetchOwnerWallets = async () => {
      const balances = {};
      try {
        const res = await axios.get(`${BASE_API_URL}/general/wallets/all`);
        const items = res.data?.balances || [];
        items.forEach((b) => {
          if (!b || !b.user) return;
          // ensure we only map product owners
          if ((b.type || '').toLowerCase().includes('product')) {
            balances[b.user.Email] = Number(b.balance) || 0;
          }
        });
      } catch (e) {
        // fallback to localStorage reading if public API fails
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('wallet_')) {
            const email = key.replace('wallet_', '');
            balances[email] = parseFloat(localStorage.getItem(key) || '0');
          }
        });
      }

      setWalletBalances(balances);
    };

    const loadProductsByOwner = async () => {
      const grouped = {};
      const loadLocalProducts = () => Object.keys(localStorage)
        .filter((key) => key.startsWith('products_'))
        .flatMap((key) => {
          const ownerEmail = key.slice('products_'.length);
          try {
            const storedProducts = JSON.parse(localStorage.getItem(key) || '[]');
            if (!Array.isArray(storedProducts)) return [];
            return storedProducts.map((product) => ({
              ...product,
              _id: product._id || product.id,
              affiliateCommission: product.affiliateCommission ?? product.price,
              isActive: product.isActive ?? product.active !== false,
              productOwner: product.productOwner || { Email: ownerEmail },
            }));
          } catch (error) {
            console.error(`Failed to load products for ${ownerEmail}`, error);
            return [];
          }
        });

      try {
        const token = user?.Data?.Auth;
        const res = BASE_API_URL && token
          ? await axios.get(`${BASE_API_URL}/general/products/all`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          : null;
        const products = res
          ? res.data?.products ?? res.data?.data?.products ?? res.data ?? []
          : loadLocalProducts();

        products.forEach((product) => {
          const ownerEmail = product.productOwner?.Email || 'Unknown owner';
          if (!grouped[ownerEmail]) grouped[ownerEmail] = [];
          grouped[ownerEmail].push(product);
        });
      } catch (error) {
        console.warn('Product API unavailable; loading locally stored products.', error);
        loadLocalProducts().forEach((product) => {
          const ownerEmail = product.productOwner.Email;
          if (!grouped[ownerEmail]) grouped[ownerEmail] = [];
          grouped[ownerEmail].push(product);
        });
      }

      setGroupedProducts?.(grouped);
      // fetch DB-backed owner balances after products are known
      fetchOwnerWallets();
    };

    const loadAffiliateLinks = () => {
      const storedLinks = localStorage.getItem(affiliateLinksKey);
      if (storedLinks) {
        setGeneratedLinks(JSON.parse(storedLinks));
      }
    };

    const refreshAll = () => {
      loadProductsByOwner();
      loadAffiliateLinks();
        fetchAffiliateWallet();
    };
    const handleStorageChange = (event) => {
      if (
        !event.key ||
        event.key.startsWith('products_') ||
        event.key.startsWith('wallet_') ||
        event.key.startsWith('clicks_') ||
        event.key.startsWith('conversions_') ||
        event.key === affiliateLinksKey
      ) {
        refreshAll();
      }
    };

    refreshAll();

    window.addEventListener('productsUpdated', refreshAll);
    window.addEventListener('walletUpdated', refreshAll);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('productsUpdated', refreshAll);
      window.removeEventListener('walletUpdated', refreshAll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  // fetch server-side click/conversion counts for displayed products
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const counts = {};
        const token = user?.Data?.Auth;
        for (const ownerEmail of Object.keys(groupedProducts)) {
          const products = groupedProducts[ownerEmail] || [];
          for (const product of products) {
            try {
              const id = product._id || product.id;
              const localClicks = Number(localStorage.getItem(`clicks_${userEmail}_${id}`) || 0);
              const localConversions = Number(localStorage.getItem(`conversions_${userEmail}_${id}`) || 0);
              let clicks = localClicks;
              let conversions = localConversions;

              if (BASE_API_URL && token) {
                const email = encodeURIComponent(userEmail);
                const [clickRes, conversionRes] = await Promise.all([
                  axios.get(`${BASE_API_URL}/general/tracking/counts/clicks/${email}/${id}`).catch(() => null),
                  axios.get(`${BASE_API_URL}/general/tracking/counts/conversions/${email}/${id}`).catch(() => null),
                ]);
                clicks = Number(clickRes?.data?.count ?? localClicks);
                conversions = Number(conversionRes?.data?.count ?? localConversions);
              }

              counts[`${userEmail}_${id}_clicks`] = clicks;
              counts[`${userEmail}_${id}_conversions`] = conversions;
            } catch (e) {
              // ignore individual product failures
            }
          }
        }
        setServerCounts(counts);
      } catch (e) {
        // ignore overall failures
      }
    };

    if (Object.keys(groupedProducts).length > 0 && userEmail) fetchCounts();
    const handleTrackingStorage = (event) => {
      if (
        !event.key ||
        event.key.startsWith(`clicks_${userEmail}_`) ||
        event.key.startsWith(`conversions_${userEmail}_`)
      ) {
        fetchCounts();
      }
    };
    window.addEventListener('trackingUpdated', fetchCounts);
    window.addEventListener('storage', handleTrackingStorage);
    return () => {
      window.removeEventListener('trackingUpdated', fetchCounts);
      window.removeEventListener('storage', handleTrackingStorage);
    };
  }, [groupedProducts, user]);

  const generateAffiliateLink = (productId, baseLink, ownerEmail) => {
    const walletBalance = parseFloat(walletBalances[ownerEmail] || 0);
    console.log({ ownerEmail, walletBalances, walletBalance });

    if (walletBalance <= 0) {
      toast.error('Link temporarily deactivated: Insufficient owner funds.');
      return;
    }

    // If we have an auth token, request server to create/return affiliate link
    const token = user?.Data?.Auth;
    const BASE_API_URL = import.meta.env.VITE_API_BASE;

    const createLink = async () => {
      try {
        let link;
        if (token && BASE_API_URL) {
          try {
            const res = await axios.post(`${BASE_API_URL}/product/affiliate-links/${productId}`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            link = res.data?.affiliateLink?.shareUrl;
          } catch (error) {
            console.warn('Server link generation unavailable; creating a demo link.', error);
          }
        }

        if (!link) {
          const trackedUrl = new URL(`/product/${encodeURIComponent(productId)}`, window.location.origin);
          trackedUrl.searchParams.set('ref', userEmail || 'affiliate');
          if (baseLink) trackedUrl.searchParams.set('destination', baseLink);
          link = trackedUrl.toString();
        }

        const updated = { ...generatedLinks, [productId]: link };
        setGeneratedLinks(updated);
        localStorage.setItem(affiliateLinksKey, JSON.stringify(updated));
        await navigator.clipboard.writeText(link);
        toast.success('Affiliate link copied!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to generate affiliate link');
      }
    };

    createLink();
  };

  // --- Affiliate wallet withdraw UI handlers ---
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawOtp, setWithdrawOtp] = useState('');
  const [awaitingOtp, setAwaitingOtp] = useState(false);

  const sendWithdrawOtp = async () => {
    try {
      const token = user?.Data?.Auth;
      if (!token) return toast.error('Not authenticated');
      const BASE = BASE_API_URL;
      const res = await axios.post(`${BASE}/affiliate/wallet/withdraw/sendOtp`, { Amount: Number(withdrawAmount) }, { headers: { Authorization: `Bearer ${token}` } });
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
      const BASE = BASE_API_URL;
      const payload = { Amount: Number(withdrawAmount), OTP: withdrawOtp };
      const res = await axios.post(`${BASE}/affiliate/wallet/withdraw`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setAwaitingOtp(false);
      setWithdrawAmount('');
      setWithdrawOtp('');
      toast.success(res.data?.Message || 'Withdrawal requested');
      // refresh wallet
      const wres = await axios.get(`${BASE}/affiliate/wallet`, { headers: { Authorization: `Bearer ${token}` } });
      const wallet = wres.data?.wallet || wres.data?.data || {};
      setAffiliateWallet({ balance: wallet.Balance || wallet.balance || 0, transactions: wallet.transactions || [] });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.Error || 'Failed to withdraw');
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-6 text-white">
      {/* Header */}
      <div className="relative flex justify-end items-center space-x-4">
        <button
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-sm text-white hover:bg-white/30 transition"
          title={`Wallet — ${affiliateWallet.balance || 0}`}
          onClick={() => (window.location.href = '/affiliate-wallet')}
        >
          <div className="text-xs text-white text-center">
            <FaWallet />
            <div className="text-[10px]">{affiliateWallet.balance || 0}</div>
          </div>
        </button>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold text-white hover:bg-white/30 transition"
        >
          {userEmail?.[0]?.toUpperCase() || 'U'}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg">
            <div className="px-4 py-2 text-sm">
              <span className="block text-white font-semibold break-all">{userEmail}</span>
            </div>
            <button
              onClick={() => (window.location.href = '/affiliate-performance')}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition"
            >
              My Performance
            </button>
            <button
              onClick={handleLogout}
              className="mt-4 bg-red-600 px-4 py-2 rounded text-white w-full"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main */}
      <h2 className="text-2xl font-bold mt-6 mb-4 text-center">All Products</h2>

      {Object.entries(groupedProducts).length === 0 ? (
        <p className="text-center text-white/80">No products available.</p>
      ) : (
        Object.entries(groupedProducts).map(([ownerEmail, products]) => (
          <div key={ownerEmail} className="mb-8">
            {/* <h3 className="text-xl font-semibold mb-4 border-b border-white/20 pb-2">{ownerEmail}</h3> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => {
                const id = product._id || product.id;
                const serverClickKey = `${userEmail}_${id}_clicks`;
                const serverConvKey = `${userEmail}_${id}_conversions`;
                // Use DB-backed counts from serverCounts; fall back to 0 if unavailable
                let clicks = Number(serverCounts[serverClickKey] || 0);
                const conversions = Number(serverCounts[serverConvKey] || 0);
                const commission = Number(product.affiliateCommission ?? product.price ?? 0);
                const isDeactivated = !product.isActive;

                return (
                  <div
                    key={product._id}
                    className={`relative p-6 rounded-2xl shadow-lg space-y-3 border border-white/20 backdrop-blur-md transition ${
                      isDeactivated
                        ? 'bg-white/10 opacity-50 grayscale cursor-not-allowed'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${
                        isDeactivated ? 'bg-red-600 text-white' : 'bg-green-500 text-white'
                      }`}
                    >
                      {isDeactivated ? 'Inactive' : 'Active'}
                    </span>

                    <h4 className="text-lg font-bold text-white">{product.name}</h4>
                    <p className="text-white/90">{product.description}</p>
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    )}
                    <p className="text-white">
                      <strong>Affiliate Commission:</strong> {product.currency || '₦'}
                      {product.price}
                    </p>
                    {product.affiliateLink && (
                      <p className="text-white/90">
                        <strong>Original:</strong>{' '}
                        <a
                          href={product.affiliateLink.startsWith('https://') ? product.affiliateLink : `https://${product.affiliateLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Visit
                        </a>
                      </p>
                    )}

                    {isDeactivated ? (
                      <p className="text-red-400 font-semibold">
                        Affiliate link temporarily deactivated.
                      </p>
                    ) : (
                      <>
                        <button
                          onClick={() =>
                            generateAffiliateLink(id, product.affiliateLink, ownerEmail)
                          }
                          className="inline-block bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition"
                        >
                          Generate My Affiliate Link
                        </button>
                        {generatedLinks[id] && (() => {
                          let linkToShow = generatedLinks[id];
                          if (!user?.Data?.Auth) {
                            let isCurrentTracker = false;
                            try {
                              const storedUrl = new URL(linkToShow, window.location.origin);
                              isCurrentTracker = storedUrl.origin === window.location.origin
                                && storedUrl.pathname === `/product/${encodeURIComponent(id)}`
                                && storedUrl.searchParams.get('ref') === (userEmail || 'affiliate');
                            } catch {
                              isCurrentTracker = false;
                            }
                            if (!isCurrentTracker) {
                              const trackedUrl = new URL(`/product/${encodeURIComponent(id)}`, window.location.origin);
                              trackedUrl.searchParams.set('ref', userEmail || 'affiliate');
                              if (product.affiliateLink) trackedUrl.searchParams.set('destination', product.affiliateLink);
                              linkToShow = trackedUrl.toString();
                            }
                          }

                          return (
                          <p className="text-sm text-white/80 break-all mt-1">
                            <strong>Your Link:</strong>{' '}
                            <a
                              href={linkToShow}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              {linkToShow}
                            </a>
                          </p>
                          );
                        })()}
                      </>
                    )}

                    <p className="text-sm text-white/80">
                      <strong>Clicks:</strong> {clicks} | <strong>Conversions:</strong> {conversions}
                    </p>
                    <p><strong>Commission earned:</strong> {product.currency || ''}{(conversions * commission).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AffiliateDashboard;

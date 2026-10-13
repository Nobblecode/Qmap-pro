import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AffiliatePerformance = () => {
  const { user } = useAuth();
  const userEmail = user?.Data?.Details?.Email || user?.email || '';
  const [productStats, setProductStats] = useState([]);
  const [affiliateWallet, setAffiliateWallet] = useState({ balance: 0 });

  const BASE_API_URL = import.meta.env.VITE_API_BASE;

  useEffect(() => {
    const fetchAffiliateWallet = async () => {
      const loadLocalWallet = () => {
        const balance = Number.parseFloat(localStorage.getItem(`wallet_${userEmail}`) || '0');
        setAffiliateWallet({ balance: Number.isNaN(balance) ? 0 : balance });
      };
      const token = user?.Data?.Auth;
      if (!BASE_API_URL || !token) {
        loadLocalWallet();
        return;
      }

      try {
        const res = await axios.get(`${BASE_API_URL}/affiliate/wallet`, { headers: { Authorization: `Bearer ${token}` } });
        const balance = res.data?.Balance || 0;
        setAffiliateWallet({ balance: balance || 0 });
      } catch (e) {
        loadLocalWallet();
      }
    };

    const fetchProducts = async () => {
      try {
        const token = user?.Data?.Auth;
        let products;
        if (BASE_API_URL && token) {
          const res = await axios.get(`${BASE_API_URL}/general/products/all`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          products = res.data?.products ?? res.data?.data?.products ?? res.data ?? [];
        } else {
          products = Object.keys(localStorage)
            .filter((key) => key.startsWith('products_'))
            .flatMap((key) => {
              try {
                const storedProducts = JSON.parse(localStorage.getItem(key) || '[]');
                return Array.isArray(storedProducts)
                  ? storedProducts.map((product) => ({
                    ...product,
                    _id: product._id || product.id,
                    affiliateCommission: product.affiliateCommission ?? product.price,
                  }))
                  : [];
              } catch {
                return [];
              }
            });
        }

        const email = encodeURIComponent(userEmail);

        const statsPromises = products.map(async (product) => {
          const id = product._id || product.id;
          try {
            const localClicks = Number(localStorage.getItem(`clicks_${userEmail}_${id}`) || 0);
            const localConversions = Number(localStorage.getItem(`conversions_${userEmail}_${id}`) || 0);
            let clicks = localClicks;
            let conversions = localConversions;
            if (BASE_API_URL && token) {
              const [clickRes, conversionRes] = await Promise.all([
                axios.get(`${BASE_API_URL}/general/tracking/counts/clicks/${email}/${id}`).catch(() => null),
                axios.get(`${BASE_API_URL}/general/tracking/counts/conversions/${email}/${id}`).catch(() => null),
              ]);
              clicks = Number(clickRes?.data?.count ?? localClicks);
              conversions = Number(conversionRes?.data?.count ?? localConversions);
            }

            if (clicks <= 0 && conversions <= 0) {
              return null;
            }

            const commission = Number(product.affiliateCommission || 0);
            const earnings = conversions * commission;
            return {
              id,
              name: product.name,
              clicks,
              conversions,
              earnings,
              currency: product.currency || '\u20a6',
            };
          } catch (e) {
            return {
              id,
              name: product.name,
              clicks: 0,
              conversions: 0,
              earnings: 0,
              currency: product.currency || '\u20a6',
            };
          }
        });

        const statsRaw = await Promise.all(statsPromises);
        const stats = statsRaw.filter(Boolean);
        setProductStats(stats);
      } catch (error) {
        console.log(error);
      }
    };

    if (!userEmail) return;

    fetchAffiliateWallet();
    fetchProducts();
    const refreshPerformance = () => {
      fetchAffiliateWallet();
      fetchProducts();
    };
    window.addEventListener('walletUpdated', refreshPerformance);
    window.addEventListener('trackingUpdated', refreshPerformance);
    return () => {
      window.removeEventListener('walletUpdated', refreshPerformance);
      window.removeEventListener('trackingUpdated', refreshPerformance);
    };
  }, [user, userEmail, BASE_API_URL]);

  const totalClicks = productStats.reduce((sum, p) => sum + (p.clicks || 0), 0);
  const totalEarnings = productStats.reduce((sum, p) => sum + (p.earnings || 0), 0);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Affiliate Performance</h2>
        <div className="text-right">
          <div className="text-sm">Wallet Balance</div>
          <div className="font-semibold">{affiliateWallet.balance || 0}</div>
        </div>
      </div>

      <div className="mb-6 flex justify-around">
        <div className="text-center">
          <p className="text-lg font-semibold">Total Clicks</p>
          <p className="text-2xl">{totalClicks}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Total Earnings</p>
          <p className="text-2xl">{productStats[0]?.currency}{totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {productStats.map((product) => (
          <div key={product.id} className="bg-white/10 p-4 rounded-xl">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p>Clicks: {product.clicks}</p>
            <p>Conversions: {product.conversions}</p>
            <p>
              Earnings: {product.currency}{(product.earnings || 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AffiliatePerformance;

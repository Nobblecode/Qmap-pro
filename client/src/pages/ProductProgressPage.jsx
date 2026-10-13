import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const ProductProgressPage = () => {
  const { user } = useAuth();
  const [productData, setProductData] = useState([]);
  const BASE_API_URL = import.meta.env.VITE_API_BASE;
  const token = user?.Data?.Auth;
  const userEmail = user?.Data?.Details?.Email || user?.email || '';

  useEffect(() => {
    if (!user) return;

    const loadLocalProducts = () => {
      try {
        const products = JSON.parse(localStorage.getItem(`products_${userEmail || user.id || 'anonymous'}`) || '[]');
        if (!Array.isArray(products)) {
          setProductData([]);
          return;
        }

        const storageKeys = Object.keys(localStorage);
        const data = products.map((product) => {
          const productId = String(product.id || product._id);
          const localClicks = storageKeys
            .filter((key) => key.startsWith('clicks_') && key.endsWith(`_${productId}`))
            .reduce((total, key) => total + (Number.parseInt(localStorage.getItem(key) || '0', 10) || 0), 0);

          return {
            name: product.name,
            clicks: localClicks,
          };
        });

        setProductData(data);
      } catch (error) {
        console.error('Failed to load local product progress', error);
        setProductData([]);
      }
    };

    const fetchOwnerProducts = async () => {
      if (!BASE_API_URL || !token) {
        loadLocalProducts();
        return;
      }

      try {
        const res = await axios.get(`${BASE_API_URL}/productowner/products/my/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const products = res.data?.products ?? res.data?.data?.products ?? res.data ?? [];

        const data = products.map((product) => ({
          name: product.name,
          clicks: product.currentClicks || 0,
        }));

        setProductData(data);
      } catch (error) {
        console.warn('Product progress API unavailable; loading local data.', error);
        loadLocalProducts();
      }
    };

    fetchOwnerProducts();
    const refreshProgress = () => fetchOwnerProducts();
    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('products_') || event.key.startsWith('clicks_')) {
        refreshProgress();
      }
    };
    window.addEventListener('trackingUpdated', refreshProgress);
    window.addEventListener('productsUpdated', refreshProgress);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('trackingUpdated', refreshProgress);
      window.removeEventListener('productsUpdated', refreshProgress);
      window.removeEventListener('storage', handleStorage);
    };
  }, [BASE_API_URL, token, user, userEmail]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Product Performance</h2>

      <div className="bg-white/10 p-6 rounded-xl max-w-4xl mx-auto">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Bar dataKey="clicks" fill="#38bdf8">
              <LabelList dataKey="clicks" position="top" fill="#fff" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductProgressPage;

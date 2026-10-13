import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const ProductLanding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [productOwnerEmail, setProductOwnerEmail] = useState('');
  const [conversionRecorded, setConversionRecorded] = useState(false);
  const clickRecorded = useRef(false);
  const referral = new URLSearchParams(window.location.search).get('ref');
  const destination = new URLSearchParams(window.location.search).get('destination');
  const BASE_API_URL = import.meta.env.VITE_API_BASE;
  const token = user?.Data?.Auth;

  useEffect(() => {
    let storedProductEntry = null;
    Object.keys(localStorage)
      .filter((key) => key.startsWith('products_'))
      .some((key) => {
        try {
          const products = JSON.parse(localStorage.getItem(key) || '[]');
          if (!Array.isArray(products)) return false;
          const storedProduct = products.find((item) => String(item.id || item._id) === String(id));
          if (!storedProduct) return false;
          storedProductEntry = {
            product: storedProduct,
            ownerEmail: storedProduct.productOwner?.Email || key.slice('products_'.length),
          };
          return true;
        } catch {
          return false;
        }
      });
    setProduct(storedProductEntry?.product || null);
    setProductOwnerEmail(storedProductEntry?.ownerEmail || '');

    if (!referral || clickRecorded.current) return;
    clickRecorded.current = true;

    const recordLocalClick = () => {
      const clicksKey = `clicks_${referral}_${id}`;
      const current = Number.parseInt(localStorage.getItem(clicksKey) || '0', 10);
      localStorage.setItem(clicksKey, String(current + 1));
      window.dispatchEvent(new Event('trackingUpdated'));
    };

    if (BASE_API_URL && token) {
      axios.post(
        `${BASE_API_URL}/general/tracking/click/${encodeURIComponent(referral)}`,
        { ProductId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      ).then(() => window.dispatchEvent(new Event('trackingUpdated'))).catch(recordLocalClick);
    } else {
      recordLocalClick();
    }
  }, [BASE_API_URL, id, referral, token]);

  const handleConversion = async () => {
    if (!referral || conversionRecorded) return;

    if (BASE_API_URL && token) {
      try {
        await axios.post(
          `${BASE_API_URL}/general/tracking/conversion/${encodeURIComponent(referral)}`,
          { ProductId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversionRecorded(true);
        window.dispatchEvent(new Event('trackingUpdated'));
        toast.success('Conversion submitted to the server.');
      } catch (error) {
        console.error('Conversion tracking failed', error);
        toast.error('The server could not record this conversion.');
      }
      return;
    }

    const commission = Number(product?.affiliateCommission ?? product?.price ?? 0);
    if (commission > 0) {
      if (!productOwnerEmail) {
        toast.error('Could not identify the product owner wallet. No commission was transferred.');
        return;
      }

      const ownerWalletKey = `wallet_${productOwnerEmail}`;
      const ownerBalance = Number.parseFloat(localStorage.getItem(ownerWalletKey) || '0') || 0;
      if (ownerBalance < commission) {
        toast.error('The product owner wallet does not have enough funds for this commission.');
        return;
      }

      const walletKey = `wallet_${referral}`;
      const txnKey = `wallet_txn_${referral}`;
      const balance = Number.parseFloat(localStorage.getItem(walletKey) || '0') || 0;
      const ownerTxnKey = `wallet_txn_${productOwnerEmail}`;
      let transactions = [];
      let ownerTransactions = [];
      try {
        transactions = JSON.parse(localStorage.getItem(txnKey) || '[]');
        if (!Array.isArray(transactions)) transactions = [];
      } catch {
        transactions = [];
      }
      try {
        ownerTransactions = JSON.parse(localStorage.getItem(ownerTxnKey) || '[]');
        if (!Array.isArray(ownerTransactions)) ownerTransactions = [];
      } catch {
        ownerTransactions = [];
      }

      const timestamp = new Date().toISOString();
      const transactionId = Date.now();
      localStorage.setItem(ownerWalletKey, String(ownerBalance - commission));
      localStorage.setItem(ownerTxnKey, JSON.stringify([
        {
          id: `commission_debit_${transactionId}`,
          Type: 'Debit',
          Process: 'Completed',
          Amount: commission,
          Title: `Affiliate commission: ${product?.name || 'Product purchase'}`,
          createdAt: timestamp,
        },
        ...ownerTransactions,
      ]));
      localStorage.setItem(walletKey, String(balance + commission));
      localStorage.setItem(txnKey, JSON.stringify([
        {
          id: `commission_${transactionId}`,
          Type: 'Credit',
          Process: 'Completed',
          Amount: commission,
          Title: `Commission: ${product?.name || 'Product purchase'}`,
          createdAt: timestamp,
        },
        ...transactions,
      ]));
    }

    const conversionsKey = `conversions_${referral}_${id}`;
    const currentConversions = Number.parseInt(localStorage.getItem(conversionsKey) || '0', 10);
    localStorage.setItem(conversionsKey, String(currentConversions + 1));
    setConversionRecorded(true);
    window.dispatchEvent(new Event('walletUpdated'));
    window.dispatchEvent(new Event('trackingUpdated'));
    toast.success(commission > 0
      ? `Demo conversion recorded; ${commission} transferred to the affiliate wallet.`
      : 'Demo conversion recorded. No commission is configured for this product.');
  };

  const sellerUrl = destination || product?.affiliateLink || '';
  const sellerHref = sellerUrl && (/^https?:\/\//i.test(sellerUrl) ? sellerUrl : `https://${sellerUrl}`);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <main className="mx-auto max-w-2xl space-y-5 rounded-xl border border-white/15 bg-white/5 p-6">
        {product?.image && <img src={product.image} alt={product.name} className="max-h-80 w-full rounded-lg object-cover" />}
        <div>
          <p className="text-sm text-white/60">Affiliate product</p>
          <h1 className="text-2xl font-bold">{product?.name || `Product ${id}`}</h1>
          {product?.description && <p className="mt-2 text-white/80">{product.description}</p>}
        </div>

        {sellerHref && (
          <a href={sellerHref} target="_blank" rel="noopener noreferrer" className="inline-block rounded-md bg-green-600 px-4 py-2 font-semibold hover:bg-green-500">
            Continue to seller
          </a>
        )}

      <button
        onClick={handleConversion}
        disabled={!referral || conversionRecorded}
        className="mr-3 rounded-md bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {conversionRecorded ? 'Conversion recorded' : 'Simulate Purchase'}
      </button>

      <button
        onClick={() => navigate(-1)}
        className="rounded-md bg-white/15 px-4 py-2 hover:bg-white/25"
      >
        Go Back
      </button>
        <p className="text-sm text-white/60">This page records demo conversions only. External seller purchases require a server-side merchant callback.</p>
      </main>
    </div>
  );
};

export default ProductLanding;

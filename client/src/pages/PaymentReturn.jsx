import React, { useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PaymentReturn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference') || urlParams.get('trxref') || urlParams.get('ref');
      if (!reference) {
        toast.error('No reference provided');
        navigate('/wallet');
        return;
      }

      const returnUrlFromQuery = urlParams.get('returnUrl');

      // If a verify token is present (in callback_url), perform public verify synchronously so DB is updated
      const tokenParam = urlParams.get('token');
      if (tokenParam) {
        try {
          const BASE_API_URL = import.meta.env.VITE_API_BASE;
          const res = await axios.post(`${BASE_API_URL}/productowner/wallet/deposit/verify-public`, { reference, token: tokenParam });
          const returnUrl = res.data?.ReturnUrl || returnUrlFromQuery;
          if (returnUrl) {
            window.location.href = returnUrl;
            return;
          }
        } catch (err) {
          console.error('Public verify failed', err);
          // fall through to try other flows
        }
      }

      // If no token but returnUrl present, poll status endpoint to wait for DB update (max ~12s)
      if (returnUrlFromQuery) {
        const BASE_API_URL = import.meta.env.VITE_API_BASE;
        const deadline = Date.now() + 12_000; // 12s
        let pending = true;
        try {
          while (Date.now() < deadline) {
            const statusRes = await axios.get(`${BASE_API_URL}/productowner/wallet/deposit/status/${reference}`);
            pending = statusRes.data?.pending;
            if (!pending) break;
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (e) {
          console.error('Status poll failed', e);
        }

        // Redirect regardless of poll result to avoid blocking user indefinitely
        window.location.href = returnUrlFromQuery;
        return;
      }

      // final fallback: navigate to wallet and let webhook or background processes update DB
      navigate('/wallet');
    };

    verifyAndRedirect();
  }, [user, navigate]);

  return <div className="p-4">Verifying payment...</div>;
};

export default PaymentReturn;

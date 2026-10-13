import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaWallet } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductOwnerDashboard = ({ handleSubmit }) => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    image: '',
    price: '',
    currency: 'USD',
    affiliateLink: '',
    maxClicks: '10000',
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clickCounts, setClickCounts] = useState({});

  const BASE_API_URL = import.meta.env.VITE_API_BASE;
  const localProductsKey = `products_${user?.Data?.Details?.Email || user?.email || user?.id || 'anonymous'}`;
  const readLocalClickCounts = (productList) => {
    const storageKeys = Object.keys(localStorage);
    return Object.fromEntries(productList.map((product) => {
      const productId = String(product.id || product._id);
      const trackedClicks = storageKeys
        .filter((key) => key.startsWith('clicks_') && key.endsWith(`_${productId}`))
        .reduce((total, key) => total + (Number.parseInt(localStorage.getItem(key) || '0', 10) || 0), 0);
      return [productId, Math.max(Number(product.currentClicks) || 0, trackedClicks)];
    }));
  };

  const sendInsufficientFundsEmail = (email, productName) => {
    console.log(`EMAIL SENT TO: ${email}`);
    console.log(`Subject: Affiliate Link Deactivated`);
    console.log(
      `Message: Affiliate link for "${productName}" has been deactivated due to insufficient wallet balance. Please deposit.`
    );
  };

  useEffect(() => {
    if (!user) return;

    const token = user?.Data?.Auth;
    if (!BASE_API_URL || !token) {
      try {
        const storedProducts = JSON.parse(localStorage.getItem(localProductsKey) || '[]');
        const localProducts = Array.isArray(storedProducts) ? storedProducts : [];
        setProducts(localProducts);
        setClickCounts(readLocalClickCounts(localProducts));
      } catch (err) {
        console.error('Failed to load local products', err);
        setProducts([]);
        setClickCounts({});
      }
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_API_URL}/productowner/products/my/products`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });

        const apiProducts = res.data?.products || res.data || [];

        // Normalize backend product shape to frontend form shape
        const mapped = apiProducts.map((p) => ({
          id: p._id || p.id,
          name: p.name,
          description: p.description,
          image: p.imageUrl || p.image || '',
          price: p.affiliateCommission || p.price || '',
          currency: p.currency || 'USD',
          affiliateLink: p.affiliateLink || '',
          maxClicks: p.maxClicks || '10000',
          active: p.isActive !== false,
          currentClicks: p.currentClicks || 0,
          raw: p,
        }));

        setProducts(mapped);

        // populate clickCounts from product.currentClicks
        const counts = {};
        mapped.forEach((prod) => {
          counts[prod.id] = prod.currentClicks || 0;
        });
        setClickCounts(counts);
      } catch (err) {
        console.error('Failed to fetch products', err);
        toast.error('Failed to load products from server.');
      }
    };

    fetchProducts();
  }, [BASE_API_URL, localProductsKey, user]);

  useEffect(() => {
    if (!user || products.length === 0) return;

    const refreshClickCounts = async () => {
      const localCounts = readLocalClickCounts(products);
      const token = user?.Data?.Auth;
      if (!BASE_API_URL || !token) {
        setClickCounts(localCounts);
        return;
      }

      try {
        const res = await axios.get(`${BASE_API_URL}/productowner/products/my/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const apiProducts = res.data?.products ?? res.data?.data?.products ?? res.data ?? [];
        const apiCounts = Object.fromEntries(apiProducts.map((product) => {
          const productId = String(product._id || product.id);
          return [productId, Math.max(Number(product.currentClicks) || 0, localCounts[productId] || 0)];
        }));
        setClickCounts((currentCounts) => ({ ...currentCounts, ...apiCounts }));
      } catch (error) {
        setClickCounts(localCounts);
      }
    };

    const handleStorage = (event) => {
      if (!event.key || event.key.startsWith('clicks_')) refreshClickCounts();
    };

    window.addEventListener('trackingUpdated', refreshClickCounts);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('trackingUpdated', refreshClickCounts);
      window.removeEventListener('storage', handleStorage);
    };
  }, [BASE_API_URL, products, user]);

  const navigate = useNavigate();

  // Update local state only (server is the source of truth)
  const saveProducts = (data) => {
    setProducts(data);
    if (!BASE_API_URL || !user?.Data?.Auth) {
      localStorage.setItem(localProductsKey, JSON.stringify(data));
    }
    window.dispatchEvent(new Event('productsUpdated'));
  };

  // resize function
  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        } else if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const dataURLtoFile = (dataUrl, filename = 'image.jpg') => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    resizeImage(file, 1200, 1200, (resizedDataUrl) => {
      try {
        const resizedFile = dataURLtoFile(resizedDataUrl, file.name || 'image.jpg');
        setImageFile(resizedFile);
        setImagePreview(resizedDataUrl);
        setFormData((prev) => ({ ...prev, image: resizedDataUrl }));

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 300);
      } catch (err) {
        console.error('Image processing error', err);
        toast.error('Failed to process image.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) return toast.error('Please wait for the image to finish processing.');
    if (!formData.image && !imageFile) return toast.error('Image is required.');

    setIsSaving(true);
    setUploadProgress(0);

    try {
      const token = user?.Data?.Auth;
      let apiProduct;
      if (BASE_API_URL && token) {
        const apiForm = new FormData();
        apiForm.append('name', formData.name);
        apiForm.append('description', formData.description);
        apiForm.append('currency', formData.currency || 'USD');
        apiForm.append('affiliateCommission', String(formData.price || '0'));
        apiForm.append('maxClicks', String(formData.maxClicks || '10000'));
        if (formData.affiliateLink) apiForm.append('affiliateLink', formData.affiliateLink);

        if (imageFile instanceof File) {
          apiForm.append('image', imageFile, imageFile.name);
        }

        const res = editIndex !== null
          ? await axios.put(`${BASE_API_URL}/productowner/products/${products[editIndex].id}`, apiForm, {
            headers: { Authorization: `Bearer ${token}` },
          })
          : await axios.post(`${BASE_API_URL}/productowner/products/add`, apiForm, {
            headers: { Authorization: `Bearer ${token}` },
          });
        apiProduct = res.data?.product || res.data;
      } else {
        apiProduct = {
          id: editIndex !== null ? products[editIndex].id : `product_${Date.now()}`,
          name: formData.name,
          description: formData.description,
          image: imagePreview || formData.image || '',
          price: formData.price,
          currency: formData.currency || 'USD',
          affiliateLink: formData.affiliateLink,
          maxClicks: formData.maxClicks || '10000',
          active: formData.active,
          currentClicks: editIndex !== null ? products[editIndex].currentClicks || 0 : 0,
        };
      }

      const savedProduct = {
        id: apiProduct._id || apiProduct.id,
        name: apiProduct.name,
        description: apiProduct.description,
        image: apiProduct.imageUrl || apiProduct.image || '',
        price: apiProduct.affiliateCommission || apiProduct.price || '',
        currency: apiProduct.currency || 'USD',
        affiliateLink: apiProduct.affiliateLink || '',
        maxClicks: apiProduct.maxClicks || '10000',
        active: apiProduct.isActive !== false,
        currentClicks: apiProduct.currentClicks || 0,
        raw: apiProduct,
      };

      let updated = [...products];
      if (editIndex !== null) {
        updated[editIndex] = savedProduct;
      } else {
        updated.push(savedProduct);
      }

      saveProducts(updated);
      handleSubmit?.(savedProduct);
      toast.success(editIndex !== null ? 'Product updated' : 'Product added');

      setFormData({ id: '', name: '', description: '', image: '', price: '', affiliateLink: '', currency: 'USD', maxClicks: '10000', active: true });
      setImagePreview(null);
      setImageFile(null);
      setEditIndex(null);
      setUploadProgress(0);

    } catch (err) {
      console.error(err);
      toast.error(`Failed to save product: ${err?.response?.data?.Error || err.message}`);
    } finally {
      setIsSaving(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = (index) => {
    const prod = products[index];
    setFormData(prod);
    setImagePreview(prod.image || null);
    setImageFile(null);
    setEditIndex(index);
    setMenuOpen(false);
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      const prodId = products[index].id;
      const token = user?.Data?.Auth;
      if (BASE_API_URL && token) {
        await axios.delete(`${BASE_API_URL}/productowner/products/${prodId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const updated = products.filter((_, i) => i !== index);
      saveProducts(updated);
      toast.success('Product deleted');
    } catch (err) {
      console.error(err);
      toast.error(`Failed to delete product: ${err?.response?.data?.Error || err.message}`);
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-6 text-white relative">
      {/* Header Icons */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 z-20">
        <button
          className="w-10 h-10 mt-4 rounded-full bg-white/20 backdrop-blur-sm text-xl flex items-center justify-center text-white hover:bg-white/30 transition"
          title="Wallet"
          onClick={() => navigate('/wallet')}
        >
          <FaWallet />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 mt-4 rounded-full bg-white/20 backdrop-blur-sm text-xl font-bold flex items-center justify-center hover:bg-white/30 transition"
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
              {products.length > 0 ? (
                products.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="border-b border-white/20 px-4 py-3 flex flex-col space-y-1"
                  >
                    <span className="font-semibold text-white">{p.name}</span>
                    <span className="text-sm text-white/70">Clicks: {clickCounts[p.id] || 0}</span>
                    <div className="flex space-x-3 mt-1">
                      <button
                        onClick={() => handleEdit(idx)}
                        className="flex-1 px-2 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(idx)}
                        className="flex-1 px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-white/70">No products submitted yet</p>
              )}

              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/product-progress');
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition mt-2"
              >
                View Product Progress
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="mt-2 mb-2 bg-red-600 px-4 py-2 rounded text-white w-full hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-14 mb-8 text-center">
        {editIndex !== null ? 'Edit Product' : 'Submit Product'}
      </h2>

      <form
        onSubmit={handleFormSubmit}
        className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-4 shadow-lg"
      >
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div>
          <label className="block text-sm mb-1">Upload Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-white"
            disabled={isUploading}
          />
          {(isUploading || uploadProgress > 0) && (
            <div className="w-full bg-white/20 rounded-full h-3 mt-2">
              <div
                className="h-3 bg-green-400 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
        {imagePreview && (
          <div className="mt-2 text-center">
            <img
              src={imagePreview}
              alt="Preview"
              className="mx-auto w-32 h-32 object-cover rounded-md"
            />
          </div>
        )}
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
          <option value="JPY">JPY (¥)</option>
          <option value="KRW">KRW (₩)</option>
          <option value="NGN">NGN (₦)</option>
        </select>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white">
            {formData.currency}
          </span>
          <input
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Affiliate Commission Price"
            className="w-full pl-12 pr-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <input
          name="maxClicks"
          value={formData.maxClicks}
          onChange={handleChange}
          placeholder="Max Clicks (optional)"
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />

        <input
          name="affiliateLink"
          value={formData.affiliateLink}
          onChange={handleChange}
          placeholder="Affiliate Link"
          className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"
          disabled={formData.active === false}
        />
        {formData.active === false && (
          <p className="text-red-400 text-sm mt-1">
            This link is deactivated due to insufficient wallet funds.
          </p>
        )}

        <button
          type="submit"
          disabled={isUploading || isSaving}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-full shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : editIndex !== null ? 'Update Product' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default ProductOwnerDashboard;

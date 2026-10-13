import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_BASE;
      const res = await axios.post(`${BASE}/general/contact`, { name, email, message });
      if (res.data && res.data.Message) {
        setFeedback({ type: 'success', text: res.data.Message });
        setName(''); setEmail(''); setMessage('');
      } else {
        setFeedback({ type: 'success', text: 'Message sent' });
      }
    } catch (err) {
      const text = err?.response?.data?.Error || err.message || 'Failed to send message';
      setFeedback({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] to-[#FAF9F6] flex items-center justify-center text-black  overflow-hidden">
      <div className="w-full md:max-w-4xl md:mx-auto backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-4 md:p-8 space-y-10">

        <header className="text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">Contact Us</h1>
          <p className="text-lg text-black/80">We’d love to hear from you! Send us a message below.</p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-lg border border-black/20 bg-black/10 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded-lg border border-black/20 bg-black/10 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message:</label>
            <textarea
              id="message"
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your Message"
              className="w-full px-4 py-2 rounded-lg border border-black/20 bg-black/10 text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              required
            ></textarea>
          </div>

          {feedback && (
            <div className={`text-sm ${feedback.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {feedback.text}
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default Contact;

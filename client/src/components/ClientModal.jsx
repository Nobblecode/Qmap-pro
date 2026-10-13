import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export default function ClientModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Affiliate",
    status: "Active",
  });

  useEffect(() => {
    setFormData(
      initialData ?? {
        name: "",
        email: "",
        role: "Affiliate",
        status: "Active",
      }
    );
  }, [initialData]);

  

  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setTimeout(onClose, 0);
    
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6 bg-[#14121a] text-white rounded-lg max-w-md mx-auto space-y-4 border border-white/10">
        <h2 className="text-lg font-bold text-white">Client Info</h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border border-white/20 rounded p-2 bg-white/5 text-white placeholder-white/60"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border border-white/20 rounded p-2 bg-white/5 text-white placeholder-white/60"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full border border-white/20 rounded p-2 bg-white/5 text-gray-300"
        >
          <option value="Affiliate">Affiliate</option>
          <option value="Product Owner">Product Owner</option>
          <option value="Admin">Admin</option>
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-white/20 rounded p-2 bg-white/5 text-gray-300"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white">
            Cancel
          </Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

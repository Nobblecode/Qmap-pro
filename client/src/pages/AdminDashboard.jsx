import React, { useState, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import Card from "../components/Card";
import Button from "../components/Button";
import ClientModal from "../components/ClientModal";
import toast from "react-hot-toast";
import { useAuth } from '../context/AuthContext';
import {
  AffiliateDashboard,
  ProductOwnerDashboard,
  AdminDashboard,
} from "../components/RoleDashboards";


export default function AdminClients() {
  const { user, logout } = useAuth();
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [loggedInRole] = useState("Admin");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAdd = () => {
    setEditingClient(null);
    setShowModal(true);
  };
  const handleEdit = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };
  const handleSave = (data) => {
    // if editingClient exists, call backend update (not implemented) otherwise create
    const token = user?.Data?.Auth;
    const createClient = async () => {
      try {
        const payload = { FullName: data.name, Email: data.email, Password: data.password || 'TempPass123!', type: data.role };
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/admin/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.Error || 'Failed to create client');
        setClients(prev => [...prev, { id: body.client._id, name: body.client.FullName, email: body.client.Email, role: body.client.type, status: 'Active' }]);
        toast.success('Added client');
        setShowModal(false);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to add client');
      }
    };

    if (editingClient) {
      // update flow not implemented; close modal
      toast('Update not implemented');
      setShowModal(false);
    } else {
      createClient();
    }
  };
  const handleDelete = (id) => {
    if (!window.confirm("Delete client?")) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
    toast.success("Client deleted");
  };
  const handleToggleStatus = (id) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
      )
    );
    toast.success("Client status updated");
  };

  useEffect(() => {
    const loadClients = async () => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE;
      const token = user?.Data?.Auth;
      if (!apiBaseUrl || !token) {
        try {
          const localUsers = JSON.parse(localStorage.getItem('qmapUsers') || '[]');
          const localClients = Array.isArray(localUsers)
            ? localUsers
              .filter((localUser) => localUser.email !== user?.email)
              .map((localUser) => ({
                id: localUser.id,
                name: localUser.fullName,
                email: localUser.email,
                role: localUser.type || localUser.role,
                status: 'Active',
              }))
            : [];
          setClients(localClients);
        } catch (error) {
          console.error('Failed to load local users', error);
          setClients([]);
        }
        return;
      }

      try {
        const res = await fetch(`${apiBaseUrl}/admin/clients`, { headers: { Authorization: `Bearer ${token}` } });
        const body = await res.json();
        if (!res.ok) throw new Error(body?.Error || 'Failed to load clients');
        setClients(body.clients.map(c => ({ id: c._id, name: c.FullName, email: c.Email, role: c.type, status: 'Active' })));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load clients');
      }
    };
    loadClients();
  }, [user]);

  const renderDashboard = () => {
    switch (loggedInRole) {
      case "Affiliate":
        return <AffiliateDashboard />;
      case "Product Owner":
        return <ProductOwnerDashboard />;
      case "Admin":
        return (
          <>
            {/* Admin Header with Profile/Logout */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-xl font-bold flex items-center justify-center hover:bg-white/30 transition"
                >
                  {user?.email?.[0]?.toUpperCase() || 'A'}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-10">
                    <div className="px-4 py-2 text-sm text-white font-semibold break-all">
                      {user?.email}
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full bg-red-600 px-4 py-2 rounded text-white mt-2 hover:opacity-90 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            <AdminDashboard />
            <Card title="Manage Clients" className="mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={handleAdd}>+ Add Client</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-md">
                  <thead>
                    <tr className="bg-white/20">
                      {['Name','Email','Role','Status','Actions'].map(h => <th key={h} className="p-3 text-left text-white font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map(c => (
                      <tr key={c.id} className="border-b border-white/20 hover:bg-white/10">
                        <td className="p-3 text-white">{c.name}</td>
                        <td className="p-3 text-white/80">{c.email}</td>
                        <td className="p-3 text-white">{c.role}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${c.status==='Active'?'bg-green-500':'bg-gray-500'} text-white`}>{c.status}</span>
                        </td>
                        <td className="p-3 space-x-2">
                          <Button size="sm" onClick={() => handleEdit(c)} className="bg-indigo-500 hover:bg-indigo-600">Edit</Button>
                          <Button size="sm" onClick={() => handleDelete(c.id)} className="bg-red-500 hover:bg-red-600">Delete</Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(c.id)}
                            className={`${c.status === "Active" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}
                          >
                            {c.status === "Active" ? "Suspend" : "Activate"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        );
      default:
        return <div className="text-white">No dashboard available</div>;
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-[#1f1c2c] to-[#928DAB] p-6">
        {renderDashboard()}
        {showModal && <ClientModal onClose={()=>setShowModal(false)} onSave={handleSave} initialData={editingClient} />}
      </div>
    </PageWrapper>
  );
}

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const USERS_KEY = 'qmapUsers';

const readUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
};

const normalizeRole = (value = '') => {
  const role = String(value).toLowerCase().replace(/[ _-]/g, '');
  if (role === 'productowner') return 'ProductOwner';
  if (role === 'affiliate') return 'Affiliate';
  if (role === 'admin') return 'Admin';
  return '';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('qmapUser') || 'null');
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState(() => normalizeRole(localStorage.getItem('qmapUserRole') || ''));

  const register = async ({ FullName, Email, Password, role: requestedRole, Type }) => {
    const fullName = String(FullName || '').trim();
    const email = String(Email || '').trim().toLowerCase();
    const password = String(Password || '');
    const normalizedRole = normalizeRole(requestedRole);

    if (!fullName || !email || !password || !normalizedRole) {
      throw new Error('Please complete all fields and choose a valid account type.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const users = readUsers();
    if (users.some((item) => String(item.email).toLowerCase() === email)) {
      throw new Error('An account with this email already exists. Please log in.');
    }

    // Local-demo authentication only. Do not use this storage approach for production.
    const newUser = {
      id: `user_${Date.now()}`,
      fullName,
      email,
      password,
      role: normalizedRole,
      type: Type || normalizedRole,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return { Access: true, Register: true, user: { id: newUser.id, fullName, email, role: normalizedRole } };
  };

  const login = async ({ Email, Password, role: requestedRole }) => {
    const email = String(Email || '').trim().toLowerCase();
    const password = String(Password || '');
    const normalizedRole = normalizeRole(requestedRole);
    const storedUser = readUsers().find((item) =>
      String(item.email).toLowerCase() === email &&
      item.password === password &&
      normalizeRole(item.role) === normalizedRole
    );
    const found = storedUser || (import.meta.env.DEV &&
      normalizedRole === 'Admin' &&
      email === 'admin@gmail.com' &&
      password === 'admin321'
      ? {
        id: 'demo-admin',
        fullName: 'Demo Admin',
        email,
        role: 'Admin',
        type: 'Admin',
      }
      : null);

    if (!found) {
      throw new Error('Invalid email, password, or account type. If you are new, sign up first.');
    }

    const safeUser = {
      id: found.id,
      fullName: found.fullName,
      email: found.email,
      role: normalizeRole(found.role),
      type: found.type || normalizeRole(found.role),
    };
    localStorage.setItem('qmapUser', JSON.stringify(safeUser));
    localStorage.setItem('qmapUserRole', safeUser.role);
    setUser(safeUser);
    setRole(safeUser.role);
    return safeUser;
  };

  const logout = () => {
    localStorage.removeItem('qmapUser');
    localStorage.removeItem('qmapUserRole');
    setUser(null);
    setRole('');
  };

  useEffect(() => {
    if (user) localStorage.setItem('qmapUser', JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, role, register, login, logout, apiError: '' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

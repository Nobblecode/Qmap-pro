// components/RoleDashboards.jsx
import React from "react";

export function AffiliateDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Affiliate Dashboard</h2>
      <ul className="list-disc ml-5">
        <li>View Commission & Rewards</li>
        <li>Browse Product Listings</li>
        <li>Get Notifications</li>
        <li>Analytics Summary</li>
      </ul>
    </div>
  );
}

export function ProductOwnerDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Product Owner Dashboard</h2>
      <ul className="list-disc ml-5">
        <li>Manage Product Listings</li>
        <li>View Affiliate Performance</li>
        <li>Access Transaction Reports</li>
        <li>Receive Notifications</li>
      </ul>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
      {/* <ul className="list-disc ml-5">
        <li>KYC & Fraud Shield Overview</li>
        <li>Manage All Clients</li>
        <li>Full Analytics</li>
        <li>System Notifications</li>
      </ul> */}
    </div>
  );
}

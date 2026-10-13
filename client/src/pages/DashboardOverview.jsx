import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import About from "./About";
import Contact from "./Contact";
import HeroSection from "./Hero";

const data = [
  { name: "Clients", value: 400 },
  { name: "Servers", value: 300 },
  { name: "Databases", value: 200 },
  { name: "Gateways", value: 100 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function DashboardOverview() {
  return (
    <div className="flex flex-col w-full">

      {/* Hero Section */}
      <HeroSection />

      {/* Dashboard Overview */}
      <section className="w-full max-w-6xl px-4 py-10 mx-auto flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Dashboard Overview</h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <ul className="space-y-2 text-black/80">
              <li>Clients: 400</li>
              <li>App Servers: 300</li>
              <li>Databases: 200</li>
              <li>Gateways: 100</li>
            </ul>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Live Status</h2>
            <div className="flex flex-col space-y-2 text-black/80">
              <span className="text-green-600">● All systems operational</span>
              <span className="text-blue-600">● App Servers: Online</span>
              <span className="text-yellow-600">● Load Balancer: Degraded</span>
            </div>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Resource Breakdown</h2>
            <div className="w-full h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FAF9F6",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      color: "#000",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl mb-10">
          <About />
        </div>

        <div className="w-full max-w-4xl">
          <Contact />
        </div>
      </section>
    </div>
  );
}

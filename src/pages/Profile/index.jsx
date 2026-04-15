import "./index.css";
import { useState } from "react";
import OrdersTab from "./components/OrdersTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import { Link } from "react-router-dom";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("pedidos");

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Mi Perfil
              </h1>
              <p className="text-white/50 mt-1">
                Gestiona tus pedidos y información personal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("pedidos")}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
              activeTab === "pedidos"
                ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                : "bg-gray-900/50 text-white/70 border border-white/10 hover:bg-gray-800/50 hover:border-white/20"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Mis Pedidos
          </button>
          <button
            onClick={() => setActiveTab("informacion-personal")}
            className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
              activeTab === "informacion-personal"
                ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/20"
                : "bg-gray-900/50 text-white/70 border border-white/10 hover:bg-gray-800/50 hover:border-white/20"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Información Personal
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6">
          {activeTab === "pedidos" && <OrdersTab />}
          {activeTab === "informacion-personal" && <PersonalInfoTab />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
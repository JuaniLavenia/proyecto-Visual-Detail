import "./index.css";
import { useState } from "react";
import OrdersTab from "./components/OrdersTab";
import PersonalInfoTab from "./components/PersonalInfoTab";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, User } from "../../components/common/Icons";

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
              <ArrowLeft className="w-5 h-5" />
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
            <Package className="w-5 h-5" />
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
            <User className="w-5 h-5" />
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
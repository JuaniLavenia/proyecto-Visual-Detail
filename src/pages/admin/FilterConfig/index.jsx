import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../../lib/api";
import useAuthStore from "../../../stores/useAuthStore";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
} from "../../../components/common/Icons";

function FilterConfig() {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuthStore();
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !isAdmin) {
      navigate("/login");
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await api.get("/api/filter-config/plp/admin");
        setFilters(response.data.data?.filters || []);
      } catch (requestError) {
        console.error("Error fetching filter configuration:", requestError);
        setError("No se pudo cargar la configuración de filtros");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [token, isAdmin, navigate]);

  const toggleFilter = (key) => {
    setFilters((current) =>
      current.map((filter) =>
        filter.key === key ? { ...filter, isActive: !filter.isActive } : filter,
      ),
    );
  };

  const moveFilter = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filters.length) return;

    setFilters((current) => {
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const saveConfig = async () => {
    setSaving(true);
    setError("");
    try {
      await api.put("/api/filter-config/plp", { filters });
      Swal.fire({
        icon: "success",
        title: "Configuración guardada",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (requestError) {
      console.error("Error saving filter configuration:", requestError);
      setError("No se pudo guardar la configuración");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la configuración",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!token || !isAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-white/50">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <Link
              to="/adm/dashboard"
              className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Volver al dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Filtros de la PLP
              </h1>
              <p className="text-white/50 mt-1">
                Activá y ordená los grupos visibles en productos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden">
          {filters.map((filter, index) => (
            <div
              key={filter.key}
              className="flex items-center justify-between gap-4 border-b border-white/5 p-5 last:border-b-0"
            >
              <div>
                <h2 className="font-semibold text-white">{filter.label}</h2>
                <p className="text-sm text-white/50">
                  {filter.isActive ? "Visible en la PLP" : "Oculto en la PLP"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleFilter(filter.key)}
                  className={`flex h-9 w-16 items-center rounded-full p-1 transition-colors ${filter.isActive ? "bg-yellow-500 justify-end" : "bg-white/15 justify-start"}`}
                  aria-label={`${filter.isActive ? "Desactivar" : "Activar"} ${filter.label}`}
                  aria-pressed={filter.isActive}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900">
                    {filter.isActive && <Check className="h-4 w-4" />}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => moveFilter(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-25"
                  aria-label={`Subir ${filter.label}`}
                >
                  <ChevronUp className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFilter(index, 1)}
                  disabled={index === filters.length - 1}
                  className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-25"
                  aria-label={`Bajar ${filter.label}`}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={saveConfig}
          disabled={saving || filters.length === 0}
          className="mt-6 w-full rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}

export default FilterConfig;

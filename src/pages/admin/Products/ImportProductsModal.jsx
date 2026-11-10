import { useState } from "react";
import Swal from "sweetalert2";
import api from "../../../lib/api";

const CONFIRM_WORD = "REEMPLAZAR";

const MODES = [
  {
    value: "upsert",
    title: "Agregar y actualizar",
    description:
      "Suma los productos nuevos y actualiza los que ya existen (mismo nombre, capacidad y marca).",
  },
  {
    value: "replace",
    title: "Reemplazar catálogo completo",
    description: "Borra TODOS los productos y carga solo los de la planilla.",
  },
];

// Downloads a blob response as a file, the same way the export does
const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

/**
 * Spreadsheet import: pick a file and a mode, upload, and either see the
 * counts or the list of rows to fix. The import is all or nothing, so a
 * rejected file changed nothing.
 */
function ImportProductsModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("upsert");
  const [confirmText, setConfirmText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // { message, details: [{ row, column, message }] } from a rejected upload
  const [rejection, setRejection] = useState(null);

  const isReplace = mode === "replace";
  const confirmed = !isReplace || confirmText.trim() === CONFIRM_WORD;

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setRejection(null);
  };

  const handleModeChange = (value) => {
    setMode(value);
    setConfirmText("");
    setRejection(null);
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await api.get(`/api/productos/template`, { responseType: "blob" });
      saveBlob(response.data, "plantilla-productos.xlsx");
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo descargar la plantilla" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "Seleccionar archivo",
        text: "Elegí una planilla .xlsx, .xls o .csv",
      });
      return;
    }
    if (!confirmed) return;

    setIsUploading(true);
    setRejection(null);
    const formData = new FormData();
    formData.append("mode", mode);
    formData.append("file", file);

    try {
      const response = await api.post(`/api/productos/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const result = response.data?.data || {};
      const text = isReplace
        ? `Se eliminaron ${result.eliminados ?? 0} productos y se cargaron ${result.nuevos ?? 0}.`
        : `${result.nuevos ?? 0} productos nuevos, ${result.actualizados ?? 0} actualizados.`;
      onImported();
      onClose();
      Swal.fire({
        icon: "success",
        title: isReplace ? "¡Catálogo reemplazado!" : "¡Importación exitosa!",
        text,
      });
    } catch (err) {
      const error = err.response?.data?.error;
      setRejection({
        message: error?.message || "No se pudo subir la planilla. Probá de nuevo en un rato.",
        details: Array.isArray(error?.details) ? error.details : [],
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Importar productos desde una planilla</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-800/40 border border-white/5 p-4">
          <p className="text-white/60 text-sm">
            Usá la plantilla para no errarle a las columnas. Formatos: .xlsx, .xls o .csv.
          </p>
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {isDownloading ? "Descargando..." : "Descargar plantilla"}
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-white/70 text-sm mb-2" htmlFor="import-file">
            Planilla
          </label>
          <input
            id="import-file"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="w-full px-4 py-3 bg-gray-800/50 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
          />
        </div>

        <fieldset className="mb-5">
          <legend className="block text-white/70 text-sm mb-2">¿Qué querés hacer?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {MODES.map((option) => {
              const selected = mode === option.value;
              const danger = option.value === "replace";
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    selected
                      ? danger
                        ? "border-red-500/60 bg-red-500/10"
                        : "border-yellow-500/60 bg-yellow-500/10"
                      : "border-white/10 bg-gray-800/30 hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    value={option.value}
                    checked={selected}
                    onChange={() => handleModeChange(option.value)}
                    className="sr-only"
                  />
                  <span className={`block font-medium ${danger ? "text-red-300" : "text-white"}`}>
                    {option.title}
                  </span>
                  <span className="block text-white/50 text-sm mt-1">{option.description}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {isReplace && (
          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <p className="text-red-200 text-sm mb-3">
              Se van a borrar <strong>todos</strong> los productos actuales y quedarán solo los de la
              planilla. Si la planilla tiene algún error, no se borra nada. Los pedidos ya hechos no
              se modifican.
            </p>
            <label className="block text-white/70 text-sm mb-2" htmlFor="import-confirm">
              Escribí <strong className="text-white">{CONFIRM_WORD}</strong> para confirmar
            </label>
            <input
              id="import-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
              className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white"
            />
          </div>
        )}

        {rejection && (
          <div role="alert" className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
            <p className="text-red-200 font-medium">{rejection.message}</p>
            {rejection.details.length > 0 && (
              <>
                <p className="text-white/60 text-sm mt-1 mb-3">
                  Corregí {rejection.details.length === 1 ? "este problema" : `estos ${rejection.details.length} problemas`} en la planilla y volvé a subirla.
                </p>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-white/10">
                  <table className="w-full text-sm text-left">
                    <thead className="sticky top-0 bg-gray-800 text-white/70">
                      <tr>
                        <th className="px-3 py-2 font-medium">Fila</th>
                        <th className="px-3 py-2 font-medium">Columna</th>
                        <th className="px-3 py-2 font-medium">Problema</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white/80">
                      {rejection.details.map((detail, index) => (
                        <tr key={`${detail.row}-${detail.column}-${index}`}>
                          <td className="px-3 py-2 whitespace-nowrap">{detail.row ?? "-"}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{detail.column ?? "-"}</td>
                          <td className="px-3 py-2">{detail.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || !confirmed}
            className={`flex-1 py-3 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              isReplace
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
            }`}
          >
            {isUploading ? (
              <>
                <Spinner />
                Subiendo...
              </>
            ) : isReplace ? (
              "Reemplazar catálogo"
            ) : (
              "Subir planilla"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportProductsModal;

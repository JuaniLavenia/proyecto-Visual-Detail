export const ROLES = [
  { value: "minorista", label: "Minorista", color: "bg-blue-500" },
  { value: "mayorista", label: "Mayorista", color: "bg-green-500" },
  { value: "admin", label: "Administrador", color: "bg-yellow-500" },
];

export const getRoleLabel = (role) =>
  ROLES.find((r) => r.value === role)?.label || role;

export const SELF_ACTION_HINT =
  "No podés cambiar tu propio rol, desactivar ni eliminar tu cuenta.";

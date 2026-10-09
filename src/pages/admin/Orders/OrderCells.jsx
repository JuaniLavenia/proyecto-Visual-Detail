import PropTypes from "prop-types";
import { Clock, Check, Close, WhatsApp } from "../../../components/common/Icons";
import { ORDER_STATUSES } from "../../../lib/orders-api";
import { formatPrice } from "../../../lib/pricing";
import { getOrderPhone, getWhatsAppUrl } from "./order-format";

const STATUS_BADGES = {
  Pendiente: {
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Icon: Clock,
  },
  Completado: {
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    Icon: Check,
  },
  Cancelado: {
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    Icon: Close,
  },
};

// Legacy lines and orders lack `producto`, `precio` and `total`; the oldest
// lines only have `nombre` (no `cantidad`).
const productLineShape = PropTypes.shape({
  producto: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  nombre: PropTypes.string,
  cantidad: PropTypes.number,
  precio: PropTypes.number,
});

const orderShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  numeroPedido: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  estado: PropTypes.string,
  telefono: PropTypes.string,
  productos: PropTypes.arrayOf(productLineShape),
  total: PropTypes.number,
  usuario: PropTypes.shape({
    email: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
    phone: PropTypes.string,
  }),
});

export function OrderStatusBadge({ estado }) {
  const { className, Icon } = STATUS_BADGES[estado] || STATUS_BADGES.Pendiente;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}
    >
      <Icon className="w-4 h-4" />
      {estado || "Pendiente"}
    </span>
  );
}

OrderStatusBadge.propTypes = { estado: PropTypes.string };

export function OrderCustomer({ order }) {
  const user = order.usuario;
  if (!user) return <span className="text-white/40">—</span>;
  return (
    <div className="flex flex-col min-w-0">
      {user.name && (
        <span className="text-white font-medium truncate max-w-xs">
          {user.name}
        </span>
      )}
      <span
        className={`truncate max-w-xs ${
          user.name ? "text-white/50 text-sm" : "text-white font-medium"
        }`}
      >
        {user.email || "—"}
      </span>
    </div>
  );
}

OrderCustomer.propTypes = { order: orderShape.isRequired };

export function OrderPhoneLink({ order }) {
  const phone = getOrderPhone(order);
  const url = getWhatsAppUrl(phone);
  if (!phone) return <span className="text-white/40">—</span>;
  // Not normalizable: show the stored value without a WhatsApp link
  if (!url) {
    return (
      <span className="text-white/70 text-sm whitespace-nowrap">{phone}</span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir chat de WhatsApp"
      className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm whitespace-nowrap"
    >
      <WhatsApp className="w-4 h-4" />
      {phone}
    </a>
  );
}

OrderPhoneLink.propTypes = { order: orderShape.isRequired };

export function OrderStatusSelect({
  order,
  disabled = false,
  onChange,
  className = "",
}) {
  return (
    <select
      value={order.estado || "Pendiente"}
      onChange={(e) => onChange(order, e.target.value)}
      disabled={disabled}
      aria-label={`Cambiar estado del pedido ${order.numeroPedido ?? ""}`.trim()}
      className={`bg-gray-800 text-white px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-yellow-500 disabled:opacity-50 text-sm ${className}`}
    >
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

OrderStatusSelect.propTypes = {
  order: orderShape.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// Unit price per line; legacy orders have no `precio` (or `cantidad`) and
// show "—" in its place.
export function OrderProducts({ productos, compact }) {
  return (
    <div className={compact ? "max-w-xs" : undefined}>
      {productos?.map((prod, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between gap-3 text-white/70 text-sm"
        >
          <span className={`min-w-0 ${compact ? "truncate" : "break-words"}`}>
            {Number.isFinite(prod.cantidad) ? `${prod.cantidad}x` : "— x"}{" "}
            {prod.nombre || "Producto"}
          </span>
          <span className="flex-shrink-0 text-white/50 whitespace-nowrap">
            {formatPrice(prod.precio)}
            {typeof prod.precio === "number" && " c/u"}
          </span>
        </div>
      ))}
    </div>
  );
}

OrderProducts.propTypes = {
  productos: PropTypes.arrayOf(productLineShape),
  compact: PropTypes.bool,
};

export function OrderTotal({ total }) {
  const missing = typeof total !== "number";
  return (
    <span
      className={`text-sm whitespace-nowrap ${
        missing ? "text-white/40" : "text-white font-semibold"
      }`}
    >
      {formatPrice(total)}
    </span>
  );
}

OrderTotal.propTypes = { total: PropTypes.number };

export { orderShape };

import PropTypes from "prop-types";
import {
  OrderCustomer,
  OrderPhoneLink,
  OrderProducts,
  OrderStatusBadge,
  OrderStatusSelect,
  orderShape,
} from "./OrderCells";
import { formatOrderDate } from "./order-format";

const TH_CLASS =
  "px-4 py-3.5 text-left text-xs font-semibold text-white/50 uppercase tracking-wider";

/**
 * Desktop table + mobile cards for one page of orders.
 */
function OrdersList({ orders, busyId, onStatusChange }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden lg:block bg-gray-900/30 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/40 border-b border-white/5">
              <tr>
                <th className={TH_CLASS}>#</th>
                <th className={TH_CLASS}>Cliente</th>
                <th className={TH_CLASS}>Teléfono</th>
                <th className={TH_CLASS}>Productos</th>
                <th className={TH_CLASS}>Estado</th>
                <th className={TH_CLASS}>Cambiar estado</th>
                <th className={TH_CLASS}>Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="px-4 py-3.5">
                    <span className="text-white/50 text-sm">
                      {order.numeroPedido ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderCustomer order={order} />
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderPhoneLink order={order} />
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderProducts productos={order.productos} compact />
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderStatusBadge estado={order.estado} />
                  </td>
                  <td className="px-4 py-3.5">
                    <OrderStatusSelect
                      order={order}
                      disabled={busyId === order._id}
                      onChange={onStatusChange}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-white/50 text-sm whitespace-nowrap">
                      {formatOrderDate(order.fecha || order.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden grid gap-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-gray-900/50 border border-white/5 rounded-xl p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-white font-medium">
                  Pedido #{order.numeroPedido ?? "—"}
                </p>
                <p className="text-white/40 text-xs">
                  {formatOrderDate(order.fecha || order.createdAt)}
                </p>
              </div>
              <OrderStatusBadge estado={order.estado} />
            </div>

            <div className="mb-3">
              <p className="text-white/50 text-xs mb-1">Cliente</p>
              <OrderCustomer order={order} />
            </div>

            <div className="mb-3">
              <p className="text-white/50 text-xs mb-1">Teléfono</p>
              <OrderPhoneLink order={order} />
            </div>

            <div className="mb-3">
              <p className="text-white/50 text-xs mb-1">Productos</p>
              <OrderProducts productos={order.productos} />
            </div>

            <div>
              <p className="text-white/50 text-xs mb-1">Cambiar estado</p>
              <OrderStatusSelect
                order={order}
                disabled={busyId === order._id}
                onChange={onStatusChange}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

OrdersList.propTypes = {
  orders: PropTypes.arrayOf(orderShape).isRequired,
  busyId: PropTypes.string,
  onStatusChange: PropTypes.func.isRequired,
};

export default OrdersList;

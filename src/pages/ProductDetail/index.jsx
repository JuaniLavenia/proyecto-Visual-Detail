import { useCallback, useId, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Modal from "../../components/common/Modal";
import ProductDetailContent from "../../components/shared/ProductDetailContent";

/**
 * Product detail shown as a modal over the page it was opened from.
 * Opened from a product card (with `backgroundLocation` state), closing goes
 * back in history so that page is restored as it was. Opened from a direct
 * link, closing replaces the URL with the plain catalog.
 */
function ProductModalRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const titleId = useId();
  const isClosing = useRef(false);
  const hasBackground = Boolean(location.state?.backgroundLocation);

  const close = useCallback(() => {
    // Esc + click in quick succession must not go back twice
    if (isClosing.current) return;
    isClosing.current = true;

    if (hasBackground) {
      navigate(-1);
    } else {
      navigate("/productos", { replace: true });
    }
  }, [hasBackground, navigate]);

  return (
    <Modal onClose={close} labelledBy={titleId}>
      <ProductDetailContent
        key={id}
        productId={id}
        titleId={titleId}
        onBackToCatalog={close}
      />
    </Modal>
  );
}

export default ProductModalRoute;

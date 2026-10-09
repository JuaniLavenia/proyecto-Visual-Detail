import { useId } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductDetailContent from "../../components/shared/ProductDetailContent";
import { ArrowLeft } from "../../components/common/Icons";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleId = useId();
  const backToCatalog = () => navigate("/productos");

  return (
    <div className="min-h-screen bg-gray-950 pt-20 lg:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={backToCatalog}
          className="inline-flex items-center gap-2 text-white/60 hover:text-yellow-400 mb-6 transition-colors"
        >
          <ArrowLeft />
          Volver a productos
        </button>

        <div className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden">
          <ProductDetailContent
            key={id}
            productId={id}
            titleId={titleId}
            onBackToCatalog={backToCatalog}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

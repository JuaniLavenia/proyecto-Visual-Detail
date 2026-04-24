import "./index.css";

function ProductDetail({ name, image, description, muted }) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="bg-gray-700">
          <img
            src={image}
            className="w-full h-full object-cover"
            alt={name}
          />
        </div>
        <div className="p-4 md:col-span-8">
          <h5 className="text-lg font-bold uppercase text-white">{name}</h5>
          <p className="text-white/70">{description}</p>
          <p className="text-white/50 text-sm">{muted}</p>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

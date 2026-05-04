import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertCircle, 
  ChevronRight,
  Archive
} from 'lucide-react';
import { AddProductModal } from './AddProductModal';
import { EditProductModal } from './EditProductModal';

interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock: number;
}

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) console.error('Error al traer productos:', error);
    else setProducts(data || []);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm);
      
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      const matchesStock = stockFilter === 'all' || product.stock < 5;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic">
            <Package className="text-market-green" /> Inventario
          </h1>
          <p className="text-gray-500 font-medium italic">Gestión de productos y existencias</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-market-green hover:bg-market-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-market-green/10 transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nombre o código..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-market-green outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-market-green outline-none appearance-none cursor-pointer font-medium"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-2xl">
          <button 
            onClick={() => setStockFilter('all')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${stockFilter === 'all' ? 'bg-white shadow-sm text-market-green' : 'text-gray-400'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setStockFilter('low')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${stockFilter === 'low' ? 'bg-white shadow-sm text-market-orange' : 'text-gray-400'}`}
          >
            <AlertCircle size={14} /> Stock Bajo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <th className="p-5">Producto</th>
                <th className="p-5">Categoría</th>
                <th className="p-5 text-right">Precio Venta</th>
                <th className="p-5 text-center">Existencias</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-market-green/5 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-gray-800 group-hover:text-market-green transition-colors">{product.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{product.barcode}</div>
                  </td>
                  <td className="p-5">
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold italic">
                      {product.category || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-gray-700">
                    Q{product.selling_price.toFixed(2)}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-market-orange animate-pulse' : 'bg-market-green'}`}></div>
                      <span className={`font-bold ${product.stock < 5 ? 'text-market-orange' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="text-gray-300 hover:text-market-green transition-colors p-2 hover:bg-market-green/10 rounded-lg"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Archive size={48} className="text-gray-100" />
            <p className="text-gray-400 font-medium italic">No se encontraron productos.</p>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProducts} 
      />

      <EditProductModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </div>
  );
};
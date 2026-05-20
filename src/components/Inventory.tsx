import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  AlertCircle, 
  ChevronRight,
  Archive,
  PowerOff
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
  is_active: boolean; // NUEVO: Control de borrado lógico
}

export const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active'); // NUEVO FILTRO
  
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
      
      // NUEVO: Filtramos por si está activo o descontinuado
      const matchesStatus = statusFilter === 'active' ? product.is_active !== false : product.is_active === false;

      return matchesSearch && matchesCategory && matchesStock && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, stockFilter, statusFilter]);

  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      
      {/* ENCABEZADO PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tighter">
            <Package className="text-green-700" size={36} /> Inventario
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Gestión de existencias y control de productos</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-700 hover:bg-green-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-green-700/20 transition-all active:scale-95"
        >
          <Plus size={22} /> Nuevo Producto
        </button>
      </div>

      {/* TABS DE ESTADO (Activos / Descontinuados) */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setStatusFilter('active')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-sm transition-all border-b-4 ${
            statusFilter === 'active' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Catálogo Activo
        </button>
        <button 
          onClick={() => setStatusFilter('inactive')}
          className={`pb-4 px-2 font-black uppercase tracking-widest text-sm transition-all border-b-4 flex items-center gap-2 ${
            statusFilter === 'inactive' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <PowerOff size={16} /> Descontinuados
        </button>
      </div>

      {/* BARRA DE HERRAMIENTAS: Buscador y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100">
        
        {/* Buscador */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Buscar por nombre o código..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-700 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selector de Categoría */}
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-700 transition-colors" size={20} />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-green-700 focus:bg-white rounded-2xl outline-none appearance-none cursor-pointer font-bold text-gray-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Filtro de Stock (Tipo Switch) */}
        <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-gray-100">
          <button 
            onClick={() => setStockFilter('all')}
            className={`flex-1 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
              stockFilter === 'all' 
              ? 'bg-white shadow-md text-green-700' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Todos
          </button>
          <button 
            onClick={() => setStockFilter('low')}
            className={`flex-1 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              stockFilter === 'low' 
              ? 'bg-white shadow-md text-orange-500' 
              : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <AlertCircle size={14} /> Stock Bajo
          </button>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
                <th className="p-6">Producto</th>
                <th className="p-6 text-center">Categoría</th>
                <th className="p-6 text-right">Precio Venta</th>
                <th className="p-6 text-center">Existencias</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-green-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-black text-gray-800 group-hover:text-green-700 transition-colors uppercase italic tracking-tight flex items-center gap-2">
                      {product.name}
                      {product.is_active === false && (
                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-md text-[8px] tracking-widest">DESCONTINUADO</span>
                      )}
                    </div>
                    <div className="text-[10px] text-orange-500 font-mono font-bold tracking-widest mt-0.5">
                      {product.barcode}
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {product.category || 'Otros'}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <span className={`font-black text-lg ${product.is_active === false ? 'text-gray-400' : 'text-green-700'}`}>
                      Q{product.selling_price.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          product.stock < 5 ? 'bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-green-500'
                        }`}></div>
                        <span className={`text-lg font-black tracking-tighter ${
                          product.stock < 5 ? 'text-orange-600' : 'text-gray-800'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                      <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">unidades</p>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => handleEditClick(product)}
                      className="p-3 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-green-700 group-hover:text-white group-hover:shadow-lg group-hover:shadow-green-900/20 transition-all active:scale-90"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* ESTADO VACÍO */}
        {filteredProducts.length === 0 && (
          <div className="p-24 text-center flex flex-col items-center gap-6 bg-gray-50/50">
            <div className="bg-white p-8 rounded-full shadow-inner border border-gray-100">
              <Archive size={60} className="text-gray-200" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-400 italic">No se encontraron productos</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Intenta con otros términos de búsqueda</p>
            </div>
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
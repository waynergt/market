import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Loader2, Trash2, Tag, Barcode } from 'lucide-react';

interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export const EditProductModal = ({ isOpen, onClose, onSuccess, product }: Props) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    cost_price: '',
    selling_price: '',
    stock: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category || '',
        cost_price: product.cost_price.toString(),
        selling_price: product.selling_price.toString(),
        stock: product.stock.toString()
      });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('products')
      .update({
        name: formData.name,
        category: formData.category,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock: parseInt(formData.stock),
      })
      .eq('id', product.id);

    setLoading(false);
    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id);

    setLoading(false);
    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Contenedor Principal */}
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
        
        {/* Encabezado con degradado pro */}
        <div className="p-8 border-b flex justify-between items-center bg-gradient-to-r from-green-700 to-green-900 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Tag size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">Editar Producto</h2>
              <div className="flex items-center gap-1 mt-1 text-orange-400 font-mono text-xs font-bold">
                <Barcode size={12} />
                <span>{product.barcode}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Nombre del Producto */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input 
                required 
                className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            {/* Precio Costo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Costo (Q)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-600" 
                value={formData.cost_price} 
                onChange={(e) => setFormData({...formData, cost_price: e.target.value})} 
              />
            </div>

            {/* Precio Venta */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">Precio Venta (Q)</label>
              <input 
                type="number" 
                step="0.01" 
                required 
                className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-black text-green-700" 
                value={formData.selling_price} 
                onChange={(e) => setFormData({...formData, selling_price: e.target.value})} 
              />
            </div>

            {/* Existencias */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Existencias en Stock</label>
              <input 
                type="number" 
                required 
                className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700" 
                value={formData.stock} 
                onChange={(e) => setFormData({...formData, stock: e.target.value})} 
              />
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
              <div className="relative">
                <select 
                  className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Bebidas">Bebidas</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Comida">Comida</option>
                  <option value="Limpieza">Limpieza</option>
                  <option value="Otros">Otros</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                   <Tag size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Botonera de Acciones */}
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-50 text-red-600 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95 shadow-sm uppercase text-[10px] tracking-widest"
            >
              <Trash2 size={18} /> Eliminar
            </button>
            <button 
              disabled={loading}
              className="flex-[2] bg-green-700 hover:bg-green-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-700/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Actualizar Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
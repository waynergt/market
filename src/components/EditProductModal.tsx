import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Save, Loader2, Trash2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-market-dark text-white">
          <div>
            <h2 className="text-xl font-bold italic">Editar Producto</h2>
            <p className="text-xs text-market-orange font-mono font-bold tracking-wider">{product.barcode}</p>
          </div>
          <button onClick={onClose} className="hover:bg-market-green p-2 rounded-full transition-colors"><X /></button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
              <input required className="w-full border-gray-100 border-2 p-3 rounded-2xl mt-1 focus:border-market-green outline-none transition-all bg-gray-50/50 font-medium" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Costo (Q)</label>
              <input type="number" step="0.01" required className="w-full border-gray-100 border-2 p-3 rounded-2xl mt-1 focus:border-market-green outline-none bg-gray-50/50 font-medium" 
                value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Venta (Q)</label>
              <input type="number" step="0.01" required className="w-full border-gray-100 border-2 p-3 rounded-2xl mt-1 focus:border-market-green outline-none bg-gray-50/50 font-medium" 
                value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Existencias</label>
              <input type="number" required className="w-full border-gray-100 border-2 p-3 rounded-2xl mt-1 focus:border-market-green outline-none bg-gray-50/50 font-medium" 
                value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
              <select className="w-full border-gray-100 border-2 p-3 rounded-2xl mt-1 focus:border-market-green outline-none appearance-none bg-gray-50/50 font-medium cursor-pointer" 
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
                <option value="Comida">Comida</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-50 text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all shadow-sm"
            >
              <Trash2 size={20} /> Eliminar
            </button>
            <button 
              disabled={loading}
              className="flex-[2] bg-market-green hover:bg-market-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-market-green/10 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Actualizar Datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Barcode, Save, Loader2 } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';
import { alertError, toast } from '../lib/alerts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddProductModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    category: '',
    cost_price: '',
    selling_price: '',
    stock: ''
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setShowScanner(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const initialStock = parseInt(formData.stock) || 0;

    // 1. Insertar el producto
    const { data: newProduct, error } = await supabase.from('products').insert([
      {
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock: initialStock,
      }
    ]).select().single(); // Necesitamos el ID que acaba de crear

    if (error) {
      setLoading(false);
      alertError("Error al guardar", error.message);
      return;
    }

    // 2. Si hay stock inicial, lo registramos en el Kardex
    if (initialStock > 0 && newProduct) {
      await supabase.from('inventory_logs').insert({
        product_id: newProduct.id,
        change_amount: initialStock,
        reason: 'Inventario Inicial (Nuevo Producto)',
        previous_stock: 0,
        new_stock: initialStock
      });
    }

    setLoading(false);
    toast("Producto creado con éxito", "success");
    onSuccess();
    handleClose();
    setFormData({ barcode: '', name: '', category: '', cost_price: '', selling_price: '', stock: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-100">
        
        {/* Encabezado en Verde Principal */}
        <div className="p-6 border-b flex justify-between items-center bg-green-700 text-white">
          <h2 className="text-xl font-black italic uppercase tracking-tight">Nuevo Producto</h2>
          <button onClick={handleClose} className="hover:bg-green-900 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Barcode size={14}/> Código de Barras
            </label>
            <div className="flex gap-2">
              <input 
                required
                className="flex-1 border-2 border-transparent bg-gray-50 p-3 rounded-2xl focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium"
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                placeholder="Escanea o escribe el código"
              />
              <button 
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className={`px-6 rounded-2xl flex items-center gap-2 transition-all font-bold active:scale-95 ${
                    showScanner 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {showScanner ? 'Cerrar' : 'Cámara'}
              </button>
            </div>
            
            {showScanner && (
              <div className="mt-2 rounded-2xl overflow-hidden border-2 border-green-700">
                <BarcodeScanner onScan={(code) => {
                  setFormData({...formData, barcode: code});
                  setShowScanner(false);
                }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
              <input required className="w-full border-2 border-transparent bg-gray-50 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Costo (Q)</label>
              <input type="number" step="0.01" required className="w-full border-2 border-transparent bg-gray-50 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium" 
                value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Precio Venta (Q)</label>
              <input type="number" step="0.01" required className="w-full border-2 border-transparent bg-gray-50 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium text-green-700 font-bold" 
                value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Stock Inicial</label>
              <input type="number" required className="w-full border-2 border-transparent bg-gray-50 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium" 
                value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categoría</label>
              <select className="w-full border-2 border-transparent bg-gray-50 p-3 rounded-2xl mt-1 focus:ring-2 focus:ring-green-700 focus:bg-white outline-none transition-all font-medium cursor-pointer appearance-none" 
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
                <option value="Comida">Comida</option>
                <option value="Limpieza">Limpieza</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-900 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 flex items-center justify-center gap-2 transition-all mt-4 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Guardar Producto
          </button>
        </form>
      </div>
    </div>
  );
};
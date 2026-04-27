import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Barcode, Save, Loader2 } from 'lucide-react';
import { BarcodeScanner } from './BarcodeScanner';

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

  // --- FUNCIÓN DE CIERRE SEGURO ---
  const handleClose = () => {
    setShowScanner(false); // Primero apagamos el componente del scanner
    onClose(); // Luego cerramos el modal
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('products').insert([
      {
        barcode: formData.barcode,
        name: formData.name,
        category: formData.category,
        cost_price: parseFloat(formData.cost_price),
        selling_price: parseFloat(formData.selling_price),
        stock: parseInt(formData.stock),
      }
    ]);

    setLoading(false);
    if (error) {
      alert("Error al guardar: " + error.message);
    } else {
      onSuccess();
      handleClose(); // Usamos handleClose para limpiar todo al terminar
      setFormData({ barcode: '', name: '', category: '', cost_price: '', selling_price: '', stock: '' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
          <h2 className="text-xl font-bold">Nuevo Producto</h2>
          {/* Botón de cerrar actualizado con handleClose */}
          <button onClick={handleClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Barcode size={16}/> Código de Barras
            </label>
            <div className="flex gap-2">
              <input 
                required
                className="flex-1 border p-2 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                placeholder="Escanea o escribe el código"
              />
              <button 
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className={`px-4 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                    showScanner 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {showScanner ? 'Cerrar Cámara' : 'Cámara'}
              </button>
            </div>
            
            {showScanner && (
              <div className="mt-2">
                <BarcodeScanner onScan={(code) => {
                  setFormData({...formData, barcode: code});
                  setShowScanner(false); // Se apaga automáticamente al detectar
                }} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Nombre del Producto</label>
              <input required className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-700">Precio Costo (Q)</label>
              <input type="number" step="0.01" required className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Precio Venta (Q)</label>
              <input type="number" step="0.01" required className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.selling_price} onChange={(e) => setFormData({...formData, selling_price: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Stock Inicial</label>
              <input type="number" required className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Categoría</label>
              <select className="w-full border p-2 rounded-lg mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Snacks">Snacks</option>
                <option value="Comida">Comida</option>
              </select>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all mt-4 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Guardar Producto
          </button>
        </form>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { 
  ClipboardList, 
  Trash2, 
  Save, 
  ShoppingBag, 
  AlertCircle, 
  Truck, 
  FileText 
} from 'lucide-react';

interface PendingItem {
  product_id: string;
  name: string;
  barcode: string;
  quantity: number;
  cost_price: number;
}

export const ReceiveGoods = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<PendingItem[]>([]);

  const handleScan = async (code: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, barcode, cost_price')
      .eq('barcode', code)
      .single();

    if (error || !data) {
      alert("Producto no encontrado. Regístralo primero en el inventario.");
      setShowScanner(false);
      return;
    }

    const newItem: PendingItem = {
      product_id: data.id,
      name: data.name,
      barcode: data.barcode,
      quantity: 1,
      cost_price: data.cost_price || 0
    };

    setItems([...items, newItem]);
    setShowScanner(false);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSaveInvoice = async () => {
    if (!supplier || items.length === 0) {
      alert("Faltan datos del proveedor o productos en la lista");
      return;
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.cost_price), 0);
    
    const { data: purchase, error: pError } = await supabase
      .from('purchases')
      .insert([{ supplier_name: supplier, invoice_number: invoiceNumber, total_cost: total }])
      .select()
      .single();

    if (pError) return alert("Error al guardar la factura principal");

    const detailItems = items.map(item => ({
      purchase_id: purchase.id,
      product_id: item.product_id,
      quantity: item.quantity,
      cost_price_at_purchase: item.cost_price
    }));

    const { error: iError } = await supabase.from('purchase_items').insert(detailItems);

    if (iError) {
      alert("Error al guardar el detalle de los productos");
    } else {
      alert("¡Éxito! El inventario se actualizó automáticamente.");
      setItems([]);
      setSupplier('');
      setInvoiceNumber('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-4 italic uppercase tracking-tighter">
            <ClipboardList className="text-green-700" size={40} /> 
            Recepción <span className="text-green-700">Factura</span>
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Carga de mercadería y actualización de precios de costo</p>
        </div>
      </div>

      {/* Formulario de Proveedor con estilo moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="space-y-3 group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <Truck size={14} className="text-green-700" /> Proveedor / Empresa
          </label>
          <input 
            className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
            placeholder="Ej: Distribuidora El Sol"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div className="space-y-3 group">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <FileText size={14} className="text-orange-500" /> No. de Documento (Opcional)
          </label>
          <input 
            className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner"
            placeholder="Ej: FAC-99823"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
      </div>

      {/* Botón de Acción Principal */}
      <div className="flex justify-center">
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-green-700 hover:bg-green-900 text-white px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] flex items-center gap-4 shadow-2xl shadow-green-900/20 transition-all active:scale-95 group"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <ShoppingBag size={24} />
          </div>
          Escanear Producto Recibido
        </button>
      </div>

      {/* Modal Scanner Estilizado */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-green-700">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-xl">
                  <ShoppingBag size={20} className="text-green-700" />
                </div>
                <h3 className="text-xl font-black italic uppercase text-gray-800">Cámara Activa</h3>
             </div>
            <BarcodeScanner onScan={handleScan} />
            <button 
              onClick={() => setShowScanner(false)}
              className="w-full mt-6 text-gray-400 font-black uppercase tracking-widest py-4 hover:bg-gray-50 rounded-2xl transition-all text-xs"
            >
              Cerrar Cámara
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Productos con diseño de POS */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Producto Recibido</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Costo Factura</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Cantidad</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Subtotal</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-green-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-gray-800 uppercase italic group-hover:text-green-700 transition-colors">{item.name}</div>
                    <div className="text-[10px] text-orange-500 font-mono font-bold tracking-widest">{item.barcode}</div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-green-700 font-black text-sm italic">Q</span>
                      <input 
                        type="number"
                        className="w-28 border-2 border-transparent bg-gray-50 rounded-xl p-2.5 text-center focus:border-green-700 focus:bg-white outline-none font-black text-gray-700 shadow-inner"
                        value={item.cost_price}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].cost_price = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-6">
                    <input 
                      type="number"
                      className="w-20 border-2 border-transparent bg-gray-50 mx-auto block rounded-xl p-2.5 text-center focus:border-green-700 focus:bg-white outline-none font-black text-gray-700 shadow-inner"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                    />
                  </td>
                  <td className="p-6 text-right font-black text-gray-800 text-lg tracking-tighter">
                    Q{(item.quantity * item.cost_price).toFixed(2)}
                  </td>
                  <td className="p-6 text-center">
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-3 hover:bg-red-50 rounded-2xl active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center gap-6">
            <div className="bg-gray-50 p-10 rounded-full shadow-inner border border-gray-100">
              <AlertCircle size={60} className="text-gray-200" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-400 italic uppercase">Lista de carga vacía</p>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Usa el escáner para agregar productos de la factura</p>
            </div>
          </div>
        ) : (
          <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Costo Total de Factura</span>
              <div className="text-5xl font-black text-green-700 italic tracking-tighter">
                Q{items.reduce((acc, i) => acc + (i.quantity * i.cost_price), 0).toFixed(2)}
              </div>
            </div>
            <button 
              onClick={handleSaveInvoice}
              className="w-full md:w-auto bg-green-700 hover:bg-green-900 text-white px-14 py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-green-900/30 transition-all active:scale-95"
            >
              <Save size={24} /> Confirmar Ingreso a Inventario
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
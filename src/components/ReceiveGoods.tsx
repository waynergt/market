import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { ClipboardList, Trash2, Save, ShoppingBag, AlertCircle } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <ClipboardList className="text-market-green" size={32} /> 
            Recepción de Factura
          </h1>
          <p className="text-gray-500 font-medium">Carga de mercadería y actualización de precios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Proveedor</label>
          <input 
            className="w-full border-gray-100 border-2 p-3 rounded-2xl focus:border-market-green focus:ring-0 outline-none transition-all bg-gray-50/50"
            placeholder="Nombre de la empresa"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">No. de Factura (Opcional)</label>
          <input 
            className="w-full border-gray-100 border-2 p-3 rounded-2xl focus:border-market-green focus:ring-0 outline-none transition-all bg-gray-50/50"
            placeholder="Ej: FAC-1234"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-center py-2">
        <button 
          onClick={() => setShowScanner(true)}
          className="bg-market-green hover:bg-market-dark text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-market-green/20 transition-all active:scale-95"
        >
          <ShoppingBag size={24} /> Escanear Producto
        </button>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-5 rounded-3xl w-full max-w-md shadow-2xl">
            <BarcodeScanner onScan={handleScan} />
            <button 
              onClick={() => setShowScanner(false)}
              className="w-full mt-4 text-gray-500 font-bold py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar Escaneo
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Costo Unit.</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Cant.</th>
                <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-market-green/5 transition-colors">
                  <td className="p-5">
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.barcode}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-market-green font-bold text-sm">Q</span>
                      <input 
                        type="number"
                        className="w-24 border-gray-100 border-2 bg-gray-50 rounded-xl p-2 text-center focus:border-market-green focus:ring-0 outline-none font-bold text-gray-700"
                        value={item.cost_price}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].cost_price = parseFloat(e.target.value) || 0;
                          setItems(newItems);
                        }}
                      />
                    </div>
                  </td>
                  <td className="p-5">
                    <input 
                      type="number"
                      className="w-20 border-gray-100 border-2 bg-gray-50 mx-auto block rounded-xl p-2 text-center focus:border-market-green focus:ring-0 outline-none font-bold text-gray-700"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                    />
                  </td>
                  <td className="p-5 text-right font-black text-gray-700">
                    Q{(item.quantity * item.cost_price).toFixed(2)}
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 ? (
          <div className="p-20 text-center text-gray-400 flex flex-col items-center gap-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <AlertCircle size={48} className="text-gray-200" />
            </div>
            <p className="font-medium italic">No has escaneado ningún producto todavía.</p>
          </div>
        ) : (
          <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-3xl font-black text-gray-800">
              Total: <span className="text-market-green">Q{items.reduce((acc, i) => acc + (i.quantity * i.cost_price), 0).toFixed(2)}</span>
            </div>
            <button 
              onClick={handleSaveInvoice}
              className="w-full md:w-auto bg-market-green hover:bg-market-dark text-white px-12 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-market-green/20 transition-all active:scale-95"
            >
              <Save size={24} /> Confirmar Ingreso
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
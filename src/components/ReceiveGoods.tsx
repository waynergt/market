import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { 
  ClipboardList, 
  Trash2, 
  Save,  
  AlertCircle, 
  Truck, 
  FileText,
  Keyboard,
  ScanLine,
  Smartphone,
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
  const [manualBarcode, setManualBarcode] = useState('');
  const [items, setItems] = useState<PendingItem[]>([]);

  // --- LÓGICA PARA LECTOR FÍSICO (DESKTOP) ---
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      if (document.activeElement?.tagName === 'INPUT') return;

      if (currentTime - lastKeyTime > 100) barcodeBuffer = '';
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          addProductByBarcode(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items]);

  const addProductByBarcode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    const { data, error } = await supabase
      .from('products')
      .select('id, name, barcode, cost_price')
      .eq('barcode', cleanCode)
      .single();

    if (error || !data) {
      alert("Producto no encontrado: " + cleanCode);
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
    setManualBarcode('');
    setShowScanner(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async () => {
    if (!supplier || items.length === 0) {
      alert("Faltan datos o productos");
      return;
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.cost_price), 0);
    const { data: purchase, error: pError } = await supabase
      .from('purchases')
      .insert([{ supplier_name: supplier, invoice_number: invoiceNumber, total_cost: total }])
      .select().single();

    if (pError) return alert("Error al guardar factura");

    const detailItems = items.map(item => ({
      purchase_id: purchase.id,
      product_id: item.product_id,
      quantity: item.quantity,
      cost_price_at_purchase: item.cost_price
    }));

    await supabase.from('purchase_items').insert(detailItems);
    alert("¡Inventario actualizado!");
    setItems([]); setSupplier(''); setInvoiceNumber('');
  };

  return (
    /* Aplicamos la animación EXACTA que te funciona en el Reporte */
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-4 italic uppercase tracking-tighter">
            <ClipboardList className="text-green-700" size={40} /> 
            Recepción <span className="text-green-700">Factura</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <ScanLine size={14} className="text-green-600 animate-pulse" />
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest italic">Lector listo</p>
          </div>
        </div>
      </div>

      {/* Proveedor y Factura */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <Truck size={14} className="text-green-700" /> Proveedor
          </label>
          <input className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700" placeholder="Distribuidora..." value={supplier} onChange={(e) => setSupplier(e.target.value)} />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
            <FileText size={14} className="text-orange-500" /> No. Documento
          </label>
          <input className="w-full border-2 border-transparent bg-gray-50 p-4 rounded-2xl focus:border-green-700 focus:bg-white outline-none transition-all font-bold text-gray-700" placeholder="Ej: FAC-001" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
      </div>

      {/* Herramientas de Carga */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="relative group">
          <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2 block ml-2">Ingreso Manual / Lector</label>
          <div className="relative">
            <input type="text" placeholder="Escanea o escribe..." value={manualBarcode} onChange={(e) => setManualBarcode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addProductByBarcode(manualBarcode)} className="w-full pl-12 pr-4 py-5 bg-white border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] outline-none font-bold text-gray-700 shadow-xl shadow-gray-200/40" />
            <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={24} />
          </div>
        </div>

        <button onClick={() => setShowScanner(true)} className="w-full bg-green-50 text-green-700 px-8 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 border-2 border-dashed border-green-200 hover:bg-green-700 hover:text-white transition-all group">
          <Smartphone size={20} className="group-hover:animate-bounce" />
          Usar Cámara Celular
        </button>
      </div>

      {/* Tabla y Resultados */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 font-black text-[10px] uppercase text-gray-400 tracking-[0.2em]">
              <tr>
                <th className="p-6">Producto</th>
                <th className="p-6 text-center">Costo Unit.</th>
                <th className="p-6 text-center">Cant.</th>
                <th className="p-6 text-right">Subtotal</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-green-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-gray-800 uppercase italic group-hover:text-green-700">{item.name}</div>
                    <div className="text-[10px] text-orange-500 font-mono font-bold">{item.barcode}</div>
                  </td>
                  <td className="p-6">
                    <input type="number" className="w-28 mx-auto border-2 border-transparent bg-gray-50 rounded-xl p-2.5 text-center focus:border-green-700 outline-none font-black text-gray-700" value={item.cost_price} onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].cost_price = parseFloat(e.target.value) || 0;
                        setItems(newItems);
                      }} />
                  </td>
                  <td className="p-6">
                    <input type="number" className="w-20 border-2 border-transparent bg-gray-50 mx-auto block rounded-xl p-2.5 text-center focus:border-green-700 outline-none font-black text-gray-700" value={item.quantity} onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantity = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }} />
                  </td>
                  <td className="p-6 text-right font-black text-gray-800 text-lg">Q{(item.quantity * item.cost_price).toFixed(2)}</td>
                  <td className="p-6 text-center">
                    <button onClick={() => removeItem(index)} className="text-gray-300 hover:text-red-500 p-3 rounded-2xl"><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center gap-6">
            <div className="bg-gray-50 p-10 rounded-full"><AlertCircle size={60} className="text-gray-200" /></div>
            <p className="text-xl font-black text-gray-400 italic uppercase">Esperando carga...</p>
          </div>
        ) : (
          <div className="p-10 bg-gray-50/50 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-5xl font-black text-green-700 italic tracking-tighter">
              Q{items.reduce((acc, i) => acc + (i.quantity * i.cost_price), 0).toFixed(2)}
            </div>
            <button onClick={handleSaveInvoice} className="bg-green-700 hover:bg-green-900 text-white px-14 py-5 rounded-[1.5rem] font-black uppercase text-xs flex items-center gap-4 shadow-2xl">
              <Save size={24} /> Confirmar Ingreso
            </button>
          </div>
        )}
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md border-4 border-green-700">
            <BarcodeScanner onScan={addProductByBarcode} />
            <button onClick={() => setShowScanner(false)} className="w-full mt-6 text-gray-400 font-black uppercase py-4">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};
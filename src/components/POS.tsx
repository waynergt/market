import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { Ticket } from './Ticket';
import { AddCustomerModal } from './AddCustomerModal';
import { 
  ShoppingCart, 
  Trash2, 
  Smartphone, 
  Receipt, 
  CreditCard, 
  Banknote,
  Loader2,
  Search,
  User,
  UserPlus,
  Tag,
  ScanLine,
  Keyboard,
  Plus,
  Minus
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
  stock: number; 
}

export const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>({ name: 'Consumidor Final', nit: 'C/F' });
  const [nitInput, setNitInput] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [lastSale, setLastSale] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

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
          handleScan(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const handlePrint = () => window.print();

  const buscarCliente = async () => {
    if (!nitInput.trim()) return;
    const { data } = await supabase.from('customers').select('*').eq('nit', nitInput).maybeSingle();
    if (data) {
      setSelectedCustomer(data);
      setNitInput('');
    } else {
      if (confirm("NIT no encontrado. ¿Desea registrarlo?")) setIsCustomerModalOpen(true);
    }
  };

  const handleScan = async (code: string) => {
    const cleanCode = code.trim();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, barcode, selling_price, stock')
      .eq('barcode', cleanCode)
      .single();

    if (error || !data) {
      alert("Producto no encontrado: " + cleanCode);
      return;
    }
    
    const inCart = cart.find(item => item.id === data.id);
    const currentQty = inCart ? inCart.quantity : 0;

    if (data.stock <= currentQty) {
      return alert(`¡Stock insuficiente! Solo quedan ${data.stock} unidades.`);
    }

    addItemToCart(data);
    setManualBarcode('');
  };

  const addItemToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.quantity + 1);
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        barcode: product.barcode, 
        price: product.selling_price, 
        quantity: 1,
        stock: product.stock
      }]);
    }
  };

  const updateQuantity = (id: string, newQty: number) => {
    // Permitimos 0 temporalmente para que el usuario pueda borrar el input
    if (newQty < 0) return; 

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (newQty > item.stock) {
          alert(`Límite alcanzado. Solo hay ${item.stock} en inventario.`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(item => item.id !== id));

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    setLoading(true);

    const { data: sale, error: sError } = await supabase
      .from('sales')
      .insert([{ total, payment_method: method, customer_id: selectedCustomer.id || null }])
      .select().single();

    if (sError) {
      setLoading(false);
      return alert("Error al procesar venta");
    }

    const saleDetails = cart.map(item => ({
      sale_id: sale.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price
    }));

    await supabase.from('sale_items').insert(saleDetails);
    
    setLastSale({ ...sale, customer: selectedCustomer });
    setTimeout(() => {
      if (confirm("Venta exitosa. ¿Imprimir ticket?")) handlePrint();
      setCart([]);
      setLastSale(null);
      setSelectedCustomer({ name: 'Consumidor Final', nit: 'C/F' });
    }, 500);
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tighter">
              <ShoppingCart className="text-green-700" size={32} /> Nueva Venta
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <ScanLine size={14} className="text-green-600 animate-pulse" />
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Lector listo</span>
            </div>
          </div>
          <button onClick={() => setShowScanner(true)} className="lg:hidden bg-green-700 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform">
            <Smartphone />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="p-6 text-left">Producto</th>
                <th className="p-6 text-center">Cant.</th>
                <th className="p-6 text-right">Precio</th>
                <th className="p-6 text-right">Subtotal</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cart.map((item) => (
                <tr key={item.id} className="hover:bg-green-50/30 transition-colors group text-sm">
                  <td className="p-6">
                    <div className="font-black text-gray-800 uppercase italic group-hover:text-green-700">{item.name}</div>
                    <div className="text-[10px] text-orange-500 font-mono font-bold tracking-widest">{item.barcode}</div>
                  </td>
                  
                  <td className="p-6 text-center font-black">
                    <div className="flex items-center justify-center gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-100 w-fit mx-auto shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-white hover:text-red-500 rounded-xl transition-all text-gray-400 active:scale-90"
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number" 
                        value={item.quantity === 0 ? '' : item.quantity} // Permite que se vea vacío al borrar
                        onChange={(e) => {
                          const val = e.target.value;
                          const num = parseInt(val);
                          updateQuantity(item.id, isNaN(num) ? 0 : num);
                        }}
                        onBlur={() => {
                          // Si el usuario deja vacío o pone 0, regresamos a 1 al salir del campo
                          if (item.quantity < 1) updateQuantity(item.id, 1);
                        }}
                        className="w-12 text-center bg-transparent font-black text-gray-800 outline-none"
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-white hover:text-green-700 rounded-xl transition-all text-gray-400 active:scale-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </td>

                  <td className="p-6 text-right font-bold text-gray-500 tracking-tighter italic">Q{item.price.toFixed(2)}</td>
                  <td className="p-6 text-right font-black text-green-700 text-lg tracking-tighter italic">Q{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="p-6 text-center">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-2 rounded-xl"><Trash2 size={20} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="bg-gray-50 p-10 rounded-full shadow-inner"><Tag size={60} className="text-gray-200" /></div>
              <p className="text-xl font-black text-gray-300 italic uppercase">Esperando productos...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-[400px] bg-white border-l border-gray-100 p-8 flex flex-col shadow-2xl relative z-10">
        <div className="mb-8 space-y-4">
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 relative group overflow-hidden">
            <User className="absolute right-[-10px] bottom-[-10px] text-gray-200/30" size={80} />
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Cliente</p>
              <p className="font-black text-gray-800 text-xl italic uppercase leading-none">{selectedCustomer.name}</p>
              <p className="text-orange-600 text-[10px] font-black mt-2">NIT: {selectedCustomer.nit}</p>
            </div>
            <button onClick={() => setIsCustomerModalOpen(true)} className="absolute top-6 right-6 text-gray-300 hover:text-green-700 transition-colors"><UserPlus size={22} /></button>
          </div>
          
          <div className="relative group">
            <input 
              type="text" 
              placeholder="NIT..." 
              value={nitInput} 
              onChange={(e) => setNitInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && buscarCliente()} 
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-green-700 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-inner" 
            />
            <button onClick={buscarCliente} className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-700 text-white p-2.5 rounded-xl shadow-lg active:scale-95 transition-all"><Search size={20} /></button>
          </div>

          <div className="relative pt-4 border-t border-gray-100 group">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-2">Ingreso Manual de Código</label>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Escribir código y Enter..." 
                  value={manualBarcode} 
                  onChange={(e) => setManualBarcode(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(manualBarcode)}
                  className="w-full pl-12 pr-4 py-4 bg-orange-50/50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none font-bold text-gray-700 transition-all" 
                />
                <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400 group-focus-within:rotate-12 transition-transform" size={20} />
             </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex justify-between text-gray-400 font-bold italic text-sm"><span>Base Imponible</span><span>Q{(total / 1.12).toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-400 font-bold italic text-sm"><span>Impuestos (IVA)</span><span>Q{(total - (total / 1.12)).toFixed(2)}</span></div>
            <div className="border-t border-dashed border-gray-200 pt-6 flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gran Total</span>
              <span className="text-6xl font-black text-green-700 tracking-tighter italic">Q{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={loading || cart.length === 0} 
              onClick={() => handleCheckout('Efectivo')} 
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-green-700 shadow-sm transition-all group disabled:opacity-50"
            >
              <div className="bg-green-50 p-4 rounded-2xl text-green-700 group-hover:bg-green-700 group-hover:text-white transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <Banknote size={28} />}
              </div>
              <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Efectivo</span>
            </button>
            <button 
              disabled={loading || cart.length === 0} 
              onClick={() => handleCheckout('Tarjeta')} 
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-orange-500 shadow-sm transition-all group disabled:opacity-50"
            >
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={28} />}
              </div>
              <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Tarjeta</span>
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md border-4 border-green-700 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black mb-6 text-gray-800 italic uppercase flex items-center gap-3"><Receipt className="text-green-700" /> Cámara Activa</h3>
            <div className="rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
              <BarcodeScanner onScan={handleScan} />
            </div>
            <button onClick={() => setShowScanner(false)} className="w-full mt-6 text-gray-400 font-black uppercase tracking-widest py-4 hover:bg-gray-50 rounded-2xl transition-all">Cancelar</button>
          </div>
        </div>
      )}

      <AddCustomerModal isOpen={isCustomerModalOpen} initialNit={nitInput} onClose={() => setIsCustomerModalOpen(false)} onSuccess={(c: any) => { setSelectedCustomer(c); setNitInput(''); }} />
      {lastSale && <Ticket ref={ticketRef} sale={lastSale} items={cart} />}
    </div>
  );
};
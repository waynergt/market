import { useState, useRef } from 'react';
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
  Tag
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  barcode: string;
  price: number;
  quantity: number;
}

export const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>({ name: 'Consumidor Final', nit: 'C/F' });
  const [nitInput, setNitInput] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [lastSale, setLastSale] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const buscarCliente = async () => {
    if (!nitInput.trim()) return;
    
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('nit', nitInput)
      .maybeSingle();

    if (error) console.error("Error buscando cliente:", error);

    if (data) {
      setSelectedCustomer(data);
      setNitInput('');
    } else {
      if (confirm("NIT no encontrado. ¿Desea registrar este nuevo cliente?")) {
        setIsCustomerModalOpen(true);
      } else {
        setSelectedCustomer({ name: 'Consumidor Final', nit: 'C/F' });
      }
    }
  };

  const handleScan = async (code: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, barcode, selling_price, stock')
      .eq('barcode', code)
      .single();

    if (error || !data) {
      alert("Producto no registrado");
      setShowScanner(false);
      return;
    }

    if (data.stock <= 0) {
      alert("¡Producto agotado!");
      setShowScanner(false);
      return;
    }

    addItemToCart(data);
    setShowScanner(false);
  };

  const addItemToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        barcode: product.barcode, 
        price: product.selling_price, 
        quantity: 1 
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    setLoading(true);

    const { data: sale, error: sError } = await supabase
      .from('sales')
      .insert([{ 
        total, 
        payment_method: method,
        customer_id: selectedCustomer.id || null 
      }])
      .select()
      .single();

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

    const { error: dError } = await supabase.from('sale_items').insert(saleDetails);

    if (dError) {
      alert("Error en detalles de venta");
    } else {
      const saleWithCustomer = { ...sale, customer: selectedCustomer };
      setLastSale(saleWithCustomer);
      
      setTimeout(() => {
        if (confirm("Venta realizada con éxito. ¿Desea imprimir el ticket?")) {
          handlePrint();
        }
        setCart([]);
        setLastSale(null);
        setSelectedCustomer({ name: 'Consumidor Final', nit: 'C/F' });
      }, 500);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      
      {/* LADO IZQUIERDO: CARRITO DE COMPRAS */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tighter">
            <ShoppingCart className="text-green-700" size={32} /> Nueva Venta
          </h1>
          <button 
            onClick={() => setShowScanner(true)}
            className="lg:hidden bg-green-700 text-white p-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            <Smartphone />
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
              <tr>
                <th className="p-6 text-left">Descripción del Producto</th>
                <th className="p-6 text-center">Cantidad</th>
                <th className="p-6 text-right">Precio Unit.</th>
                <th className="p-6 text-right">Subtotal</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cart.map((item) => (
                <tr key={item.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-gray-800 uppercase italic group-hover:text-green-700 transition-colors">{item.name}</div>
                    <div className="text-[10px] text-orange-500 font-mono font-bold tracking-widest">{item.barcode}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full font-black text-sm">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-6 text-right font-bold text-gray-500">Q{item.price.toFixed(2)}</td>
                  <td className="p-6 text-right">
                    <span className="font-black text-green-700 text-lg tracking-tighter">Q{(item.price * item.quantity).toFixed(2)}</span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="bg-gray-50 p-10 rounded-full shadow-inner">
                <Tag size={60} className="text-gray-200" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-300 italic uppercase">Esperando productos...</p>
                <p className="text-xs text-gray-300 font-bold uppercase tracking-widest mt-1">Escanea para iniciar la cuenta</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LADO DERECHO: CLIENTE Y PAGO */}
      <div className="w-full lg:w-[400px] bg-white border-l border-gray-100 p-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        
        {/* SECCIÓN CLIENTE */}
        <div className="mb-10 space-y-4">
          <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 relative group overflow-hidden">
            {/* Adorno de fondo */}
            <User className="absolute right-[-10px] bottom-[-10px] text-gray-200/30" size={80} />
            
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-700 rounded-full"></div> Cliente Seleccionado
              </p>
              <p className="font-black text-gray-800 text-xl italic uppercase leading-none">{selectedCustomer.name}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full border border-orange-200">
                  NIT: {selectedCustomer.nit}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setIsCustomerModalOpen(true)}
              className="absolute top-6 right-6 text-gray-300 hover:text-green-700 transition-colors"
              title="Registrar nuevo cliente"
            >
              <UserPlus size={22} />
            </button>
          </div>
          
          <div className="relative group">
            <input 
              type="text"
              placeholder="Ingresar NIT para buscar..."
              value={nitInput}
              onChange={(e) => setNitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-green-700 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700 shadow-inner"
            />
            <button 
              onClick={buscarCliente}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-700 text-white p-2.5 rounded-xl hover:bg-green-900 transition-all shadow-lg shadow-green-900/20 active:scale-90"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* BOTÓN ESCÁNER (Escritorio) */}
        <div className="hidden lg:block mb-10">
            <button 
                onClick={() => setShowScanner(true)}
                className="w-full bg-green-50 text-green-700 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 border-2 border-dashed border-green-200 hover:bg-green-100 hover:border-green-700 transition-all active:scale-95"
            >
                <Smartphone size={20}/> Activar Cámara Escáner
            </button>
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="flex-1 bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Resumen de Transacción</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 font-bold italic">
              <span>Subtotal</span>
              <span>Q{(total / 1.12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-bold italic">
              <span>IVA (12%)</span>
              <span>Q{(total - (total / 1.12)).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-6 mt-4 flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</span>
              <span className="text-6xl font-black text-green-700 tracking-tighter italic">Q{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <div className="mt-8 space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Seleccionar Método de Pago</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Efectivo')}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-green-700 hover:shadow-xl hover:shadow-green-900/10 transition-all disabled:opacity-50 group"
            >
              <div className="bg-green-50 p-3 rounded-2xl text-green-700 group-hover:bg-green-700 group-hover:text-white transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <Banknote size={28} />} 
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">Efectivo</span>
            </button>
            <button 
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Tarjeta')}
              className="flex flex-col items-center gap-3 p-6 bg-white border-2 border-gray-100 rounded-[2rem] hover:border-orange-500 hover:shadow-xl hover:shadow-orange-900/10 transition-all disabled:opacity-50 group"
            >
              <div className="bg-orange-50 p-3 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={28} />} 
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-700">Tarjeta</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DEL ESCÁNER */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-md shadow-2xl border-4 border-green-700">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-gray-800 italic uppercase">
              <Receipt className="text-green-700" size={24} /> Escanear Producto
            </h3>
            <div className="rounded-2xl overflow-hidden shadow-inner">
              <BarcodeScanner onScan={handleScan} />
            </div>
            <button 
              onClick={() => setShowScanner(false)}
              className="w-full mt-6 text-gray-400 font-black uppercase tracking-widest py-4 hover:bg-gray-50 rounded-2xl transition-all text-xs"
            >
              Cancelar y Cerrar
            </button>
          </div>
        </div>
      )}

      <AddCustomerModal 
        isOpen={isCustomerModalOpen}
        initialNit={nitInput}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={(nuevoCliente: any) => {
          setSelectedCustomer(nuevoCliente);
          setNitInput('');
        }}
      />

      {lastSale && (
        <Ticket ref={ticketRef} sale={lastSale} items={cart} />
      )}
    </div>
  );
};
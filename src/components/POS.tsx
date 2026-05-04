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
  UserPlus
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
  
  // Estados para Cliente y Facturación
  const [selectedCustomer, setSelectedCustomer] = useState<any>({ name: 'Consumidor Final', nit: 'C/F' });
  const [nitInput, setNitInput] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Estados para la impresión
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-market-green" /> Nueva Venta
          </h1>
          <button 
            onClick={() => setShowScanner(true)}
            className="lg:hidden bg-market-green text-white p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Smartphone />
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 text-left">Producto</th>
                <th className="p-4 text-center">Cant.</th>
                <th className="p-4 text-right">Precio</th>
                <th className="p-4 text-right">Subtotal</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cart.map((item) => (
                <tr key={item.id} className="hover:bg-market-green/5 transition-colors">
                  <td className="p-4 text-sm">
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.barcode}</div>
                  </td>
                  <td className="p-4 text-center font-semibold text-sm">{item.quantity}</td>
                  <td className="p-4 text-right text-sm">Q{item.price.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-market-green text-sm">Q{(item.price * item.quantity).toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && (
            <div className="p-20 text-center text-gray-300 font-medium italic">
              Escanea o ingresa productos para empezar
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white border-l border-gray-100 p-8 flex flex-col shadow-2xl">
        {/* SECCIÓN CLIENTE CON COLORES DEL SOL */}
        <div className="mb-8 space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 relative group">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <User size={12}/> Cliente Seleccionado
            </p>
            <p className="font-bold text-gray-800 leading-tight">{selectedCustomer.name}</p>
            <p className="text-xs text-market-green font-bold">NIT: {selectedCustomer.nit}</p>
            <button 
              onClick={() => setIsCustomerModalOpen(true)}
              className="absolute top-4 right-4 text-gray-300 hover:text-market-green transition-colors"
              title="Registrar nuevo cliente"
            >
              <UserPlus size={18} />
            </button>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Ingresar NIT..."
              value={nitInput}
              onChange={(e) => setNitInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-transparent focus:border-market-green rounded-xl outline-none transition-all text-sm font-medium"
            />
            <button 
              onClick={buscarCliente}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-market-green hover:bg-market-green/10 rounded-lg transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block mb-8">
            <button 
                onClick={() => setShowScanner(true)}
                className="w-full bg-market-green/10 text-market-green py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border-2 border-dashed border-market-green/20 hover:bg-market-green/20 transition-all"
            >
                <Smartphone /> Activar Cámara Escáner
            </button>
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resumen de Pago</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500 font-medium">
              <span>Subtotal</span>
              <span>Q{(total / 1.12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 font-medium">
              <span>IVA (12%)</span>
              <span>Q{(total - (total / 1.12)).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-end">
              <span className="text-xl font-bold text-gray-800">Total a Pagar</span>
              <span className="text-4xl font-black text-market-green tracking-tighter">Q{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Método de Pago</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Efectivo')}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-100 rounded-2xl hover:border-market-green hover:text-market-green hover:bg-market-green/5 transition-all disabled:opacity-50 disabled:hover:border-gray-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Banknote />} 
              <span className="text-xs font-bold">Efectivo</span>
            </button>
            <button 
              disabled={loading || cart.length === 0}
              onClick={() => handleCheckout('Tarjeta')}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-100 rounded-2xl hover:border-market-orange hover:text-market-orange hover:bg-market-orange/5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CreditCard />} 
              <span className="text-xs font-bold">Tarjeta</span>
            </button>
          </div>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Receipt className="text-market-green" /> Escanear Producto
            </h3>
            <BarcodeScanner onScan={handleScan} />
            <button 
              onClick={() => setShowScanner(false)}
              className="w-full mt-4 text-gray-500 font-bold py-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cerrar Cámara
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE REGISTRO DE CLIENTE */}
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
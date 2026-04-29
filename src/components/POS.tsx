import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { BarcodeScanner } from './BarcodeScanner';
import { Ticket } from './Ticket'; // Importamos el nuevo componente
import { 
  ShoppingCart, 
  Trash2, 
  Smartphone, 
  Receipt, 
  CreditCard, 
  Banknote,
  Loader2 
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
  
  // Estados para la impresión
  const [lastSale, setLastSale] = useState<any>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  // Función para disparar la impresión nativa del navegador
  const handlePrint = () => {
    window.print();
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

    // 1. Crear la venta en Supabase
    const { data: sale, error: sError } = await supabase
      .from('sales')
      .insert([{ total, payment_method: method }])
      .select()
      .single();

    if (sError) {
      setLoading(false);
      return alert("Error al procesar venta");
    }

    // 2. Crear los detalles de la venta
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
      // 3. PREPARAR TICKET PARA IMPRESIÓN
      setLastSale(sale);
      
      // Esperamos un momento a que el DOM renderice el Ticket oculto
      setTimeout(() => {
        if (confirm("Venta realizada con éxito. ¿Desea imprimir el ticket?")) {
          handlePrint();
        }
        // Limpiamos todo para la siguiente venta
        setCart([]);
        setLastSale(null);
      }, 500);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      {/* Lado Izquierdo: Carrito de Compras */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> Nueva Venta
          </h1>
          <button 
            onClick={() => setShowScanner(true)}
            className="lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg"
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
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">
                    <div className="font-bold text-gray-800">{item.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{item.barcode}</div>
                  </td>
                  <td className="p-4 text-center font-semibold text-sm">{item.quantity}</td>
                  <td className="p-4 text-right text-sm">Q{item.price.toFixed(2)}</td>
                  <td className="p-4 text-right font-bold text-blue-600 text-sm">Q{(item.price * item.quantity).toFixed(2)}</td>
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
            <div className="p-20 text-center text-gray-300 font-medium">
              Escanea productos para empezar la venta
            </div>
          )}
        </div>
      </div>

      {/* Lado Derecho: Resumen y Pago */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-100 p-8 flex flex-col shadow-2xl">
        <div className="hidden lg:block mb-8">
            <button 
                onClick={() => setShowScanner(true)}
                className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all"
            >
                <Smartphone /> Activar Cámara Escáner
            </button>
        </div>

        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resumen de Pago</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>Q{(total / 1.12).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>IVA (12%)</span>
              <span>Q{(total - (total / 1.12)).toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed pt-4 flex justify-between items-end">
              <span className="text-xl font-bold text-gray-800">Total a Pagar</span>
              <span className="text-4xl font-black text-blue-600 tracking-tighter">Q{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase">Método de Pago</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
  disabled={loading || cart.length === 0}
  onClick={() => handleCheckout('Efectivo')}
  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:text-green-600 transition-all disabled:opacity-50"
>
  {loading ? <Loader2 className="animate-spin" /> : <Banknote />} 
  <span className="text-xs font-bold">Efectivo</span>
</button>

<button 
  disabled={loading || cart.length === 0}
  onClick={() => handleCheckout('Tarjeta')}
  className="flex flex-col items-center gap-2 p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-50"
>
  {loading ? <Loader2 className="animate-spin" /> : <CreditCard />} 
  <span className="text-xs font-bold">Tarjeta</span>
</button>
          </div>
        </div>
      </div>

      {/* Modal del Escáner */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Receipt className="text-blue-600" /> Escanear Producto
            </h3>
            <BarcodeScanner onScan={handleScan} />
            <button 
              onClick={() => setShowScanner(false)}
              className="w-full mt-4 text-gray-500 font-bold py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cerrar Cámara
            </button>
          </div>
        </div>
      )}

      {/* COMPONENTE DE TICKET (Invisible en pantalla, visible solo al imprimir) */}
      {lastSale && (
        <Ticket ref={ticketRef} sale={lastSale} items={cart} />
      )}
    </div>
  );
};
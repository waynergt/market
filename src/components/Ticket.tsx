import { forwardRef } from 'react';
import { ShoppingBasket, MapPin, Receipt, Star } from 'lucide-react';

export const Ticket = forwardRef<HTMLDivElement, any>(({ sale, items }, ref) => {
  return (
    <div 
      ref={ref} 
      className="p-6 bg-white text-black font-mono text-[10px] w-[58mm] hidden print:block animate-in slide-in-from-bottom duration-700"
    >
      {/* ENCABEZADO DEL TICKET */}
      <div className="text-center space-y-1 mb-6">
        <div className="relative inline-block">
          <img 
            src="/logo.jpeg" 
            alt="Del Sol Market" 
            className="w-16 h-16 mx-auto mb-2 rounded-xl border border-gray-100 object-contain" 
          />
          {/* Pequeño detalle visual de estrella para el diseño digital */}
          <div className="absolute -top-1 -right-1 text-orange-500 print:hidden">
            <Star size={12} fill="currentColor" />
          </div>
        </div>
        
        <h2 className="text-sm font-black uppercase italic tracking-tighter">Del Sol Market</h2>
        <div className="flex flex-col items-center gap-0.5 text-[8px] font-bold text-gray-600">
          <p className="flex items-center gap-1 uppercase">
            <MapPin size={8} /> Aldea La Libertad, Taxisco
          </p>
          <p className="tracking-widest">NIT: 8736055-1</p>
        </div>
      </div>

      {/* INFORMACIÓN DEL CLIENTE */}
      <div className="mb-4 py-3 border-y border-dashed border-black/30 space-y-1">
        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Cliente:</p>
        <p className="font-black uppercase italic">{sale.customer?.name || 'Consumidor Final'}</p>
        <p className="font-bold tracking-tighter">NIT: {sale.customer?.nit || 'C/F'}</p>
      </div>

      {/* DATOS DE LA VENTA */}
      <div className="mb-4 space-y-1 text-[8px] font-bold uppercase">
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{new Date(sale.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Hora:</span>
          <span>{new Date(sale.created_at).toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Receipt size={8} /> Ticket:
          </span>
          <span className="font-black">#{sale.id?.split('-')[0].toUpperCase()}</span>
        </div>
      </div>

      {/* DETALLE DE PRODUCTOS */}
      <div className="border-t border-black pt-3">
        <div className="flex justify-between font-black text-[8px] uppercase mb-2 border-b border-gray-100 pb-1">
          <span>Cant | Descripción</span>
          <span>Subtotal</span>
        </div>
        <div className="space-y-2">
          {items.map((item: any, i: number) => (
            <div key={i} className="flex justify-between leading-none items-start">
              <span className="flex-1 pr-2 uppercase italic font-bold">
                {item.quantity} x {item.name}
              </span>
              <span className="font-black">Q{(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOTALES */}
      <div className="border-t-2 border-black mt-4 pt-3 space-y-2">
        <div className="flex justify-between items-end font-black">
          <span className="text-[8px] uppercase tracking-widest">Total a Pagar:</span>
          <span className="text-sm tracking-tighter italic border-b-2 border-black">
            Q{sale.total?.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center bg-gray-50 p-1 rounded">
          <span className="text-[7px] font-bold uppercase">Pago realizado:</span>
          <span className="text-[8px] font-black uppercase italic">{sale.payment_method}</span>
        </div>
      </div>

      {/* PIE DE TICKET */}
      <div className="text-center mt-8 space-y-3">
        <div className="flex justify-center gap-2 text-gray-300 print:hidden">
          <ShoppingBasket size={12} />
          <Star size={12} />
          <ShoppingBasket size={12} />
        </div>
        
        <div className="space-y-1">
          <p className="font-black uppercase text-[8px] tracking-[0.2em]">
            ¡Gracias por su preferencia!
          </p>
          <p className="text-[6px] font-bold text-gray-500 uppercase tracking-tighter">
            Sujeto a pagos trimestrales ISR
          </p>
          <p className="text-[6px] italic font-medium">
            *** Del Sol Market - Taxisco, Santa Rosa ***
          </p>
        </div>
        
        {/* Simulación de código de barras para el ticket */}
        <div className="w-full h-4 bg-black/5 mt-2 rounded flex items-center justify-center overflow-hidden">
           <div className="w-full h-full border-x-4 border-black/10 border-double"></div>
        </div>
      </div>
    </div>
  );
});
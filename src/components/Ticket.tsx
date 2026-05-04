import { forwardRef } from 'react';

export const Ticket = forwardRef<HTMLDivElement, any>(({ sale, items }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-[10px] w-[58mm] hidden print:block">
      <div className="text-center space-y-1 mb-4 border-b border-dashed border-black pb-2">
        {/* Logo del Market al inicio del Ticket */}
        <img src="/logo.jpeg" alt="Del Sol Market" className="w-20 h-auto mx-auto mb-1 rounded-lg" />
        <h2 className="text-sm font-bold uppercase italic">Del Sol Market</h2>
        <p>Aldea La Libertad, Taxisco</p>
        <p>NIT: 8736055-1</p>
      </div>

      <div className="mb-4 space-y-1">
        <p className="font-bold">CLIENTE:</p>
        <p>{sale.customer?.name || 'Consumidor Final'}</p>
        <p>NIT: {sale.customer?.nit || 'C/F'}</p>
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-2">
        <p>FECHA: {new Date(sale.created_at).toLocaleString()}</p>
        <p>TICKET: {sale.id?.split('-')[0].toUpperCase()}</p>
      </div>

      <div className="border-t border-dashed border-black pt-2">
        <div className="flex justify-between font-bold mb-1">
          <span>CANT | DESCRIPCIÓN</span>
          <span>TOTAL</span>
        </div>
        {items.map((item: any, i: number) => (
          <div key={i} className="flex justify-between leading-tight mb-1">
            <span>{item.quantity} x {item.name}</span>
            <span>Q{(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1">
        <div className="flex justify-between font-black text-xs">
          <span>TOTAL:</span>
          <span>Q{sale.total?.toFixed(2)}</span>
        </div>
        <p className="text-[8px]">PAGO: {sale.payment_method}</p>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
        <p className="font-bold uppercase text-[8px]">*** Gracias por su preferencia ***</p>
        <p className="text-[7px]">Sujeto a pagos trimestrales ISR</p>
      </div>
    </div>
  );
});
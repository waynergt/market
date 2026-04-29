import { forwardRef } from 'react';

interface Props {
  sale: {
    id: string;
    total: number;
    payment_method: string;
    created_at: string;
  };
  items: any[];
}

export const Ticket = forwardRef<HTMLDivElement, Props>(({ sale, items }, ref) => {
  return (
    <div ref={ref} className="p-4 bg-white text-black font-mono text-[10px] w-[58mm] hidden print:block">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-sm font-bold uppercase">MarketPOS</h2>
        <p>Aldea La Libertad</p>
        <p>Taxisco, Santa Rosa</p>
        <p>Tel: 5555-0000</p>
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-2">
        <p>FECHA: {new Date(sale.created_at).toLocaleString()}</p>
        <p>TICKET: {sale.id.split('-')[0].toUpperCase()}</p>
      </div>

      <div className="border-t border-dashed border-black pt-2 mb-2">
        <div className="flex justify-between font-bold">
          <span>CANT</span>
          <span>DESCRIPCIÓN</span>
          <span>SUB</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.quantity}</span>
            <span className="truncate max-w-[30mm]">{item.name || item.products?.name}</span>
            <span>Q{(item.quantity * (item.price || item.price_at_sale)).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black pt-2 space-y-1">
        <div className="flex justify-between font-black text-xs">
          <span>TOTAL:</span>
          <span>Q{sale.total.toFixed(2)}</span>
        </div>
        <p className="text-[8px]">PAGO: {sale.payment_method}</p>
      </div>

      <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
        <p>¡Gracias por su compra!</p>
        <p>Revise su producto antes de salir.</p>
      </div>
    </div>
  );
});
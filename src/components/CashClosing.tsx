import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Banknote, 
  CreditCard, 
  TrendingUp, 
  PieChart as PieIcon, 
  Printer
} from 'lucide-react';

interface DailySummary {
  cashSales: number;
  cardSales: number;
  totalSales: number;
  totalProfit: number;
  count: number;
}

export const CashClosing = () => {
  const [summary, setSummary] = useState<DailySummary>({
    cashSales: 0,
    cardSales: 0,
    totalSales: 0,
    totalProfit: 0,
    count: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateClosing();
  }, []);

  const calculateClosing = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: sales, error: sError } = await supabase
      .from('sales')
      .select(`
        id,
        total,
        payment_method,
        sale_items (
          quantity,
          price_at_sale,
          products ( cost_price )
        )
      `)
      .gte('created_at', today);

    if (sError) {
      console.error(sError);
      return;
    }

    let cash = 0;
    let card = 0;
    let profit = 0;

    sales?.forEach(sale => {
      if (sale.payment_method === 'Efectivo') cash += sale.total;
      else card += sale.total;

      sale.sale_items.forEach((item: any) => {
        const cost = item.products?.cost_price || 0;
        const gain = (item.price_at_sale - cost) * item.quantity;
        profit += gain;
      });
    });

    setSummary({
      cashSales: cash,
      cardSales: card,
      totalSales: cash + card,
      totalProfit: profit,
      count: sales?.length || 0
    });
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold">Calculando cierre del día...</div>;

  return (
    /* Agregamos 'print:block' aquí para que el navegador lo muestre al imprimir */
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 print:block">
      
      {/* Encabezado: Se oculta el botón al imprimir para que no salga en el papel */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">Corte de Caja</h1>
          <p className="text-gray-500 font-medium">Resumen financiero: {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all print:hidden"
        >
          <Printer size={20} /> Imprimir Corte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ventas Totales */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-b-4 border-b-blue-500 print:border-blue-500 print:shadow-none">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ventas Totales</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-gray-800">Q{summary.totalSales.toFixed(2)}</h3>
            <TrendingUp className="text-blue-500 print:hidden" size={32} />
          </div>
          <p className="text-sm text-gray-400 mt-2">{summary.count} transacciones hoy</p>
        </div>

        {/* Ganancia Neta: Usamos un borde verde en impresión para ahorrar tinta */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-3xl shadow-xl text-white print:bg-none print:text-black print:border-2 print:border-green-500 print:shadow-none">
          <p className="text-xs font-black text-green-100 print:text-gray-400 uppercase tracking-widest mb-2">Ganancia Neta Est.</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black">Q{summary.totalProfit.toFixed(2)}</h3>
            <PieIcon size={32} className="text-green-200 print:hidden" />
          </div>
          <p className="text-sm text-green-100 print:text-gray-400 mt-2">Diferencia Venta vs Costo</p>
        </div>

        {/* Desglose */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:shadow-none">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Ingresos por Método</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-600 font-bold">
                <Banknote className="text-green-500 print:hidden" size={18} /> Efectivo
              </span>
              <span className="font-black text-gray-800">Q{summary.cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-600 font-bold">
                <CreditCard className="text-blue-500 print:hidden" size={18} /> Tarjeta
              </span>
              <span className="font-black text-gray-800">Q{summary.cardSales.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de pie para el reporte impreso */}
      <div className="hidden print:block text-center pt-10 border-t border-dashed border-gray-300">
        <p className="text-sm font-bold text-gray-800">Reporte generado por MarketPOS</p>
        <p className="text-xs text-gray-400">Firma del responsable: _________________________</p>
      </div>
    </div>
  );
};
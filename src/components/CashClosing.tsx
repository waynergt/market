import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Banknote, CreditCard, TrendingUp, PieChart as PieIcon, Printer } from 'lucide-react';

interface DailySummary {
  cashSales: number;
  cardSales: number;
  totalSales: number;
  totalProfit: number;
  count: number;
}

export const CashClosing = () => {
  const [summary, setSummary] = useState<DailySummary>({ cashSales: 0, cardSales: 0, totalSales: 0, totalProfit: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { calculateClosing(); }, []);

  const calculateClosing = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data: sales } = await supabase.from('sales').select('*, sale_items(*, products(cost_price))').gte('created_at', today);

    let cash = 0, card = 0, profit = 0;
    sales?.forEach(sale => {
      if (sale.payment_method === 'Efectivo') cash += sale.total;
      else card += sale.total;
      sale.sale_items.forEach((item: any) => {
        const cost = item.products?.cost_price || 0;
        profit += (item.price_at_sale - cost) * item.quantity;
      });
    });

    setSummary({ cashSales: cash, cardSales: card, totalSales: cash + card, totalProfit: profit, count: sales?.length || 0 });
    setLoading(false);
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-bold italic">Calculando cierre de Del Sol Market...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 print:block">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter italic">Corte de Caja</h1>
          <p className="text-gray-500 font-medium italic">Resumen: {new Date().toLocaleDateString()}</p>
        </div>
        <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all print:hidden shadow-lg shadow-gray-200">
          <Printer size={20} /> Imprimir Corte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 border-b-4 border-b-market-green print:border-market-green print:shadow-none">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ventas Totales</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-gray-800 italic">Q{summary.totalSales.toFixed(2)}</h3>
            <TrendingUp className="text-market-green print:hidden" size={32} />
          </div>
          <p className="text-sm text-gray-400 mt-2 font-bold">{summary.count} transacciones</p>
        </div>

        <div className="bg-market-green bg-gradient-to-br from-market-green to-market-dark p-8 rounded-3xl shadow-xl text-white print:bg-none print:text-black print:border-2 print:border-market-green print:shadow-none">
          <p className="text-[10px] font-black text-white/70 print:text-gray-400 uppercase tracking-widest mb-2">Ganancia Neta</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black italic">Q{summary.totalProfit.toFixed(2)}</h3>
            <PieIcon size={32} className="text-white/20 print:hidden" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:shadow-none">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Por Método</p>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-600 font-bold"><Banknote className="text-market-green" size={18} /> Efectivo</span>
              <span className="font-black text-gray-800">Q{summary.cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-gray-600 font-bold"><CreditCard className="text-market-orange" size={18} /> Tarjeta</span>
              <span className="font-black text-gray-800">Q{summary.cardSales.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
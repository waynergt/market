import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Banknote, CreditCard, TrendingUp, PieChart as PieIcon, Printer, CheckCircle2 } from 'lucide-react';

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

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-bold italic animate-pulse">Calculando cierre de Del Sol Market...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 print:block">
      
      {/* Encabezado Principal */}
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter italic flex items-center gap-3">
            <CheckCircle2 className="text-green-700" size={36} /> Corte de Caja
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Resumen financiero: {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-green-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all print:hidden shadow-xl shadow-green-900/20 active:scale-95"
        >
          <Printer size={22} /> Imprimir Reporte
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tarjeta 1: Ventas Totales */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 border-b-8 border-b-green-700 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Ventas Totales</p>
            <div className="flex items-center justify-between">
              <h3 className="text-4xl font-black text-gray-800 italic tracking-tighter">Q{summary.totalSales.toFixed(2)}</h3>
              <div className="bg-green-50 p-3 rounded-2xl">
                <TrendingUp className="text-green-700 print:hidden" size={28} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-lg uppercase">{summary.count} ventas</span>
              <p className="text-xs text-gray-400 font-medium italic">registradas hoy</p>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Ganancia Neta (La más importante) */}
        <div className="bg-green-700 bg-gradient-to-br from-green-700 to-green-900 p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/30 text-white relative overflow-hidden group print:bg-none print:text-black print:border-2 print:border-green-700">
          <div className="absolute right-[-20px] top-[-20px] text-white/10 rotate-12">
            <PieIcon size={180} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-green-100/70 print:text-gray-400 uppercase tracking-[0.2em] mb-2">Ganancia Neta Est.</p>
            <div className="flex items-center justify-between">
              <h3 className="text-5xl font-black italic tracking-tighter">Q{summary.totalProfit.toFixed(2)}</h3>
            </div>
            <p className="text-xs text-green-100/50 print:text-gray-400 mt-4 italic font-medium">Margen real de utilidad hoy</p>
          </div>
        </div>

        {/* Tarjeta 3: Desglose por Método */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ingresos por Método</p>
          <div className="space-y-6">
            <div className="flex justify-between items-center group/item">
              <span className="flex items-center gap-3 text-gray-600 font-bold">
                <div className="bg-green-50 p-2 rounded-xl group-hover/item:bg-green-700 group-hover/item:text-white transition-colors">
                  <Banknote size={20} className="text-green-700 group-hover/item:text-inherit" />
                </div>
                Efectivo
              </span>
              <span className="font-black text-gray-800 text-lg">Q{summary.cashSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center group/item">
              <span className="flex items-center gap-3 text-gray-600 font-bold">
                <div className="bg-orange-50 p-2 rounded-xl group-hover/item:bg-orange-500 group-hover/item:text-white transition-colors">
                  <CreditCard size={20} className="text-orange-500 group-hover/item:text-inherit" />
                </div>
                Tarjeta
              </span>
              <span className="font-black text-gray-800 text-lg">Q{summary.cardSales.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de página exclusivo para impresión */}
      <div className="hidden print:flex flex-col items-center mt-20 text-center space-y-4">
        <div className="w-full border-t border-dashed border-gray-300 mb-8"></div>
        <p className="text-sm font-black text-gray-800 uppercase italic">Del Sol Market - Reporte Oficial de Cierre</p>
        <div className="flex justify-around w-full pt-12">
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Firma Responsable</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p className="text-[10px] font-bold uppercase">Sello de Caja</p>
          </div>
        </div>
        <p className="text-[8px] text-gray-400 mt-10">Generado por MarketPOS el {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Package, 
  Printer,
  TrendingUp,
  BarChart3,
  PieChart,
  FileBarChart
} from 'lucide-react';

interface InventoryStats {
  totalCost: number;
  totalValue: number;
  potentialProfit: number;
  totalItems: number;
  products: any[];
}

export const InventoryReport = () => {
  const [stats, setStats] = useState<InventoryStats>({
    totalCost: 0,
    totalValue: 0,
    potentialProfit: 0,
    totalItems: 0,
    products: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    let cost = 0;
    let value = 0;
    let items = 0;

    products?.forEach(p => {
      cost += (p.cost_price * p.stock);
      value += (p.selling_price * p.stock);
      items += p.stock;
    });

    setStats({
      totalCost: cost,
      totalValue: value,
      potentialProfit: value - cost,
      totalItems: items,
      products: products || []
    });
    setLoading(false);
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-bold italic animate-pulse">Generando balance de activos Del Sol Market...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 print:block print:p-0">
      
      {/* ENCABEZADO PARA PANTALLA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6 print:hidden">
        <div>
          <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter flex items-center gap-3">
            <BarChart3 className="text-green-700" size={36} /> Reporte de Activos
          </h1>
          <p className="text-gray-500 font-medium italic mt-1">Valorización de existencias y rentabilidad proyectada</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-green-700 hover:bg-green-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-green-700/20 transition-all active:scale-95"
        >
          <Printer size={22} /> Imprimir Balance
        </button>
      </div>

      {/* ENCABEZADO EXCLUSIVO PARA IMPRESIÓN */}
      <div className="hidden print:flex flex-col items-center text-center border-b-4 border-green-700 pb-8 mb-10">
        <div className="flex items-center gap-4 mb-4">
          <img src="/logo.jpeg" alt="Logo" className="w-24 h-24 object-contain" />
          <div className="text-left">
            <h1 className="text-4xl font-black uppercase italic text-gray-800">Del Sol Market</h1>
            <p className="text-orange-500 font-bold tracking-[0.3em] uppercase text-xs">Balance General de Inventario</p>
          </div>
        </div>
        <div className="w-full flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">
          <span>Fecha: {new Date().toLocaleDateString()}</span>
          <span>Hora de emisión: {new Date().toLocaleTimeString()}</span>
          <span>Responsable: Control de Inventarios</span>
        </div>
      </div>

      {/* TARJETAS FINANCIERAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Inversión Total */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Inversión (Costo)</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-gray-800 italic tracking-tighter">Q{stats.totalCost.toFixed(2)}</h3>
            <div className="bg-gray-50 p-3 rounded-2xl">
              <TrendingUp className="text-gray-400 print:hidden" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic font-medium">Capital retenido en bodega</p>
        </div>

        {/* Valor de Venta */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Valor de Mercado</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-green-700 italic tracking-tighter">Q{stats.totalValue.toFixed(2)}</h3>
            <div className="bg-green-50 p-3 rounded-2xl">
              <PieChart className="text-green-700 print:hidden" size={28} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic font-medium">Ingreso bruto al liquidar stock</p>
        </div>

        {/* Ganancia Proyectada */}
        <div className="bg-green-700 bg-gradient-to-br from-green-700 to-green-900 p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/30 text-white relative overflow-hidden group print:bg-none print:text-black print:border-2 print:border-green-700">
          <div className="absolute right-[-20px] top-[-20px] text-white/10 rotate-12 transition-transform group-hover:scale-110">
            <FileBarChart size={180} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-orange-300 print:text-gray-400 uppercase tracking-[0.2em] mb-2">Margen de Ganancia</p>
            <h3 className="text-5xl font-black italic tracking-tighter">Q{stats.potentialProfit.toFixed(2)}</h3>
            <div className="mt-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase">Rentabilidad</span>
              <p className="text-xs text-green-100/70 italic font-medium">Utilidad neta esperada</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE DETALLE */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden print:shadow-none print:border-gray-200">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 print:bg-white">
          <h4 className="font-black text-gray-800 flex items-center gap-3 italic uppercase tracking-tight">
            <Package size={22} className="text-green-700 print:hidden" /> Detalle de Existencias
          </h4>
          <span className="text-xs font-black bg-white px-4 py-2 rounded-full text-gray-500 border border-gray-100 shadow-sm print:border-none">
            {stats.products.length} productos analizados
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100">
                <th className="p-6">Descripción del Producto</th>
                <th className="p-6 text-center">Stock</th>
                <th className="p-6 text-right">Costo Unit.</th>
                <th className="p-6 text-right">Venta Unit.</th>
                <th className="p-6 text-right font-black text-gray-600">Total Inversión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.products.map((p) => (
                <tr key={p.id} className="text-sm group hover:bg-green-50/30 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-gray-800 uppercase italic leading-tight group-hover:text-green-700 transition-colors">{p.name}</p>
                    <p className="text-[10px] font-mono text-orange-500 font-bold tracking-widest mt-0.5">{p.barcode}</p>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`text-lg font-black tracking-tighter ${p.stock < 5 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                        {p.stock}
                      </span>
                      <p className="text-[8px] font-black text-gray-300 uppercase">uds</p>
                    </div>
                  </td>
                  <td className="p-6 text-right text-gray-500 font-bold">Q{p.cost_price.toFixed(2)}</td>
                  <td className="p-6 text-right text-green-700 font-black">Q{p.selling_price.toFixed(2)}</td>
                  <td className="p-6 text-right font-black text-gray-800 text-lg tracking-tighter">
                    Q{(p.cost_price * p.stock).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIE DE PÁGINA PARA IMPRESIÓN */}
      <div className="hidden print:flex flex-col items-center mt-20 text-center space-y-10">
        <p className="text-[10px] text-gray-400 italic max-w-lg">
          Este documento constituye un reporte de valoración de activos propiedad de Del Sol Market. 
          Cualquier discrepancia debe ser notificada al departamento administrativo.
        </p>
        <div className="flex justify-around w-full pt-10">
          <div className="flex flex-col items-center">
            <div className="w-64 border-b-2 border-gray-800 mb-2"></div>
            <p className="text-xs font-black uppercase">Firma del Encargado</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-64 border-b-2 border-gray-800 mb-2"></div>
            <p className="text-xs font-black uppercase">Sello de Gerencia</p>
          </div>
        </div>
      </div>
    </div>
  );
};
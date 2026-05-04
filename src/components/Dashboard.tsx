import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign,
  PackageCheck,
  ArrowUpRight,
  Zap
} from 'lucide-react';

interface Stats {
  todaySales: number;
  monthlyPurchases: number;
  lowStockCount: number;
  totalProducts: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    todaySales: 0,
    monthlyPurchases: 0,
    lowStockCount: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { data: salesToday } = await supabase.from('sales').select('total').gte('created_at', today);
    const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: purchasesMonth } = await supabase.from('purchases').select('total_cost').gte('created_at', firstDayMonth);
    const { count: lowStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 5);
    const { count: totalProd } = await supabase.from('products').select('*', { count: 'exact', head: true });

    const totalSales = salesToday?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;
    const totalPurchases = purchasesMonth?.reduce((acc, curr) => acc + Number(curr.total_cost), 0) || 0;

    setStats({
      todaySales: totalSales,
      monthlyPurchases: totalPurchases,
      lowStockCount: lowStock || 0,
      totalProducts: totalProd || 0
    });
    setLoading(false);
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-400 font-bold italic animate-pulse">Sincronizando datos de Del Sol Market...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700">
      
      {/* Encabezado Dinámico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-800 italic uppercase tracking-tighter">
            Panel de <span className="text-green-700">Control</span>
          </h1>
          <p className="text-gray-500 font-medium italic">Resumen operativo de hoy · {new Date().toLocaleDateString()}</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Sistema en línea</span>
        </div>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Ventas Hoy */}
        <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-green-700/5 group-hover:text-green-700/10 transition-colors">
            <DollarSign size={120} />
          </div>
          <div className="relative z-10">
            <div className="bg-green-50 text-green-700 w-12 h-12 rounded-[1.2rem] flex items-center justify-center mb-5 shadow-inner">
              <TrendingUp size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ventas de Hoy</p>
            <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter mt-1">Q{stats.todaySales.toFixed(2)}</h3>
            <span className="text-[10px] text-green-600 font-black flex items-center gap-1 mt-3 uppercase">
              <ArrowUpRight size={14} /> Rendimiento positivo
            </span>
          </div>
        </div>

        {/* Compras Mes (Inversión) */}
        <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-orange-500/5 group-hover:text-orange-500/10 transition-colors">
            <ShoppingBag size={120} />
          </div>
          <div className="relative z-10">
            <div className="bg-orange-50 text-orange-500 w-12 h-12 rounded-[1.2rem] flex items-center justify-center mb-5 shadow-inner">
              <Zap size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Inversión Mes</p>
            <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter mt-1">Q{stats.monthlyPurchases.toFixed(2)}</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase italic">Compras acumuladas</p>
          </div>
        </div>

        {/* Stock Bajo (Alerta) */}
        <div className={`p-7 rounded-[2.5rem] shadow-xl border relative overflow-hidden group transition-all ${
          stats.lowStockCount > 0 
          ? 'bg-white border-red-100 shadow-red-100/50' 
          : 'bg-white border-gray-100'
        }`}>
          <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={120} className={stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-700'} />
          </div>
          <div className="relative z-10">
            <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center mb-5 shadow-inner ${
              stats.lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Stock Crítico</p>
            <h3 className={`text-3xl font-black italic tracking-tighter mt-1 ${
              stats.lowStockCount > 0 ? 'text-red-600' : 'text-gray-800'
            }`}>
              {stats.lowStockCount} <span className="text-sm font-bold uppercase opacity-50">Items</span>
            </h3>
            <p className={`text-[10px] font-black mt-3 uppercase ${
              stats.lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-green-600'
            }`}>
              {stats.lowStockCount > 0 ? 'Requiere atención' : 'Inventario sano'}
            </p>
          </div>
        </div>

        {/* Total Productos */}
        <div className="bg-white p-7 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-gray-500/5 group-hover:text-gray-500/10 transition-colors">
            <PackageCheck size={120} />
          </div>
          <div className="relative z-10">
            <div className="bg-gray-100 text-gray-600 w-12 h-12 rounded-[1.2rem] flex items-center justify-center mb-5 shadow-inner">
              <PackageCheck size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Catálogo Total</p>
            <h3 className="text-3xl font-black text-gray-800 italic tracking-tighter mt-1">{stats.totalProducts}</h3>
            <p className="text-[10px] text-gray-400 font-bold mt-3 uppercase italic">Productos activos</p>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Alertas y Sugerencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Lista de Reposición */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <h4 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3 italic uppercase tracking-tight">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <AlertTriangle size={20} />
            </div>
            A punto de agotarse
          </h4>
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
            <div className="bg-gray-50 p-6 rounded-full">
              <ShoppingBag size={40} className="text-gray-200" />
            </div>
            <p className="text-sm text-gray-400 font-bold italic max-w-[250px]">
              La lista de reposición automática aparecerá aquí cuando el stock sea menor a 5 unidades.
            </p>
          </div>
        </div>

        {/* Tarjeta de Consejo Premium */}
        <div className="bg-gradient-to-br from-green-700 to-green-900 p-10 rounded-[2.5rem] shadow-2xl shadow-green-900/40 text-white relative overflow-hidden group">
          <div className="absolute right-[-30px] bottom-[-30px] text-white/10 group-hover:scale-110 transition-transform duration-700">
            <Zap size={250} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit mb-6 border border-white/30">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-300">Tip del Sistema</p>
            </div>
            <h4 className="text-2xl font-black mb-4 italic leading-tight uppercase tracking-tight">
              Consejo de <br /> Del Sol Market
            </h4>
            <p className="text-green-50/80 text-sm leading-relaxed mb-10 font-medium italic">
              "Detectamos que los días **Jueves** son los de mayor carga de facturas. Asegúrate de tener el inventario listo para el fin de semana."
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-900/20 active:scale-95">
              Ver Reportes Detallados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
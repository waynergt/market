import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign,
  PackageCheck,
  ArrowUpRight
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

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400 italic">Cargando estadísticas de Del Sol Market...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-800 italic">Panel de Control</h1>
        <p className="text-gray-500 font-medium">Resumen operativo de hoy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas Hoy */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-market-green/5 group-hover:text-market-green/10 transition-colors">
            <DollarSign size={100} />
          </div>
          <div className="relative">
            <div className="bg-market-green/10 text-market-green w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ventas de Hoy</p>
            <h3 className="text-2xl font-black text-gray-800">Q{stats.todaySales.toFixed(2)}</h3>
            <span className="text-xs text-market-green font-bold flex items-center gap-1 mt-2 italic">
              <ArrowUpRight size={14} /> +12% vs ayer
            </span>
          </div>
        </div>

        {/* Compras Mes */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-market-orange/5 group-hover:text-market-orange/10 transition-colors">
            <ShoppingBag size={100} />
          </div>
          <div className="relative">
            <div className="bg-market-orange/10 text-market-orange w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inversión Mes</p>
            <h3 className="text-2xl font-black text-gray-800">Q{stats.monthlyPurchases.toFixed(2)}</h3>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-red-50 group-hover:text-red-100 transition-colors">
            <AlertTriangle size={100} />
          </div>
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stats.lowStockCount > 0 ? 'bg-red-100 text-red-600' : 'bg-market-green/10 text-market-green'}`}>
              <AlertTriangle size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Crítico</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.lowStockCount} items</h3>
          </div>
        </div>

        {/* Total Productos */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-gray-50 group-hover:text-gray-100 transition-colors">
            <PackageCheck size={100} />
          </div>
          <div className="relative">
            <div className="bg-gray-100 text-gray-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <PackageCheck size={20} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Catálogo</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.totalProducts}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 italic">
            <AlertTriangle className="text-market-orange" size={20} /> 
            Reposición de Inventario
          </h4>
          <p className="text-sm text-gray-400 italic">Lista detallada próximamente...</p>
        </div>

        <div className="bg-gradient-to-br from-market-green to-market-dark p-8 rounded-3xl shadow-xl text-white">
          <h4 className="text-lg font-bold mb-2">Consejo Del Sol Market</h4>
          <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
            Recuerda revisar el stock de perecederos hoy para evitar mermas. ¡Ten un excelente día de ventas!
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md">
            Ver estadísticas
          </button>
        </div>
      </div>
    </div>
  );
};
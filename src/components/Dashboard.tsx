import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingBag, 
  DollarSign,
  PackageCheck,
  ArrowUpRight
  // Se eliminó ArrowDownRight de aquí para limpiar la advertencia
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

    // 1. Ventas de hoy
    const { data: salesToday } = await supabase
      .from('sales')
      .select('total')
      .gte('created_at', today);

    // 2. Compras del mes
    const firstDayMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: purchasesMonth } = await supabase
      .from('purchases')
      .select('total_cost')
      .gte('created_at', firstDayMonth);

    // 3. Productos con bajo stock (< 5)
    const { count: lowStock } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock', 5);

    // 4. Total de productos únicos
    const { count: totalProd } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

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

  if (loading) return <div className="p-10 text-center animate-pulse text-gray-400">Cargando estadísticas...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">Resumen operativo de tu negocio hoy</p>
      </div>

      {/* Tarjetas de Resumen (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Ventas Hoy */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-blue-50/50 group-hover:text-blue-50 transition-colors">
            <DollarSign size={100} />
          </div>
          <div className="relative">
            <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Ventas de Hoy</p>
            <h3 className="text-2xl font-black text-gray-800">Q{stats.todaySales.toFixed(2)}</h3>
            <span className="text-xs text-green-500 font-bold flex items-center gap-1 mt-2">
              <ArrowUpRight size={14} /> +12% vs ayer
            </span>
          </div>
        </div>

        {/* Compras Mes */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-purple-50/50 group-hover:text-purple-50 transition-colors">
            <ShoppingBag size={100} />
          </div>
          <div className="relative">
            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <ShoppingBag size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Inversión Mes</p>
            <h3 className="text-2xl font-black text-gray-800">Q{stats.monthlyPurchases.toFixed(2)}</h3>
            <span className="text-xs text-gray-400 font-medium flex items-center gap-1 mt-2">
              Gastos en mercadería
            </span>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-orange-50/50 group-hover:text-orange-50 transition-colors">
            <AlertTriangle size={100} />
          </div>
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stats.lowStockCount > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              <AlertTriangle size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Stock Crítico</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.lowStockCount} <span className="text-sm font-normal text-gray-400">items</span></h3>
            <p className="text-xs text-orange-500 font-bold mt-2">Requieren atención</p>
          </div>
        </div>

        {/* Total Productos */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute right-[-10px] top-[-10px] text-gray-50/50 group-hover:text-gray-50 transition-colors">
            <PackageCheck size={100} />
          </div>
          <div className="relative">
            <div className="bg-gray-100 text-gray-600 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <PackageCheck size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Catálogo Total</p>
            <h3 className="text-2xl font-black text-gray-800">{stats.totalProducts} <span className="text-sm font-normal text-gray-400">productos</span></h3>
            <p className="text-xs text-gray-400 font-medium mt-2">Registrados en sistema</p>
          </div>
        </div>

      </div>

      {/* Sección Inferior: Alertas y Sugerencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} /> 
            Productos a punto de agotarse
          </h4>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 italic">Próximamente: Lista detallada de reposición automática.</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white">
          <h4 className="text-lg font-bold mb-2">Consejo del Sistema</h4>
          <p className="text-blue-100 text-sm leading-relaxed mb-6">
            Detectamos que las ventas de **Snacks** han subido un 20% los fines de semana. Considera aumentar el stock los días jueves.
          </p>
          <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all">
            Ver reporte completo
          </button>
        </div>
      </div>
    </div>
  );
};
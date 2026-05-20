import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  History, 
  Search, 
  ArrowDownRight, 
  ArrowUpRight, 
  PackageSearch,
  Loader2,
  CalendarDays
} from 'lucide-react';

interface InventoryLog {
  id: string;
  created_at: string;
  change_amount: number;
  reason: string;
  previous_stock: number;
  new_stock: number;
  products: {
    name: string;
    barcode: string;
  };
}

export const Kardex = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    // Hacemos un "JOIN" con la tabla products para traer el nombre y código
    const { data, error } = await supabase
      .from('inventory_logs')
      .select(`
        id,
        created_at,
        change_amount,
        reason,
        previous_stock,
        new_stock,
        products (
          name,
          barcode
        )
      `)
      .order('created_at', { ascending: false })
      .limit(200); // Traemos los últimos 200 movimientos para no sobrecargar

    if (error) {
      console.error('Error cargando Kardex:', error);
    } else {
      setLogs(data as any[]);
    }
    setLoading(false);
  };

  // Filtrar por nombre de producto, código o razón
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.products?.name.toLowerCase().includes(term) ||
      log.products?.barcode.toLowerCase().includes(term) ||
      log.reason.toLowerCase().includes(term)
    );
  });

  // Función para formatear la fecha a un formato legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-GT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 flex items-center gap-4 italic uppercase tracking-tighter">
            <History className="text-green-700" size={40} /> 
            Kardex <span className="text-green-700">Inventario</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <CalendarDays size={14} className="text-gray-400" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">
              Historial de Entradas y Salidas
            </p>
          </div>
        </div>
        
        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Buscar producto, código o motivo..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-green-700 rounded-2xl outline-none font-bold text-gray-800 shadow-xl shadow-gray-200/40 transition-all" 
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-green-700" size={48} />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Cargando bitácora...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b border-gray-100 font-black text-[10px] uppercase text-gray-400 tracking-[0.2em]">
                <tr>
                  <th className="p-6">Fecha y Hora</th>
                  <th className="p-6">Producto</th>
                  <th className="p-6">Motivo</th>
                  <th className="p-6 text-center">Stock Ant.</th>
                  <th className="p-6 text-center">Movimiento</th>
                  <th className="p-6 text-center">Stock Nuevo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => {
                    const isAddition = log.change_amount > 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors text-sm group">
                        {/* Fecha */}
                        <td className="p-6 whitespace-nowrap text-gray-500 font-bold text-xs">
                          {formatDate(log.created_at)}
                        </td>
                        
                        {/* Producto */}
                        <td className="p-6">
                          <div className="font-black text-gray-800 uppercase italic group-hover:text-green-700 transition-colors">
                            {log.products?.name || 'Producto Eliminado'}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono font-bold">
                            {log.products?.barcode || 'N/A'}
                          </div>
                        </td>

                        {/* Motivo */}
                        <td className="p-6">
                          <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {log.reason}
                          </span>
                        </td>

                        {/* Stock Anterior */}
                        <td className="p-6 text-center font-bold text-gray-400">
                          {log.previous_stock}
                        </td>

                        {/* Cantidad Movida (+ o -) */}
                        <td className="p-6 text-center">
                          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs ${isAddition ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                            {isAddition ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {isAddition ? '+' : ''}{log.change_amount}
                          </div>
                        </td>

                        {/* Stock Nuevo */}
                        <td className="p-6 text-center font-black text-gray-800 text-lg">
                          {log.new_stock}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-gray-50 p-6 rounded-full">
                          <PackageSearch size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-black text-gray-400 italic uppercase">No se encontraron movimientos</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
import { 
  Package, ClipboardList, LayoutDashboard, Settings, 
  Menu, X, ShoppingCart, History, LogOut, ShieldCheck, User 
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string; // Nueva prop para saber el rol
}

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filtramos los items del menú según el rol
  const menuItems = [
    { id: 'pos', label: 'Venta/Caja', icon: ShoppingCart, roles: ['admin', 'vendedor'] },
    { id: 'history', label: 'Historial', icon: History, roles: ['admin', 'vendedor'] },
    { id: 'inventory', label: 'Inventario', icon: Package, roles: ['admin'] },
    { id: 'receive', label: 'Carga Facturas', icon: ClipboardList, roles: ['admin'] },
    { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, roles: ['admin'] },
    { id: 'settings', label: 'Configuración', icon: Settings, roles: ['admin', 'vendedor'] },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64`}>
        <div className="flex flex-col h-full px-4 py-6">
          
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <Package size={24} />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">MarketPOS</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              // SOLO MOSTRAR SI EL ROL TIENE PERMISO
              item.roles.includes(userRole) && (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                    ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <item.icon size={20} />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            {/* Info del Usuario con su Rol */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                {userRole === 'admin' ? <ShieldCheck size={14} className="text-blue-600" /> : <User size={14} className="text-gray-400" />}
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userRole}</p>
              </div>
              <p className="text-sm font-bold text-gray-700 truncate">Usuario Activo</p>
            </div>

            {/* Botón de Salida Real */}
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
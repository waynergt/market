import { 
  Package, 
  ClipboardList, 
  LayoutDashboard, 
  Settings, 
  Menu, 
  X, 
  ShoppingCart, 
  History, 
  LogOut, 
  ShieldCheck, 
  User,
  FileCheck,
  FileBarChart 
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
}

export const Sidebar = ({ activeTab, setActiveTab, userRole }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'pos', label: 'Venta/Caja', icon: ShoppingCart, roles: ['admin', 'vendedor'] },
    { id: 'history', label: 'Historial', icon: History, roles: ['admin', 'vendedor'] },
    { id: 'closing', label: 'Corte de Caja', icon: FileCheck, roles: ['admin'] },
    { id: 'inv_report', label: 'Reporte Inv.', icon: FileBarChart, roles: ['admin'] },
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
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-100 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64`}>
        <div className="flex flex-col h-full px-4 py-4"> 
          
          {/* ENCABEZADO OPTIMIZADO CON COLORES ESTÁNDAR */}
          <div className="flex flex-col items-center mb-6 px-2">
            <div className="w-24 h-24 mb-2 overflow-hidden rounded-2xl shadow-md border border-gray-100 flex items-center justify-center bg-black">
              <img 
                src="/logo.jpeg" 
                alt="Del Sol Market" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black text-green-700 italic leading-none">
                DEL SOL
              </h2>
              <span className="text-[10px] font-bold text-orange-500 tracking-[0.2em] uppercase">
                Market
              </span>
            </div>
          </div>

          {/* MENÚ CON SCROLL */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              item.roles.includes(userRole) && (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-green-700 text-white shadow-lg shadow-green-100 scale-[1.02]' 
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-700'}`}
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </button>
              )
            ))}
          </nav>

          <div className="mt-4 space-y-3 border-t border-gray-50 pt-4">
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                {userRole === 'admin' 
                  ? <ShieldCheck size={14} className="text-green-700" /> 
                  : <User size={14} className="text-gray-400" />
                }
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{userRole}</p>
              </div>
              <p className="text-xs font-bold text-gray-700 truncate">Usuario Activo</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut size={18} />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"></div>
      )}
    </>
  );
};
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
  FileCheck,
  FileBarChart,
  ChevronRight
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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-green-700 text-white rounded-2xl shadow-xl active:scale-90 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white border-r border-gray-100 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 w-72`}>
        
        <div className="flex flex-col h-full px-6 py-8"> 
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 mb-4 overflow-hidden rounded-[2rem] shadow-2xl shadow-gray-200 border-4 border-gray-50 flex items-center justify-center bg-black transition-transform duration-500 hover:scale-105">
              <img 
                src="/logo.jpeg" 
                alt="Del Sol Market" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-black text-green-700 italic leading-none tracking-tighter uppercase">
                Del Sol
              </h2>
              <p className="text-[10px] font-black text-orange-500 tracking-[0.4em] uppercase mt-1">
                Market
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => (
              item.roles.includes(userRole) && (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition-all duration-300 group
                    ${activeTab === item.id 
                      ? 'bg-green-700 text-white shadow-xl shadow-green-900/20 translate-x-1' 
                      : 'text-gray-400 hover:bg-green-50 hover:text-green-700'}`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} className={activeTab === item.id ? 'animate-pulse' : ''} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
                </button>
              )
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
            <div className="p-4 bg-gray-50 rounded-[1.5rem] border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={14} className="text-green-700" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{userRole}</p>
              </div>
              <p className="text-xs font-black text-gray-700 truncate italic uppercase">Sesión Activa</p>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl font-black text-red-400 hover:bg-red-50 transition-all uppercase text-[9px] tracking-widest"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        ></div>
      )}
    </>
  );
};
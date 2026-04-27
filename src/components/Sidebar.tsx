import { Package, ClipboardList, LayoutDashboard, Settings, Menu, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Lista de navegación actualizada
  const menuItems = [
    { id: 'pos', label: 'Venta/Caja', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'receive', label: 'Carga de Facturas', icon: ClipboardList },
    { id: 'dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <>
      {/* Botón para móviles (solo visible en pantallas pequeñas) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Principal */}
      <aside className={`
        fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 w-64
      `}>
        <div className="flex flex-col h-full px-4 py-6">
          
          {/* Logo del Sistema */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-100">
              <Package size={24} />
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tight">MarketPOS</span>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.02]' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                `}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Información del Usuario al final */}
          <div className="mt-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Sesión Activa</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-gray-700">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Fondo oscuro cuando el menú móvil está abierto */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        ></div>
      )}
    </>
  );
};
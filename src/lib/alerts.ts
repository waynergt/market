import Swal from 'sweetalert2';

// Configuración base con el diseño de Del Sol Market (Tailwind)
const MySwal = Swal.mixin({
  customClass: {
    popup: 'bg-white rounded-[2.5rem] shadow-2xl border border-gray-100',
    title: 'text-2xl font-black italic uppercase tracking-tighter text-gray-800',
    htmlContainer: 'text-gray-500 font-medium',
    confirmButton: 'bg-green-700 hover:bg-green-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-700/20 transition-all mx-2',
    cancelButton: 'bg-red-50 hover:bg-red-100 text-red-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all mx-2',
  },
  buttonsStyling: false, // Desactivamos los estilos feos por defecto
});

// 1. Alerta de Éxito (Verde)
export const alertSuccess = (title: string, text: string = '') => {
  return MySwal.fire({
    icon: 'success',
    title,
    text,
    iconColor: '#15803d', // green-700
    confirmButtonText: '¡Entendido!',
  });
};

// 2. Alerta de Error (Roja)
export const alertError = (title: string, text: string = '') => {
  return MySwal.fire({
    icon: 'error',
    title,
    text,
    iconColor: '#ef4444', // red-500
    confirmButtonText: 'Cerrar',
  });
};

// 3. Alerta de Advertencia/Info (Naranja)
export const alertWarning = (title: string, text: string = '') => {
  return MySwal.fire({
    icon: 'warning',
    title,
    text,
    iconColor: '#f97316', // orange-500
    confirmButtonText: 'Aceptar',
  });
};

// 4. Modal de Confirmación (Preguntas de Sí o No)
export const confirmAction = async (title: string, text: string, confirmText: string = 'Sí, continuar') => {
  const result = await MySwal.fire({
    icon: 'question',
    title,
    text,
    iconColor: '#f97316',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    reverseButtons: true, // Pone el botón de cancelar a la izquierda
  });
  
  return result.isConfirmed; // Retorna true si le dio a Sí, false si canceló
};

// 5. Alerta tipo "Toast" (pequeña notificación en la esquina)
export const toast = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  return MySwal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};
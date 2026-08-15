export default function FloorPlan({ guests, isAdmin, currentGuestId }) {
  // Si es admin, permite ejecutar esta función:
  const handleAssignTable = async (guestId, newTable) => {
    if (!isAdmin) return;
    // Lógica fetch a Supabase para actualizar la mesa...
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5].map(mesaNum => (
        <div key={mesaNum} className="border p-4 rounded-xl">
          <h3>Mesa {mesaNum}</h3>
          <ul>
            {guests.filter(g => g.numero_mesa === mesaNum).map(g => (
              <li 
                key={g.id} 
                // Resalta en dorado si es el invitado que está mirando la pantalla
                className={g.id === currentGuestId ? "text-[#d4af37] font-bold" : "text-white"}
              >
                {g.nombre_invitado}
              </li>
            ))}
          </ul>
          
          {/* Solo visible para Débora en el Admin */}
          {isAdmin && (
             <button>+ Mover invitado aquí</button>
          )}
        </div>
      ))}
    </div>
  );
}
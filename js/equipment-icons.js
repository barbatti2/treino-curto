// Ícones de equipamento (estilo linha, coerente com o restante do app),
// usados na trilha de exercícios dentro de cada ficha em "Treinos".

const wrap = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">${inner}</svg>`;

const ICONS = {
  Barra: wrap(`
    <path d="M4 12h16" />
    <path d="M4 9v6M2 10.5v3" />
    <path d="M20 9v6M22 10.5v3" />
  `),
  "Barra T": wrap(`
    <path d="M12 3v13" />
    <path d="M7 6h10" />
    <rect x="9" y="18" width="6" height="3" rx="0.6" />
  `),
  "Barra W": wrap(`
    <path d="M3 14l3-4 3 4 3-4 3 4 3-4 3 4" />
    <path d="M4 10v3M20 10v3" />
  `),
  Halteres: wrap(`
    <path d="M4 12h16" />
    <rect x="2" y="9.5" width="4" height="5" rx="1.2" />
    <rect x="18" y="9.5" width="4" height="5" rx="1.2" />
  `),
  Cabo: wrap(`
    <circle cx="12" cy="4.5" r="1.8" />
    <path d="M12 6.3V15" />
    <path d="M8 12l4 3 4-3" />
    <path d="M8 20h8" />
  `),
  Máquina: wrap(`
    <rect x="3" y="3.5" width="18" height="12" rx="1.5" />
    <path d="M8 16.5v4M16 16.5v4M6 20.5h12" />
    <path d="M7 8h4M7 11h6" />
  `),
  "Peso corporal": wrap(`
    <circle cx="12" cy="4.5" r="2" />
    <path d="M12 6.5v6" />
    <path d="M8 10h8" />
    <path d="M12 12.5l-4 8M12 12.5l4 8" />
  `),
  Smith: wrap(`
    <path d="M5 3v18M19 3v18" />
    <path d="M5 10h14" />
    <path d="M3 8.5v3M21 8.5v3" />
  `),
  "Ab Wheel": wrap(`
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1.6" />
    <path d="M2.5 12h3M18.5 12h3" />
  `),
  "Banco Romano": wrap(`
    <path d="M4 14h11" />
    <path d="M4 14v5M9 14v5" />
    <path d="M15 14l4-8" />
    <path d="M15 21l1.6-3.2" />
  `),
};

const DEFAULT_ICON = wrap(`<path d="M4 12h16" /><rect x="2" y="9.5" width="4" height="5" rx="1.2" /><rect x="18" y="9.5" width="4" height="5" rx="1.2" />`);

export function iconeEquipamento(equipamento) {
  return ICONS[equipamento] || DEFAULT_ICON;
}

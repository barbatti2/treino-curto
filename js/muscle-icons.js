// Ícones de silhueta do corpo por grupo muscular (viewBox 0 0 40 60)
// A silhueta inteira aparece em tom neutro; a região do grupo trabalhado
// é destacada na cor clay, como um "mapa muscular".

const BODY_COLOR = "#4A4A50";
const BODY_STROKE = "#2B2B2F";
const HL_COLOR = "#C9482F";
const HL_STROKE = "#8f3420";

// Silhueta base: cabeça, pescoço, tronco, ombros, braços, quadril e coxas
const BODY = `
  <circle cx="20" cy="7" r="5" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="17" y="10.5" width="6" height="5" rx="2" fill="${BODY_COLOR}"/>
  <circle cx="7" cy="17.5" r="4.5" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <circle cx="33" cy="17.5" r="4.5" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="2.5" y="17.5" width="6" height="17" rx="3" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="31.5" y="17.5" width="6" height="17" rx="3" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="9" y="14" width="22" height="23" rx="9" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="9" y="35.5" width="22" height="11" rx="6" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="10" y="44.5" width="8.5" height="14.5" rx="4" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
  <rect x="21.5" y="44.5" width="8.5" height="14.5" rx="4" fill="${BODY_COLOR}" stroke="${BODY_STROKE}" stroke-width="0.5"/>
`;

const svg = (highlight) =>
  `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">${BODY}${highlight}</svg>`;

export const MUSCLE_ICONS = {
  peito: svg(`
    <ellipse cx="14.5" cy="20.5" rx="6" ry="5.5" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <ellipse cx="25.5" cy="20.5" rx="6" ry="5.5" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  costas: svg(`
    <path d="M10,15 L30,15 C29,22 27,29 25,35 L15,35 C13,29 11,22 10,15 Z" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <path d="M20,16 L20,34" stroke="${HL_STROKE}" stroke-width="0.6"/>
  `),
  ombro: svg(`
    <circle cx="7" cy="17.5" r="5" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <circle cx="33" cy="17.5" r="5" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  biceps: svg(`
    <rect x="2.5" y="17.5" width="6" height="11.5" rx="3" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <rect x="31.5" y="17.5" width="6" height="11.5" rx="3" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  triceps: svg(`
    <rect x="2.5" y="24" width="6" height="10.5" rx="3" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <rect x="31.5" y="24" width="6" height="10.5" rx="3" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  perna: svg(`
    <rect x="10" y="44.5" width="8.5" height="14.5" rx="4" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <rect x="21.5" y="44.5" width="8.5" height="14.5" rx="4" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  gluteo_posterior: svg(`
    <rect x="9" y="35.5" width="22" height="11" rx="6" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
  `),
  abdomen: svg(`
    <rect x="13" y="27" width="14" height="9.5" rx="3" fill="${HL_COLOR}" stroke="${HL_STROKE}" stroke-width="0.5"/>
    <path d="M20,27 L20,36.5 M13,31.7 L27,31.7" stroke="${HL_STROKE}" stroke-width="0.6"/>
  `),
};

export function iconeGrupo(grupoId) {
  return MUSCLE_ICONS[grupoId] || MUSCLE_ICONS.peito;
}

// Descobre o grupo muscular predominante de uma ficha a partir dos exercícios que ela contém.
export function grupoPrincipalFicha(ficha, EXERCISES) {
  const contagem = {};
  for (const ex of ficha.exercicios || []) {
    const g = EXERCISES[ex.exercicioId]?.grupo;
    if (!g) continue;
    contagem[g] = (contagem[g] || 0) + 1;
  }
  let melhor = null;
  let max = 0;
  for (const [g, c] of Object.entries(contagem)) {
    if (c > max) {
      max = c;
      melhor = g;
    }
  }
  return melhor;
}

// Ícones padronizados por grupo muscular (line-art, viewBox 0 0 48 48)
// Usados nos cards de treino salvo para indicar visualmente o foco do treino.

const svg = (paths) =>
  `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">${paths}</svg>`;

export const MUSCLE_ICONS = {
  peito: svg(`
    <path d="M16 6c-3.2 0-5.7 2.7-5.4 5.9.2 2 1.4 3.1 1.4 5.1v17c0 4.4 4.9 8 12 8s12-3.6 12-8v-17c0-2 1.2-3.1 1.4-5.1.3-3.2-2.2-5.9-5.4-5.9-2.6 0-4.6 2.4-7 2.4s-4.4-2.4-7-2.4Z"/>
    <path d="M13 19c3 4 6 5.5 11 5.5s8-1.5 11-5.5"/>
  `),
  costas: svg(`
    <path d="M15 8c-3.4 1.4-6 4.5-6 9v14c0 6 6.5 9 15 9s15-3 15-9V17c0-4.5-2.6-7.6-6-9"/>
    <path d="M24 8v32"/>
    <path d="M15 12 21 34"/>
    <path d="M33 12 27 34"/>
  `),
  ombro: svg(`
    <circle cx="12.5" cy="15" r="6"/>
    <circle cx="35.5" cy="15" r="6"/>
    <path d="M17 18c2.5 3 4.5 4 7 4s4.5-1 7-4"/>
    <path d="M14 20v9c0 6 4.5 9 10 9s10-3 10-9v-9"/>
  `),
  biceps: svg(`
    <path d="M30 8c-5 0-9 3-9 8v6"/>
    <path d="M14 42c0-7 2.5-11 7-13"/>
    <path d="M21 22c-2 6 0 11 6 13"/>
    <path d="M14 30c-2 3-2 8 0 12"/>
    <path d="M20 14c1 4 1 7-1 8"/>
  `),
  triceps: svg(`
    <path d="M20 8c5 0 9 3 9 8v20c0 4-3 6-5 6"/>
    <path d="M29 20c3 1 5 3 5 7v4c0 3-1 6-3 8"/>
    <path d="M18 10c-1.5 4 0 8 3 9.5"/>
  `),
  perna: svg(`
    <path d="M19 6c-4 0-6.5 2.7-6.2 6.4l.7 8.6-2 20h6l2.2-16.5L22 41h6l-1.4-19 .8-9c.3-3.7-2.2-6.4-6.2-6.4Z"/>
    <path d="M18 11v13"/>
  `),
  gluteo_posterior: svg(`
    <path d="M13 12c0-3.3 2.7-6 7-6h4c4.3 0 7 2.7 7 6 0 3.6-1.6 6.2-4 8"/>
    <path d="M13 12c-1.2 4.4-.4 8 2.5 10.5"/>
    <path d="M16 22c-2.5 3-3.5 8-2 12s3 6 3 8h5l1-11 1 11h5c0-3 2-5 2.5-9s-1-9-6-11"/>
  `),
  abdomen: svg(`
    <rect x="14" y="8" width="20" height="32" rx="8"/>
    <path d="M24 10v28"/>
    <path d="M16.5 18h15"/>
    <path d="M16 26h16"/>
    <path d="M17 34h14"/>
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

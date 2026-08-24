import { listarFichas, listarHistorico } from "../firebase.js";
import { state } from "../state.js";
import {
  icons,
  semanaAtual,
  diasTreinadosSet,
  calcularStreak,
  dateKey,
  DIAS_SEMANA_CURTO,
  subtituloDataHoje,
} from "../utils.js";
import { iniciarExecucao } from "./execute.js";
import { irPara, definirTitulo } from "../router.js";

export async function renderHome() {
  const el = document.getElementById("screen-home");
  definirTitulo("Hoje", subtituloDataHoje());
  el.innerHTML = `<p class="text-muted text-sm py-10 text-center">Carregando…</p>`;

  const [fichas, historico] = await Promise.all([
    listarFichas(state.perfilId),
    listarHistorico(state.perfilId),
  ]);
  state.fichas = fichas;
  state.historico = historico;

  const streak = calcularStreak(historico);
  const treinados = diasTreinadosSet(historico);
  const semana = semanaAtual();
  const hojeKey = dateKey(new Date());

  const tiraSemana = semana
    .map((d) => {
      const key = dateKey(d);
      const treinou = treinados.has(key);
      const ehHoje = key === hojeKey;
      return `
        <div class="flex flex-col items-center gap-2">
          <span class="text-[11px] font-bold ${ehHoje ? "text-clay" : "text-muted"}">${DIAS_SEMANA_CURTO[d.getDay()]}</span>
          <div class="day-pill ${treinou ? "day-pill--treinado" : ehHoje ? "day-pill--hoje" : ""}">
            <span class="day-pill__dot">${treinou ? '<i data-lucide="check" class="w-3 h-3"></i>' : ""}</span>
          </div>
        </div>`;
    })
    .join("");

  const listaFichas = fichas.length
    ? fichas
        .map(
          (f) => `
        <button data-id="${f.id}" class="ficha-iniciar w-full bg-card border border-hairline rounded-2xl p-4 flex items-center justify-between text-left active:scale-[0.98] transition-transform">
          <div>
            <p class="font-bold text-ink">${f.nome}</p>
            <p class="text-muted text-xs mt-0.5">${f.exercicios.length} exercício${f.exercicios.length === 1 ? "" : "s"}${f.dia ? " · " + f.dia : ""}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-clay flex items-center justify-center shrink-0">
            <i data-lucide="play" class="w-4 h-4 text-ink"></i>
          </div>
        </button>`
        )
        .join("")
    : `<div class="text-center py-10">
         <p class="text-muted text-sm mb-4">Você ainda não tem fichas de treino.</p>
         <button id="ir-criar" class="bg-clay text-ink font-bold rounded-full px-6 py-3 active:scale-95 transition-transform">Criar ficha</button>
       </div>`;

  el.innerHTML = `
    <div class="bg-card border border-hairline rounded-2xl p-5 mb-7">
      <p class="text-muted text-xs font-bold uppercase tracking-[0.15em] mb-4">Sequência de treinos</p>
      <div class="flex items-center gap-4">
        <i data-lucide="flame" class="w-11 h-11 text-clay shrink-0"></i>
        <p class="font-display text-5xl leading-none">${streak}</p>
        <p class="text-sm font-extrabold uppercase leading-tight text-ink">Dias<br />seguidos<br />treinando</p>
      </div>
    </div>

    <p class="text-muted text-xs font-bold uppercase tracking-[0.15em] text-center mb-4">Últimos 7 dias</p>
    <div class="flex justify-between mb-8 px-1">${tiraSemana}</div>

    <h2 class="font-display uppercase text-2xl tracking-tight mb-3">Treinar agora</h2>
    <div class="flex flex-col gap-3 mb-6">${listaFichas}</div>
  `;

  icons();

  el.querySelectorAll(".ficha-iniciar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ficha = fichas.find((f) => f.id === btn.dataset.id);
      iniciarExecucao(ficha);
    });
  });

  const irCriar = el.querySelector("#ir-criar");
  if (irCriar) irCriar.addEventListener("click", () => irPara("create"));
}

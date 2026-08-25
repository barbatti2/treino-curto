import { listarFichas, listarHistorico } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import {
  icons,
  semanaAtual,
  diasTreinadosSet,
  calcularStreak,
  dateKey,
  toDate,
  DIAS_SEMANA_CURTO,
  subtituloDataHoje,
} from "../utils.js";
import { iniciarExecucao } from "./execute.js";
import { irPara, definirTitulo } from "../router.js";

export async function renderHome() {
  definirTitulo("Hoje", subtituloDataHoje());
  const perfilId = state.perfilId;
  const c = getPerfilCache(perfilId);

  if (c.fichas && c.historico) {
    desenharHome(c.fichas, c.historico);
  } else {
    document.getElementById("screen-home").innerHTML = `<p class="text-muted text-sm py-10 text-center">Carregando…</p>`;
  }

  const [fichas, historico] = await Promise.all([listarFichas(perfilId), listarHistorico(perfilId)]);
  if (state.perfilId !== perfilId) return; // perfil trocou enquanto carregava
  c.fichas = fichas;
  c.historico = historico;
  desenharHome(fichas, historico);
}

function desenharHome(fichas, historico) {
  const el = document.getElementById("screen-home");

  const streak = calcularStreak(historico);
  const treinados = diasTreinadosSet(historico);
  const semana = semanaAtual();
  const hojeKey = dateKey(new Date());
  const fichasConcluidasHoje = new Set(
    historico.filter((h) => dateKey(toDate(h.concluidoEm)) === hojeKey).map((h) => h.templateId)
  );

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
        .map((f) => {
          const concluida = fichasConcluidasHoje.has(f.id);
          return `
        <button data-id="${f.id}" class="ficha-iniciar w-full border rounded-2xl p-4 flex items-center justify-between text-left active:scale-[0.98] transition-transform
          ${concluida ? "bg-claySoft/20 border-emerald/40" : "bg-card border-hairline"}">
          <div>
            <p class="font-bold text-ink">${f.nome}</p>
            <p class="text-xs mt-0.5 ${concluida ? "text-emerald font-bold" : "text-muted"}">
              ${concluida ? "Concluído hoje" : `${f.exercicios.length} exercício${f.exercicios.length === 1 ? "" : "s"}${f.dia ? " · " + f.dia : ""}`}
            </p>
          </div>
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${concluida ? "bg-emerald" : "bg-clay"}">
            <i data-lucide="${concluida ? "check" : "play"}" class="w-4 h-4 text-ink"></i>
          </div>
        </button>`;
        })
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
      if (fichasConcluidasHoje.has(ficha.id)) {
        if (!confirm(`Você já concluiu "${ficha.nome}" hoje. Quer treinar novamente?`)) return;
      }
      iniciarExecucao(ficha);
    });
  });

  const irCriar = el.querySelector("#ir-criar");
  if (irCriar) irCriar.addEventListener("click", () => irPara("create"));
}

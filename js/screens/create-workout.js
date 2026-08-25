import { GROUPS, EXERCISES } from "../exercises-data.js";
import { criarFicha } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast, DIAS_SEMANA } from "../utils.js";
import { irPara } from "../router.js";
import { renderWorkouts } from "./workouts.js";

const DIAS_OPCOES = [
  { nome: "Segunda", letra: "S" },
  { nome: "Terça", letra: "T" },
  { nome: "Quarta", letra: "Q" },
  { nome: "Quinta", letra: "Q" },
  { nome: "Sexta", letra: "S" },
  { nome: "Sábado", letra: "S" },
  { nome: "Domingo", letra: "D" },
];

let selecionados = new Map(); // exercicioId -> { series, reps }
let diaEscolhido = null;

export function renderCreateWorkout() {
  selecionados = new Map();
  diaEscolhido = null;

  const el = document.getElementById("screen-create");

  const gruposHtml = GROUPS.map((g, gi) => {
    const exs = Object.entries(EXERCISES).filter(([, e]) => e.grupo === g.id);
    return `
      <div class="mb-3 border border-hairline rounded-2xl overflow-hidden">
        <button type="button" class="group-header w-full px-4 py-3.5 bg-card" data-group="${gi}">
          <span class="text-sm font-extrabold uppercase tracking-wide">${g.nome}</span>
          <span class="flex items-center gap-2">
            <span class="text-muted text-xs font-bold group-count" data-group-count="${gi}"></span>
            <i data-lucide="chevron-down" class="w-[18px] h-[18px] text-muted group-chevron"></i>
          </span>
        </button>
        <div class="group-body" data-group-body="${gi}">
          <div class="flex flex-col gap-2 p-3 pt-1">
            ${exs
              .map(
                ([id, e]) => `
              <div class="exercise-row" data-id="${id}">
                <button type="button" class="ex-toggle w-full flex items-center gap-3 p-2.5 text-left">
                  <img src="${e.imagem}" loading="lazy" class="w-11 h-11 rounded-lg object-cover bg-paper shrink-0" />
                  <span class="flex-1 text-sm font-semibold">${e.nome}</span>
                  <i data-lucide="plus" class="w-[18px] h-[18px] text-muted ex-icon shrink-0"></i>
                </button>
                <div class="ex-detalhe hidden px-3 pb-3 gap-3">
                  <label class="flex-1">
                    <span class="text-[11px] text-muted font-bold">Séries</span>
                    <input type="number" min="1" value="3" class="in-series w-full bg-paper border border-hairline rounded-xl px-3 py-2 mt-1 text-sm outline-none focus:border-clay" />
                  </label>
                  <label class="flex-1">
                    <span class="text-[11px] text-muted font-bold">Repetições</span>
                    <input type="number" min="1" value="12" class="in-reps w-full bg-paper border border-hairline rounded-xl px-3 py-2 mt-1 text-sm outline-none focus:border-clay" />
                  </label>
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>`;
  }).join("");

  el.innerHTML = `
    <div class="flex items-center gap-3 mb-6">
      <button id="btn-voltar" class="text-muted p-1"><i data-lucide="chevron-left" class="w-7 h-7"></i></button>
      <h2 class="font-display uppercase text-4xl tracking-tight leading-none">Novo treino</h2>
    </div>

    <label class="block mb-5">
      <span class="text-xs text-muted font-bold uppercase tracking-wide">Nome do treino</span>
      <input id="in-nome" type="text" placeholder="Ex: Treino A — Peito e Tríceps"
        class="w-full bg-card border border-hairline rounded-2xl px-4 py-3.5 mt-2 outline-none focus:border-clay" />
    </label>

    <div class="mb-6">
      <span class="text-xs text-muted font-bold uppercase tracking-wide">Dia da semana (opcional)</span>
      <button type="button" data-dia="" class="chip dia-chip selected w-full mt-2">Sem dia fixo</button>
      <div class="grid grid-cols-7 gap-1.5 mt-2" id="dias-chips">
        ${DIAS_OPCOES.map((d) => `<button type="button" data-dia="${d.nome}" title="${d.nome}" class="dia-square dia-chip w-full aspect-square">${d.letra}</button>`).join("")}
      </div>
    </div>

    <div class="mb-4">
      <span class="text-xs text-muted font-bold uppercase tracking-wide">Exercícios</span>
      <p class="text-muted text-xs mt-1 mb-4" id="contador-selecionados">Nenhum exercício selecionado</p>
      ${gruposHtml}
    </div>

    <button id="btn-salvar" class="w-full bg-clay text-ink font-bold rounded-full py-4 mb-8 active:scale-95 transition-transform disabled:opacity-40" disabled>
      Salvar treino
    </button>
  `;

  icons();

  el.querySelector("#btn-voltar").addEventListener("click", () => irPara("workouts"));

  el.querySelectorAll(".group-header").forEach((header) => {
    const body = el.querySelector(`[data-group-body="${header.dataset.group}"]`);
    header.addEventListener("click", () => {
      const abrir = !header.classList.contains("open");
      header.classList.toggle("open", abrir);
      body.classList.toggle("open", abrir);
    });
  });

  el.querySelectorAll(".dia-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      el.querySelectorAll(".dia-chip").forEach((c) => c.classList.remove("selected"));
      chip.classList.add("selected");
      diaEscolhido = chip.dataset.dia || null;
    });
  });

  el.querySelectorAll(".ex-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".exercise-row");
      const id = row.dataset.id;
      const detalhe = row.querySelector(".ex-detalhe");
      const icon = row.querySelector(".ex-icon");

      if (selecionados.has(id)) {
        selecionados.delete(id);
        row.classList.remove("selected");
        detalhe.classList.add("hidden");
        detalhe.classList.remove("flex");
        icon.setAttribute("data-lucide", "plus");
      } else {
        const series = row.querySelector(".in-series").value || 3;
        const reps = row.querySelector(".in-reps").value || 12;
        selecionados.set(id, { series: Number(series), reps: Number(reps) });
        row.classList.add("selected");
        detalhe.classList.remove("hidden");
        detalhe.classList.add("flex");
        icon.setAttribute("data-lucide", "check");
      }
      icons();
      atualizarContador(el);
      atualizarContadoresGrupo(el);
    });
  });

  el.querySelectorAll(".in-series, .in-reps").forEach((input) => {
    input.addEventListener("input", () => {
      const row = input.closest(".exercise-row");
      const id = row.dataset.id;
      if (!selecionados.has(id)) return;
      const series = Number(row.querySelector(".in-series").value || 1);
      const reps = Number(row.querySelector(".in-reps").value || 1);
      selecionados.set(id, { series, reps });
    });
  });

  el.querySelector("#in-nome").addEventListener("input", () => atualizarContador(el));

  el.querySelector("#btn-salvar").addEventListener("click", async () => {
    const nome = el.querySelector("#in-nome").value.trim();
    if (!nome || selecionados.size === 0) return;

    const exercicios = Array.from(selecionados.entries()).map(([id, v]) => ({
      exercicioId: id,
      nome: EXERCISES[id].nome,
      imagem: EXERCISES[id].imagem,
      series: v.series,
      reps: v.reps,
    }));

    const btn = el.querySelector("#btn-salvar");
    btn.disabled = true;
    btn.textContent = "Salvando…";

    const ref = await criarFicha(state.perfilId, { nome, dia: diaEscolhido, exercicios });
    const c = getPerfilCache(state.perfilId);
    const novaFicha = { id: ref.id, nome, dia: diaEscolhido, exercicios, criadoEm: new Date() };
    c.fichas = c.fichas ? [novaFicha, ...c.fichas] : [novaFicha];

    showToast("Treino criado", "success");
    irPara("workouts");
    renderWorkouts();
  });

  atualizarContador(el);
  atualizarContadoresGrupo(el);
}

function atualizarContador(el) {
  const nome = el.querySelector("#in-nome").value.trim();
  const n = selecionados.size;
  el.querySelector("#contador-selecionados").textContent =
    n === 0 ? "Nenhum exercício selecionado" : `${n} exercício${n === 1 ? "" : "s"} selecionado${n === 1 ? "" : "s"}`;
  el.querySelector("#btn-salvar").disabled = !(nome && n > 0);
}

function atualizarContadoresGrupo(el) {
  el.querySelectorAll(".group-body").forEach((body) => {
    const n = body.querySelectorAll(".exercise-row.selected").length;
    const badge = el.querySelector(`[data-group-count="${body.dataset.groupBody}"]`);
    if (badge) badge.textContent = n > 0 ? `${n} selecionado${n === 1 ? "" : "s"}` : "";
  });
}

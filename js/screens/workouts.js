import { listarFichas, excluirFicha } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast } from "../utils.js";
import { irPara } from "../router.js";
import { EXERCISES } from "../exercises-data.js";
import { iconeEquipamento } from "../equipment-icons.js";

export async function renderWorkouts() {
  const perfilId = state.perfilId;
  const c = getPerfilCache(perfilId);

  if (c.fichas) {
    desenharWorkouts(c.fichas);
  } else {
    document.getElementById("screen-workouts").innerHTML = `<p class="text-muted text-sm py-10 text-center">Carregando…</p>`;
  }

  const fichas = await listarFichas(perfilId);
  if (state.perfilId !== perfilId) return;
  c.fichas = fichas;
  desenharWorkouts(fichas);
}

function desenharWorkouts(fichas) {
  const el = document.getElementById("screen-workouts");

  el.innerHTML = `
    <button id="btn-nova-ficha" aria-label="Novo treino" class="inline-flex bg-clay text-ink font-extrabold uppercase tracking-wide text-sm rounded-full py-2.5 px-5 mb-6 items-center justify-center gap-2 active:scale-95 transition-transform">
      <i data-lucide="plus" class="w-4 h-4"></i>
      Novo treino
    </button>
    <div class="flex flex-col gap-3" id="lista-fichas">
      ${
        fichas.length
          ? fichas
              .map(
                (f) => `
        <div class="bg-card border border-hairline rounded-2xl overflow-hidden">
          <div role="button" tabindex="0" class="ficha-header w-full p-4 cursor-pointer flex items-center gap-3" data-ficha="${f.id}">
            <div class="w-12 h-12 rounded-xl bg-claySoft/40 text-clay shrink-0 flex items-center justify-center">
              <i data-lucide="dumbbell" class="w-6 h-6"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold uppercase truncate">${f.nome}</p>
              <p class="text-muted text-xs mt-0.5">${f.exercicios.length} exercício${f.exercicios.length === 1 ? "" : "s"}${f.dia ? " · " + f.dia : " · sem dia fixo"}</p>
            </div>
            <i data-lucide="chevron-right" class="w-5 h-5 text-muted shrink-0 ficha-chevron"></i>
          </div>
          <div class="group-body" data-ficha-body="${f.id}">
            <div class="flex flex-col gap-2 px-4 pb-4 pt-0">
              ${f.exercicios
                .map((ex) => {
                  const equipamento = EXERCISES[ex.exercicioId]?.equipamento;
                  return `
                <div class="flex items-center gap-3 bg-paper border border-hairline rounded-xl py-2.5 px-3">
                  <div class="w-10 h-10 rounded-full bg-card border border-hairline text-muted shrink-0 flex items-center justify-center">${iconeEquipamento(equipamento)}</div>
                  <span class="flex-1 text-sm font-semibold truncate">${ex.nome}</span>
                  <div class="shrink-0 flex flex-col items-center justify-center bg-paper border border-hairline rounded-lg px-2.5 py-1 min-w-[3.5rem]">
                    <span class="text-sm font-extrabold text-clay leading-none">${ex.series}<span class="text-muted font-bold">×</span>${ex.reps}</span>
                    <span class="text-[9px] text-muted font-bold uppercase tracking-wide mt-0.5">séries×reps</span>
                  </div>
                </div>`;
                })
                .join("")}
              <button type="button" data-id="${f.id}" class="btn-excluir-ficha mt-1 flex items-center justify-center gap-2 text-clay text-sm font-bold py-2.5">
                <i data-lucide="trash-2" class="w-[16px] h-[16px]"></i> Excluir treino
              </button>
            </div>
          </div>
        </div>`
              )
              .join("")
          : `<p class="text-muted text-sm text-center py-10">Nenhum treino criado ainda.</p>`
      }
    </div>
  `;

  icons();

  el.querySelector("#btn-nova-ficha").addEventListener("click", () => irPara("create"));

  el.querySelectorAll(".ficha-header").forEach((header) => {
    const body = el.querySelector(`[data-ficha-body="${header.dataset.ficha}"]`);
    header.addEventListener("click", () => {
      body.classList.toggle("open");
      header.classList.toggle("open");
    });
  });

  el.querySelectorAll(".btn-excluir-ficha").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Excluir este treino? Essa ação não pode ser desfeita.")) return;
      const c = getPerfilCache(state.perfilId);
      await excluirFicha(state.perfilId, btn.dataset.id);
      if (c.fichas) c.fichas = c.fichas.filter((f) => f.id !== btn.dataset.id);
      showToast("Treino excluído");
      desenharWorkouts(c.fichas || []);
    });
  });
}

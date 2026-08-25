import { listarFichas, excluirFicha } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast } from "../utils.js";
import { irPara } from "../router.js";

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
    <div class="flex justify-center mb-6">
      <button id="btn-nova-ficha" class="bg-clay text-ink font-bold text-sm rounded-full px-5 py-2.5 flex items-center gap-1.5 active:scale-95 transition-transform">
        <i data-lucide="plus" class="w-4 h-4"></i> Nova ficha
      </button>
    </div>
    <div class="flex flex-col gap-3" id="lista-fichas">
      ${
        fichas.length
          ? fichas
              .map(
                (f) => `
        <div class="bg-card border border-hairline rounded-2xl overflow-hidden">
          <div role="button" tabindex="0" class="ficha-header w-full p-4 cursor-pointer" data-ficha="${f.id}">
            <p class="font-bold">${f.nome}</p>
            <p class="text-muted text-xs mt-0.5">${f.exercicios.length} exercício${f.exercicios.length === 1 ? "" : "s"}${f.dia ? " · " + f.dia : " · sem dia fixo"}</p>
          </div>
          <div class="group-body" data-ficha-body="${f.id}">
            <div class="flex flex-col gap-2 px-4 pb-4 pt-0">
              ${f.exercicios
                .map(
                  (ex) => `
                <div class="flex items-center gap-3 bg-paper border border-hairline rounded-xl p-2.5">
                  <img src="${ex.imagem}" loading="lazy" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                  <span class="flex-1 text-sm font-semibold">${ex.nome}</span>
                  <span class="text-xs text-muted font-bold shrink-0">${ex.series}x${ex.reps}</span>
                </div>`
                )
                .join("")}
              <button type="button" data-id="${f.id}" class="btn-excluir-ficha mt-1 flex items-center justify-center gap-2 text-clay text-sm font-bold py-2.5">
                <i data-lucide="trash-2" class="w-[16px] h-[16px]"></i> Excluir ficha
              </button>
            </div>
          </div>
        </div>`
              )
              .join("")
          : `<p class="text-muted text-sm text-center py-10">Nenhuma ficha criada ainda.</p>`
      }
    </div>
  `;

  icons();

  el.querySelector("#btn-nova-ficha").addEventListener("click", () => irPara("create"));

  el.querySelectorAll(".ficha-header").forEach((header) => {
    const body = el.querySelector(`[data-ficha-body="${header.dataset.ficha}"]`);
    header.addEventListener("click", () => {
      body.classList.toggle("open");
    });
  });

  el.querySelectorAll(".btn-excluir-ficha").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Excluir esta ficha? Essa ação não pode ser desfeita.")) return;
      const c = getPerfilCache(state.perfilId);
      await excluirFicha(state.perfilId, btn.dataset.id);
      if (c.fichas) c.fichas = c.fichas.filter((f) => f.id !== btn.dataset.id);
      showToast("Ficha excluída");
      desenharWorkouts(c.fichas || []);
    });
  });
}

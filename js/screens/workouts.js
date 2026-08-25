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
    <button id="btn-nova-ficha" class="w-full bg-clay text-ink font-bold rounded-2xl py-4 mb-6 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
      <i data-lucide="plus" class="w-5 h-5"></i> Nova ficha
    </button>
    <div class="flex flex-col gap-3" id="lista-fichas">
      ${
        fichas.length
          ? fichas
              .map(
                (f) => `
        <div class="bg-card border border-hairline rounded-2xl p-4">
          <div class="flex items-start justify-between">
            <div>
              <p class="font-bold">${f.nome}</p>
              <p class="text-muted text-xs mt-0.5">${f.exercicios.length} exercício${f.exercicios.length === 1 ? "" : "s"}${f.dia ? " · " + f.dia : " · sem dia fixo"}</p>
            </div>
            <button data-id="${f.id}" class="btn-excluir-ficha text-muted active:text-clay p-1">
              <i data-lucide="trash-2" class="w-[18px] h-[18px]"></i>
            </button>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-3">
            ${f.exercicios
              .slice(0, 4)
              .map((e) => `<span class="text-[11px] text-muted bg-paper border border-hairline rounded-full px-2.5 py-1">${e.nome}</span>`)
              .join("")}
            ${f.exercicios.length > 4 ? `<span class="text-[11px] text-muted px-1 py-1">+${f.exercicios.length - 4}</span>` : ""}
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

  el.querySelectorAll(".btn-excluir-ficha").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Excluir esta ficha? Essa ação não pode ser desfeita.")) return;
      const c = getPerfilCache(state.perfilId);
      await excluirFicha(state.perfilId, btn.dataset.id);
      if (c.fichas) c.fichas = c.fichas.filter((f) => f.id !== btn.dataset.id);
      showToast("Ficha excluída");
      desenharWorkouts(c.fichas || []);
    });
  });
}

import { listarHistorico, excluirRegistroHistorico } from "../firebase.js";
import { state } from "../state.js";
import { icons, showToast, agruparHistoricoPorDia, toDate } from "../utils.js";

export async function renderHistory() {
  const el = document.getElementById("screen-history");
  el.innerHTML = `<p class="text-muted text-sm py-10 text-center">Carregando…</p>`;

  const historico = await listarHistorico(state.perfilId);
  state.historico = historico;

  if (!historico.length) {
    el.innerHTML = `<p class="text-muted text-sm text-center py-10">Nenhum treino concluído ainda.</p>`;
    return;
  }

  const grupos = agruparHistoricoPorDia(historico);

  el.innerHTML = Array.from(grupos.entries())
    .map(
      ([label, registros]) => `
      <div class="mb-6">
        <h3 class="text-muted text-xs font-bold uppercase tracking-wide mb-2">${label}</h3>
        <div class="flex flex-col gap-2">
          ${registros
            .map((r) => {
              const hora = toDate(r.concluidoEm)?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) || "";
              return `
            <div class="bg-card border border-hairline rounded-2xl p-4 flex items-start justify-between">
              <div>
                <p class="font-bold text-sm">${r.templateNome}</p>
                <p class="text-muted text-xs mt-0.5">${r.exercicios.length} exercícios · ${hora}</p>
              </div>
              <button data-id="${r.id}" class="btn-excluir-historico text-muted active:text-clay p-1">
                <i data-lucide="trash-2" class="w-[18px] h-[18px]"></i>
              </button>
            </div>`;
            })
            .join("")}
        </div>
      </div>`
    )
    .join("");

  icons();

  el.querySelectorAll(".btn-excluir-historico").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Excluir este registro do histórico?")) return;
      await excluirRegistroHistorico(state.perfilId, btn.dataset.id);
      showToast("Registro excluído");
      renderHistory();
    });
  });
}

import { listarHistorico, excluirRegistroHistorico } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast, agruparHistoricoPorDia, toDate } from "../utils.js";
import { EXERCISES } from "../exercises-data.js";
import { iconeEquipamento } from "../equipment-icons.js";

export async function renderHistory() {
  const perfilId = state.perfilId;
  const c = getPerfilCache(perfilId);

  if (c.historico) {
    desenharHistory(c.historico);
  } else {
    document.getElementById("screen-history").innerHTML = `<p class="text-muted text-sm py-10 text-center">Carregando…</p>`;
  }

  const historico = await listarHistorico(perfilId);
  if (state.perfilId !== perfilId) return;
  c.historico = historico;
  desenharHistory(historico);
}

function desenharHistory(historico) {
  const el = document.getElementById("screen-history");

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
            <div class="bg-card border border-hairline rounded-2xl overflow-hidden">
              <div role="button" tabindex="0" class="registro-header w-full p-4 cursor-pointer" data-registro="${r.id}">
                <p class="font-bold text-sm">${r.templateNome}</p>
                <p class="text-muted text-xs mt-0.5">${r.exercicios.length} exercícios · ${hora}</p>
              </div>
              <div class="group-body" data-registro-body="${r.id}">
                <div class="flex flex-col gap-2 px-4 pb-4 pt-0">
                  ${r.exercicios
                    .map((ex) => {
                      const equipamento = EXERCISES[ex.exercicioId]?.equipamento;
                      return `
                    <div class="flex items-center gap-3 bg-paper border border-hairline rounded-xl p-2.5">
                      <div class="w-10 h-10 rounded-full bg-card border border-hairline text-muted shrink-0 flex items-center justify-center">${iconeEquipamento(equipamento)}</div>
                      <span class="flex-1 text-sm font-semibold">${ex.nome}</span>
                      <div class="shrink-0 flex flex-col items-center justify-center bg-paper border border-hairline rounded-lg px-2.5 py-1 min-w-[3.5rem]">
                        <span class="text-sm font-extrabold text-clay leading-none">${ex.series}<span class="text-muted font-bold">×</span>${ex.reps}</span>
                        <span class="text-[9px] text-muted font-bold uppercase tracking-wide mt-0.5">séries×reps</span>
                      </div>
                    </div>`;
                    })
                    .join("")}
                  <button type="button" data-id="${r.id}" class="btn-excluir-historico mt-1 flex items-center justify-center gap-2 text-clay text-sm font-bold py-2.5">
                    <i data-lucide="trash-2" class="w-[16px] h-[16px]"></i> Excluir registro
                  </button>
                </div>
              </div>
            </div>`;
            })
            .join("")}
        </div>
      </div>`
    )
    .join("");

  icons();

  el.querySelectorAll(".registro-header").forEach((header) => {
    const body = el.querySelector(`[data-registro-body="${header.dataset.registro}"]`);
    header.addEventListener("click", () => {
      body.classList.toggle("open");
    });
  });

  el.querySelectorAll(".btn-excluir-historico").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm("Excluir este registro do histórico?")) return;
      const c = getPerfilCache(state.perfilId);
      await excluirRegistroHistorico(state.perfilId, btn.dataset.id);
      if (c.historico) c.historico = c.historico.filter((h) => h.id !== btn.dataset.id);
      showToast("Registro excluído");
      desenharHistory(c.historico || []);
    });
  });
}

import { listarHistorico, excluirRegistroHistorico } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast, agruparHistoricoPorDia, toDate } from "../utils.js";

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
              <button type="button" class="registro-header w-full flex items-center justify-between p-4 text-left" data-registro="${r.id}">
                <div>
                  <p class="font-bold text-sm">${r.templateNome}</p>
                  <p class="text-muted text-xs mt-0.5">${r.exercicios.length} exercícios · ${hora}</p>
                </div>
                <div class="flex items-center gap-1">
                  <button data-id="${r.id}" class="btn-excluir-historico text-muted active:text-clay p-1.5">
                    <i data-lucide="trash-2" class="w-[18px] h-[18px]"></i>
                  </button>
                  <i data-lucide="chevron-down" class="w-[18px] h-[18px] text-muted group-chevron registro-chevron"></i>
                </div>
              </button>
              <div class="group-body" data-registro-body="${r.id}">
                <div class="flex flex-col gap-2 px-4 pb-4 pt-0">
                  ${r.exercicios
                    .map(
                      (ex) => `
                    <div class="flex items-center gap-3 bg-paper border border-hairline rounded-xl p-2.5">
                      <img src="${ex.imagem}" loading="lazy" class="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <span class="flex-1 text-sm font-semibold">${ex.nome}</span>
                      <span class="text-xs text-muted font-bold shrink-0">${ex.series}x${ex.reps}</span>
                    </div>`
                    )
                    .join("")}
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
    const chevron = header.querySelector(".registro-chevron");
    header.addEventListener("click", (e) => {
      if (e.target.closest(".btn-excluir-historico")) return;
      const abrir = !body.classList.contains("open");
      body.classList.toggle("open", abrir);
      chevron.classList.toggle("rotate-180", abrir);
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

import { registrarTreinoConcluido } from "../firebase.js";
import { EXERCISES } from "../exercises-data.js";
import { DICAS_POR_GRUPO, DICA_PADRAO } from "../dicas.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast, dividirNomeExercicio } from "../utils.js";
import { irPara, atualizarNavVisibilidade } from "../router.js";
import { renderHome } from "./home.js";

export function iniciarExecucao(ficha) {
  state.execucao = {
    ficha,
    indice: 0,
  };
  irPara("execute");
}

export function renderExecute() {
  const el = document.getElementById("screen-execute");
  atualizarNavVisibilidade(false);

  const exec = state.execucao;
  if (!exec) {
    el.innerHTML = `<p class="text-muted text-sm text-center py-10">Nenhum treino em andamento.</p>`;
    return;
  }

  const { ficha, indice } = exec;
  const total = ficha.exercicios.length;
  const exercicio = ficha.exercicios[indice];
  const ultimo = indice === total - 1;
  const nome = dividirNomeExercicio(exercicio.nome);
  const grupo = EXERCISES[exercicio.exercicioId]?.grupo;
  const dica = DICAS_POR_GRUPO[grupo] || DICA_PADRAO;

  const segmentos = Array.from({ length: total }, (_, i) => `
    <div class="flex-1 h-1.5 rounded-full ${i <= indice ? "bg-clay" : "bg-hairline"}"></div>
  `).join("");

  el.innerHTML = `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-5">
        <button id="btn-sair" class="text-muted p-1"><i data-lucide="x" class="w-6 h-6"></i></button>
        <div class="flex items-center gap-2 bg-card border border-hairline rounded-full pl-3 pr-1 py-1">
          <span class="text-xs font-bold text-muted truncate max-w-[140px]">${ficha.nome}</span>
          <span class="text-xs font-extrabold bg-clay text-ink rounded-full px-2.5 py-1">${indice + 1}/${total}</span>
        </div>
      </div>

      <div class="flex gap-1.5 mb-8">${segmentos}</div>

      <div class="text-center mb-7">
        <h2 class="font-display uppercase text-3xl tracking-tight leading-tight px-2">
          <span class="text-ink">${nome.branco}</span>${nome.clay ? ` <span class="text-clay">${nome.clay}</span>` : ""}
        </h2>
        <div class="w-10 h-1 bg-clay rounded-full mx-auto mt-3"></div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-card border border-hairline rounded-2xl p-4">
          <i data-lucide="layers" class="w-6 h-6 text-clay mb-2"></i>
          <p class="text-muted text-xs font-bold uppercase tracking-wide">Séries</p>
          <p class="font-display text-3xl leading-none mt-1">${exercicio.series}</p>
        </div>
        <div class="bg-card border border-hairline rounded-2xl p-4">
          <i data-lucide="repeat" class="w-6 h-6 text-clay mb-2"></i>
          <p class="text-muted text-xs font-bold uppercase tracking-wide">Repetições</p>
          <p class="font-display text-3xl leading-none mt-1">${exercicio.reps}</p>
        </div>
      </div>

      <div class="bg-card border border-hairline rounded-2xl p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <i data-lucide="lightbulb" class="w-[18px] h-[18px] text-clay"></i>
          <p class="text-clay text-xs font-extrabold uppercase tracking-wide">Dica</p>
        </div>
        <p class="text-ink text-sm leading-relaxed">${dica}</p>
      </div>

      <div class="flex-1"></div>

      <div class="pb-6">
        <button id="btn-concluir" class="w-full bg-clay text-ink font-bold rounded-full py-4 active:scale-95 transition-transform flex items-center justify-center gap-2">
          <i data-lucide="check-circle-2" class="w-5 h-5"></i> Exercício concluído
        </button>
      </div>
    </div>
  `;

  icons();

  el.querySelector("#btn-sair").addEventListener("click", () => {
    if (!confirm("Sair do treino? O progresso desta sessão será perdido.")) return;
    state.execucao = null;
    atualizarNavVisibilidade(true);
    irPara("home");
  });

  el.querySelector("#btn-concluir").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.classList.add("bg-emerald");
    btn.classList.remove("bg-clay", "active:scale-95");
    btn.innerHTML = `<i data-lucide="check" class="w-5 h-5"></i> Concluído`;
    icons();
    showToast(`${exercicio.nome} concluído`, "success");

    setTimeout(async () => {
      if (ultimo) {
        await finalizarTreino();
      } else {
        exec.indice += 1;
        renderExecute();
      }
    }, 800);
  });
}

async function finalizarTreino() {
  const exec = state.execucao;
  const el = document.getElementById("screen-execute");
  el.innerHTML = `<p class="text-muted text-sm text-center py-10">Salvando…</p>`;

  const registro = {
    templateId: exec.ficha.id,
    templateNome: exec.ficha.nome,
    exercicios: exec.ficha.exercicios,
  };
  const ref = await registrarTreinoConcluido(state.perfilId, registro);

  const c = getPerfilCache(state.perfilId);
  const novoRegistro = { id: ref.id, ...registro, concluidoEm: new Date() };
  c.historico = c.historico ? [novoRegistro, ...c.historico] : [novoRegistro];

  state.execucao = null;
  atualizarNavVisibilidade(true);
  irPara("home");
  showToast("Treino concluído 💪", "success");
  renderHome();
}

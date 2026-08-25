import { registrarTreinoConcluido } from "../firebase.js";
import { state, getPerfilCache } from "../state.js";
import { icons, showToast } from "../utils.js";
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
  const exercicio = ficha.exercicios[indice];
  const ultimo = indice === ficha.exercicios.length - 1;

  el.innerHTML = `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <button id="btn-sair" class="text-muted p-1"><i data-lucide="x" class="w-6 h-6"></i></button>
        <div class="flex items-center gap-2 bg-card border border-hairline rounded-full pl-3 pr-1 py-1">
          <span class="text-xs font-bold text-muted truncate max-w-[140px]">${ficha.nome}</span>
          <span class="text-xs font-extrabold bg-clay text-ink rounded-full px-2.5 py-1">${indice + 1}/${ficha.exercicios.length}</span>
        </div>
      </div>

      <div class="w-full h-1.5 bg-hairline rounded-full overflow-hidden mb-8">
        <div class="h-full bg-clay transition-all" style="width:${(indice / ficha.exercicios.length) * 100}%"></div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center">
        <img src="${exercicio.imagem}" class="w-full max-w-[260px] aspect-square object-cover rounded-3xl border border-hairline mb-6" />
        <h2 class="font-display uppercase text-2xl tracking-tight px-4 mb-3">${exercicio.nome}</h2>
        <div class="flex items-center gap-2">
          <span class="bg-card border border-hairline rounded-full px-4 py-2 text-sm font-extrabold">${exercicio.series} <span class="text-muted font-bold">séries</span></span>
          <span class="bg-card border border-hairline rounded-full px-4 py-2 text-sm font-extrabold">${exercicio.reps} <span class="text-muted font-bold">reps</span></span>
        </div>
      </div>

      <div class="pb-6">
        <button id="btn-concluir" class="w-full bg-clay text-ink font-bold rounded-full py-4 active:scale-95 transition-transform flex items-center justify-center gap-2">
          Exercício concluído
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

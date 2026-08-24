import { registrarTreinoConcluido } from "../firebase.js";
import { state } from "../state.js";
import { icons, showToast } from "../utils.js";
import { irPara, atualizarNavVisibilidade } from "../router.js";
import { renderHome } from "./home.js";

export function iniciarExecucao(ficha) {
  state.execucao = {
    ficha,
    indice: 0,
    etapaConcluida: false,
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

  const { ficha, indice, etapaConcluida } = exec;
  const exercicio = ficha.exercicios[indice];
  const ultimo = indice === ficha.exercicios.length - 1;

  el.innerHTML = `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <button id="btn-sair" class="text-muted p-1"><i data-lucide="x" class="w-6 h-6"></i></button>
        <p class="text-muted text-xs font-bold">${indice + 1} / ${ficha.exercicios.length}</p>
      </div>

      <div class="w-full h-1.5 bg-hairline rounded-full overflow-hidden mb-8">
        <div class="h-full bg-clay transition-all" style="width:${((indice + (etapaConcluida ? 1 : 0)) / ficha.exercicios.length) * 100}%"></div>
      </div>

      <div class="flex-1 flex flex-col items-center justify-center text-center">
        <img src="${exercicio.imagem}" class="w-full max-w-[260px] aspect-square object-cover rounded-3xl border border-hairline mb-6" />
        <h2 class="font-display uppercase text-2xl tracking-tight px-4 mb-2">${exercicio.nome}</h2>
        <p class="text-clay font-bold text-lg">${exercicio.series} séries × ${exercicio.reps} reps</p>
      </div>

      <div class="pb-6">
        ${
          etapaConcluida
            ? `<button id="btn-avancar" class="w-full bg-emerald text-paper font-bold rounded-full py-4 active:scale-95 transition-transform flex items-center justify-center gap-2">
                 ${ultimo ? "Concluir treino" : "Próximo exercício"} <i data-lucide="arrow-right" class="w-5 h-5"></i>
               </button>`
            : `<button id="btn-concluir" class="w-full bg-clay text-ink font-bold rounded-full py-4 active:scale-95 transition-transform">
                 Exercício concluído
               </button>`
        }
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

  const btnConcluir = el.querySelector("#btn-concluir");
  if (btnConcluir) {
    btnConcluir.addEventListener("click", () => {
      exec.etapaConcluida = true;
      showToast(`${exercicio.nome} concluído`, "success");
      renderExecute();
    });
  }

  const btnAvancar = el.querySelector("#btn-avancar");
  if (btnAvancar) {
    btnAvancar.addEventListener("click", async () => {
      if (ultimo) {
        await finalizarTreino();
      } else {
        exec.indice += 1;
        exec.etapaConcluida = false;
        renderExecute();
      }
    });
  }
}

async function finalizarTreino() {
  const exec = state.execucao;
  const el = document.getElementById("screen-execute");
  el.innerHTML = `<p class="text-muted text-sm text-center py-10">Salvando…</p>`;

  await registrarTreinoConcluido(state.perfilId, {
    templateId: exec.ficha.id,
    templateNome: exec.ficha.nome,
    exercicios: exec.ficha.exercicios,
  });

  state.execucao = null;
  atualizarNavVisibilidade(true);
  irPara("home");
  showToast("Treino concluído 💪", "success");
  renderHome();
}

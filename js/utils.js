export function showToast(msg, type = "default") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show" + (type === "success" ? " success" : "");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    el.classList.remove("show");
  }, 2200);
}

export function icons() {
  if (window.lucide) window.lucide.createIcons();
}

// Converte um timestamp do Firestore (ou Date) em Date
export function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  return new Date(ts);
}

export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DIAS_SEMANA_CURTO = ["D", "S", "T", "Q", "Q", "S", "S"];
export { DIAS_SEMANA, DIAS_SEMANA_CURTO };

// Retorna os 7 objetos Date de segunda a domingo da semana atual
export function semanaAtual() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diaSemana = hoje.getDay(); // 0=dom..6=sab
  const offsetSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() + offsetSegunda);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    return d;
  });
}

// historico: array de { concluidoEm }
export function diasTreinadosSet(historico) {
  const set = new Set();
  for (const h of historico) {
    const d = toDate(h.concluidoEm);
    if (d) set.add(dateKey(d));
  }
  return set;
}

// Streak: dias consecutivos treinados terminando hoje ou ontem
export function calcularStreak(historico) {
  const set = diasTreinadosSet(historico);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let cursor = new Date(hoje);
  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(dateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Agrupa histórico em { "Hoje": [...], "Ontem": [...], "12 de agosto": [...] }
export function agruparHistoricoPorDia(historico) {
  const hoje = dateKey(new Date());
  const ontemDate = new Date();
  ontemDate.setDate(ontemDate.getDate() - 1);
  const ontem = dateKey(ontemDate);

  const grupos = new Map();
  for (const h of historico) {
    const d = toDate(h.concluidoEm);
    if (!d) continue;
    const key = dateKey(d);
    let label;
    if (key === hoje) label = "Hoje";
    else if (key === ontem) label = "Ontem";
    else
      label = d.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
      });
    if (!grupos.has(label)) grupos.set(label, []);
    grupos.get(label).push(h);
  }
  return grupos;
}

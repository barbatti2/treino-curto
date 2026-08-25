import { PROFILES } from "./config.js";
import { state, setPerfil, perfilAtual } from "./state.js";
import { logout } from "./firebase.js";
import { icons } from "./utils.js";

const TITULOS = {
  home: "Início",
  workouts: "Treinos",
  create: "Nova ficha",
  execute: "Treino",
  history: "Histórico",
};

const NAV_SCREENS = new Set(["home", "workouts", "history"]);
const HEADER_SCREENS = new Set(["home", "workouts", "history"]);

let telaAtual = "home";
let onNavigate = null;

export function registrarNavegacao(callback) {
  onNavigate = callback;
}

export function irPara(tela) {
  telaAtual = tela;
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${tela}`).classList.add("active");

  document.getElementById("app-header").classList.toggle("hidden", !HEADER_SCREENS.has(tela));
  definirTitulo(TITULOS[tela] || "");

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === tela);
  });

  atualizarNavVisibilidade(NAV_SCREENS.has(tela));

  const scroll = document.getElementById("main-scroll");
  if (scroll) scroll.scrollTop = 0;

  if (onNavigate) onNavigate(tela);
}

// Permite que uma tela (ex. Início) defina título + subtítulo customizados
export function definirTitulo(titulo, subtitulo = "") {
  document.getElementById("header-title").textContent = titulo;
  const sub = document.getElementById("header-subtitle");
  if (subtitulo) {
    sub.textContent = subtitulo;
    sub.classList.remove("hidden");
  } else {
    sub.classList.add("hidden");
  }
}

export function atualizarNavVisibilidade(visivel) {
  document.getElementById("bottom-nav").classList.toggle("hidden", !visivel);
}

export function initRouter() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => irPara(btn.dataset.nav));
  });
  renderProfileToggle();
}

export function renderProfileToggle() {
  const container = document.getElementById("profile-toggle");
  const atual = perfilAtual();

  container.innerHTML = `
    ${PROFILES.map(
      (p) => `
      <button data-perfil="${p.id}" class="perfil-avatar w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors
        ${p.id === atual.id ? "bg-clay border-clay text-ink" : "bg-card border-hairline text-muted"}">
        ${p.iniciais}
      </button>`
    ).join("")}
    <button id="btn-logout" class="w-8 h-8 rounded-full flex items-center justify-center text-muted active:text-clay">
      <i data-lucide="log-out" class="w-[18px] h-[18px]"></i>
    </button>
  `;

  icons();

  container.querySelectorAll(".perfil-avatar").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.perfil === state.perfilId) return;
      setPerfil(btn.dataset.perfil);
      renderProfileToggle();
      const scroll = document.getElementById("main-scroll");
      if (scroll) scroll.scrollTop = 0;
      if (onNavigate) onNavigate(telaAtual);
    });
  });

  container.querySelector("#btn-logout").addEventListener("click", async () => {
    if (!confirm("Sair da conta?")) return;
    await logout();
  });
}

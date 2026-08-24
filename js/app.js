import { login, watchAuth } from "./firebase.js";
import { showToast, icons } from "./utils.js";
import { initRouter, irPara, registrarNavegacao, renderProfileToggle } from "./router.js";
import { renderHome } from "./screens/home.js";
import { renderWorkouts } from "./screens/workouts.js";
import { renderCreateWorkout } from "./screens/create-workout.js";
import { renderExecute } from "./screens/execute.js";
import { renderHistory } from "./screens/history.js";

const screenLogin = document.getElementById("screen-login");
const appShell = document.getElementById("app-shell");
const formLogin = document.getElementById("form-login");
const inputSenha = document.getElementById("input-senha");
const btnLogin = document.getElementById("btn-login");
const loginErro = document.getElementById("login-erro");

registrarNavegacao((tela) => {
  if (tela === "home") renderHome();
  else if (tela === "workouts") renderWorkouts();
  else if (tela === "create") renderCreateWorkout();
  else if (tela === "execute") renderExecute();
  else if (tela === "history") renderHistory();
});

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();
  const senha = inputSenha.value;
  if (!senha) return;

  btnLogin.disabled = true;
  btnLogin.textContent = "Entrando…";
  loginErro.textContent = "";

  try {
    await login(senha);
  } catch (err) {
    loginErro.textContent = "Senha incorreta.";
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});

watchAuth((user) => {
  if (user) {
    screenLogin.classList.remove("active", "flex");
    screenLogin.style.display = "none";
    appShell.classList.remove("hidden");
    initRouter();
    irPara("home");
  } else {
    appShell.classList.add("hidden");
    screenLogin.style.display = "";
    screenLogin.classList.add("active", "flex");
    inputSenha.value = "";
    btnLogin.disabled = false;
    btnLogin.textContent = "Entrar";
  }
});

icons();

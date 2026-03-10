import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.109:8080", // ALTERAR PARA IP DA MAQUINA
});
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { enviroments } from "./enviroments";

const isWeb = enviroments.ambiente === "spring-web";

// ==========================================
// ARMAZENAMENTO GERAL || dados não sensíveis
// ==========================================

export const salvarUsuario = async (dadosUsuario) => {
  try {
    const jsonValue = JSON.stringify(dadosUsuario);
    if (isWeb) {
      localStorage.setItem("funcionario", jsonValue);
      localStorage.setItem("logado", "true");
    } else {
      await AsyncStorage.setItem("funcionario", jsonValue);
      await AsyncStorage.setItem("logado", "true");
    }
  } catch (error) {
    console.error("Erro ao salvar os dados do usuário:", error);
  }
};

export const buscarUsuario = async () => {
  try {
    const jsonValue = isWeb
      ? localStorage.getItem("funcionario")
      : await AsyncStorage.getItem("funcionario");
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Erro ao buscar os dados do usuário:", error);
    return null;
  }
};

export const verificarLogin = async () => {
  try {
    const logado = isWeb
      ? localStorage.getItem("logado")
      : await AsyncStorage.getItem("logado");
    return logado === "true";
  } catch (error) {
    console.error("Erro ao verificar login:", error);
    return false;
  }
};

export const removerUsuario = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem("funcionario");
      localStorage.removeItem("logado");
    } else {
      await AsyncStorage.removeItem("funcionario");
      await AsyncStorage.removeItem("logado");
    }
  } catch (error) {
    console.error("Erro ao remover os dados do usuário:", error);
  }
};

// ==========================================
// ARMAZENAMENTO SEGURO || Tokens, Senhas e dados críticos
// ==========================================

export const salvarToken = async (token) => {
  try {
    if (isWeb) {
      localStorage.setItem("token", token);
    } else {
      await SecureStore.setItemAsync("token", token);
    }
  } catch (error) {
    console.error("Erro ao salvar o token seguro:", error);
  }
};

export const recuperarToken = async () => {
  try {
    const token = isWeb
      ? localStorage.getItem("token")
      : await SecureStore.getItemAsync("token");
    return token;
  } catch (error) {
    console.error("Erro ao recuperar o token seguro:", error);
    return null;
  }
};

export const deletarToken = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem("token");
    } else {
      await SecureStore.deleteItemAsync("token");
    }
  } catch (error) {
    console.error("Erro ao deletar o token seguro:", error);
  }
};

// ==========================================
// UTILITÁRIOS DE TOKEN
// ==========================================

export const descriptografarTokenJWT = (token) => {
  try {
    if (!token) return null;
    const payload = jwtDecode(token);
    return payload;
  } catch (error) {
    console.error("Erro ao decodificar o token JWT:", error);
    return null;
  }
};

// ==========================================
// ARMAZENAMENTO DE IDIOMA
// ==========================================

export const salvarIdioma = async (idioma) => {
  try {
    if (isWeb) {
      localStorage.setItem("idioma_app", idioma);
    } else {
      await AsyncStorage.setItem("idioma_app", idioma);
    }
  } catch (error) {
    console.error("Erro ao salvar o idioma:", error);
  }
};

export const buscarIdioma = async () => {
  try {
    const idioma = isWeb
      ? localStorage.getItem("idioma_app")
      : await AsyncStorage.getItem("idioma_app");
    return idioma;
  } catch (error) {
    console.error("Erro ao buscar o idioma:", error);
    return null;
  }
};
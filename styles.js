import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  fundoLogin: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    gap: 50,
  },
  img: {
    width: 200,
    height: 200,
  },
  h1: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  h4: {
    fontSize: 20,
    textAlign: "center",
    color: "white",
  },
  botao: {
    backgroundColor: "#0F14B8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "60%",
  },
  textoBotao: {
    textAlign: "center",
    color: "white",
  },
  inputLogin: {
    backgroundColor: "#F4F4F4",
    padding: 10,
    borderRadius: 10,
  },
});

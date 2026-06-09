export const enviroments = {
  tokenURL: process.env.EXPO_PUBLIC_IMAGE_TOKEN_URL,
  ambiente: process.env.EXPO_PUBLIC_AMBIENTE,
  apiURL: (() => {
    switch (process.env.EXPO_PUBLIC_AMBIENTE) {
      case "spring-web":
        return process.env.EXPO_PUBLIC_API_BASE_URL_WEB;
      case "spring-mobile":
        return process.env.EXPO_PUBLIC_API_BASE_URL_MOBILE;
      case "spring-azure":
        return process.env.EXPO_PUBLIC_API_BASE_URL_AZURE;
      default:
        console.warn("Ambiente desconhecido. Usando backend local.");
        return process.env.EXPO_PUBLIC_API_BASE_URL_WEB;
    }
  })(),
  etlURL: (() => {
    switch (process.env.EXPO_PUBLIC_AMBIENTE) {
      case "spring-web":
        return process.env.EXPO_PUBLIC_IA_BASE_URL; // localhost:8000
      case "spring-mobile":
        return process.env.EXPO_PUBLIC_ETL_BASE_URL; // 172.x.x.x:8000
      default:
        return process.env.EXPO_PUBLIC_IA_BASE_URL;
    }
  })(),
};
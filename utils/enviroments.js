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
};

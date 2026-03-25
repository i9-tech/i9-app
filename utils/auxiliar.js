export const formatarData = (dataIso) => {
  if (!dataIso) return "Carregando...";
  
  try {
    const partes = dataIso.split('T')[0].split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`; 
    }
    return dataIso; 
  } catch (error) {
    return dataIso;
  }
};

export const formatarTelefone = (telefone) => {
  if (!telefone) return "Carregando...";

  let numeros = String(telefone).replace(/\D/g, "");

  if (numeros.length === 13 && numeros.startsWith("55")) {
    numeros = numeros.slice(2);
  }

  if (numeros.length === 11) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  } else if (numeros.length === 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return telefone; 
};

export const formatarCNPJ = (cnpj) => {
  if (!cnpj) return "Carregando...";

  const numeros = String(cnpj).replace(/\D/g, "");
  
  if (numeros.length === 14) {
    return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  
  return cnpj;
};
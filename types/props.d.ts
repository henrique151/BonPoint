interface ConfeitariaSliderProps {
  idConfeitaria: string;
  nome: string;
  cpf: string;
  cnpj: string;
  cidade: string;
  bairro: string;
  endereco: string;
  idUser: string;
  imagemUrl: string;
  produtos: string[]; // IDs dos produtos
  categoria: string[]; // IDs ou nomes das categorias
  avaliacoes: string[]; // IDs das avaliações
  imagemUri?: string; // Adicionando a imagemUri como opcional
}

interface ConfeitariaScreenProps {
  idConfeitaria: string;
}

interface ConfeitariaCategoriaProps {
  categorias: Categoria[];
}

interface ConfeitariaProdutoProps {
  produtos: Produto[];
}

interface ConfeitariaAvaliacaoProps {
  idConfeitaria: string;
  usuario: User; // Usando o tipo User definido
}

interface ChatScreenProps {
  idConfeitaria: string; // Defina o tipo para idConfeitaria
}
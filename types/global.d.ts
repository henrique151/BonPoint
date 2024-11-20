// Tipo para representar um usuário
type User = {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  senha: string;
  tipoUsuario: string;
  telefone: string;
  favoritos: string[];
  dataCriacao: string | any;
  
};

// Tipo para representar um produto
type Produto = {
  categoria: string;
  descricao: string;
  idProduto: string;
  idUser: string;
  imagemProduto: string;
  nomeProduto: string;
};

// Tipo para representar uma categoria
type Categoria = {
  categoria: string;
  id: string;
  nomeCategoria: string;
  imagemUrl: string;
};

// Tipo para representar uma avaliação
type Avaliacao = {
  idAvaliacao: string;
  idConfeitaria: string;
  comentario: string;
  avaliacao: number;
  usuarioNome: string;
  usuarioEmail: string;
  usuarioImagem: string;
  usuarioId: string;
  timestamp: number;
  zonedDate: Date; 
};

// Tipo para representar uma confeitaria
type Confeitaria = {
  idConfeitaria: string;
  nome: string;
  cpf: string;
  cnpj: string;
  cidade: string;
  bairro: string;
  endereco: string;
  idUser: string;
  imagemUrl: string;
  produtos?: string[]; // IDs dos produtos
  categoria: string[]; // IDs ou nomes das categorias
  avaliacoes: string[]; // IDs das avaliações
  imagemUri?: string; // Adicionando a imagemUri como opcional
  usuarioNome: string;
};

// Tipo para representar as propriedades de um botão com título
type TituloButton = {
  titulo: string;
  onPress: () => void;
  background: string;

};

// Novo tipo para representar uma mensagem
interface Mensagem {
  idMensagem: string;
  texto: string;
  conversaId: string;
  dataCriacao: { seconds: number };
  usuario: User;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  imagensUrl: string[]; 

}

interface Contato {
  id: string;
  nome: string;
  imagemUrl: string;
  ultimaMensagem: string;
  nomeConfeitaria?: string; 
}

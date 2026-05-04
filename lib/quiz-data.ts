export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reaction: {
    right: string;
    wrong: string;
  };
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "cidade-natal",
    question: "Qual cidade o Stênio chama de berço?",
    options: ["Fortaleza-CE", "Parnaíba-PI", "Teresina-PI", "Brasília-DF"],
    correctIndex: 1,
    reaction: {
      right: "Aí sim. Parnaíba no mapa!",
      wrong: "A pegadinha era Fortaleza. Ele é piauiense.",
    },
  },
  {
    id: "time",
    question: "Qual é o time de coração do Stênio?",
    options: ["Fortaleza", "Flamengo", "Ceará", "Fluminense"],
    correctIndex: 2,
    reaction: {
      right: "Vozão na veia.",
      wrong: "Quase, mas o coração dele bate pelo Ceará.",
    },
  },
  {
    id: "comida",
    question: "Qual comida entra forte na lista de favoritas dele?",
    options: [
      "Carne de sol com baião",
      "Fettuccine com camarão",
      "Picanha na chapa",
      "Peixada cearense",
    ],
    correctIndex: 1,
    reaction: {
      right: "Fino demais: fettuccine com camarão.",
      wrong: "Boa tentativa, mas o prato é fettuccine com camarão.",
    },
  },
  {
    id: "musica",
    question: "Qual estilo musical o Stênio mais escuta?",
    options: ["Forró das antigas", "MPB", "Pop Rock", "Samba"],
    correctIndex: 2,
    reaction: {
      right: "Acertou o som da playlist.",
      wrong: "Dessa vez era Pop Rock.",
    },
  },
  {
    id: "conquista-profissional",
    question: "Qual foi uma grande conquista profissional dele?",
    options: [
      "Comandar uma operação internacional da PRF",
      "Ser Superintendente da PRF no Ceará e no Piauí",
      "Criar a o Projeto de Controle Estatístico",
      "Ajudar na organização do ENAOP",
    ],
    correctIndex: 1,
    reaction: {
      right: "Respeito na estrada e na gestão.",
      wrong: "A resposta é ter sido Superintendente da PRF no Ceará e no Piauí.",
    },
  },
  {
    id: "filme-serie",
    question: "Qual filme ou série é favorito de carteirinha?",
    options: ["Star Wars", "O Senhor dos Anéis", "Tropa de Elite", "Indiana Jones"],
    correctIndex: 0,
    reaction: {
      right: "A força esteja com você.",
      wrong: "Não foi dessa vez. A resposta era Star Wars.",
    },
  },
  {
    id: "hobby",
    question: "Qual hobby ganha tempo fora do trabalho?",
    options: ["Tênis", "Vídeo-game", "Fotografia", "Drone"],
    correctIndex: 1,
    reaction: {
      right: "Player 1 confirmado.",
      wrong: "O controle entregava: é vídeo-game.",
    },
  },
  {
    id: "anos-prf",
    question: "Quantos anos de PRF/serviço público ele carrega na bagagem?",
    options: ["22 anos", "28 anos", "30 anos", "32 anos"],
    correctIndex: 2,
    reaction: {
      right: "Três décadas de estrada.",
      wrong: "A conta certa é 30 anos.",
    },
  },
  {
    id: "maior-legado",
    question: "Qual é o maior legado do Stênio?",
    options: ["A PRF", "Os amigos", "Laryssa", "As histórias de operações"],
    correctIndex: 2,
    reaction: {
      right: "Essa era pra acertar sorrindo.",
      wrong: "Bonita tentativa, mas o maior legado é Laryssa.",
    },
  },
];

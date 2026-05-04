# Roadmap — Convite Interativo "Stênio faz 55"

**Domínio:** steniofaz55.eteolabs.com.br
**Hospedagem:** Railway + Postgres plugin
**Stack:** Next.js 15 (App Router) · TypeScript · TailwindCSS · Framer Motion · Prisma · shadcn/ui · Zod
**Tom:** descontraído-boteco (gírias leves, mesa de bar, sem ser forçado)
**Diferenciais escolhidos:** Quiz + Mural de Recados

---

## Sumário das fases

| Fase | Entrega | Tempo estimado |
|---|---|---|
| 0 | Bootstrap do projeto | 30 min |
| 1 | Hero com vídeo do avatar | 1h |
| 2 | Detalhes + countdown + add to calendar | 1h30 |
| 3 | Galeria do boteco + mapa | 1h |
| 4 | RSVP com Postgres | 2h |
| 5 | Mural de recados | 1h30 |
| 6 | Quiz "Quanto você conhece o Stênio?" | 2h |
| 7 | Painel admin | 1h30 |
| 8 | Open Graph dinâmico | 30 min |
| 9 | Polimento + deploy Railway | 1h |

**Total:** ~12h de trabalho assistido por IDE agent.

---

## Pré-fase: preparar o vídeo do avatar

Você tem o vídeo em **MP4 1080p**. Não use no site direto — pesa demais. Gere os derivados antes da Fase 1.

```bash
# 1. WebM VP9 — leve, qualidade alta, ~3-5x menor que o MP4 original
ffmpeg -i avatar.mp4 -vf "scale=720:-2" -c:v libvpx-vp9 -crf 32 -b:v 0 -an -row-mt 1 hero.webm

# 2. MP4 H.264 fallback — pra iOS antigo (<14) e WhatsApp in-app browser
ffmpeg -i avatar.mp4 -vf "scale=720:-2" -c:v libx264 -crf 23 -preset slow -movflags +faststart -an hero.mp4

# 3. Poster (primeiro frame) — evita flash branco enquanto carrega
ffmpeg -i avatar.mp4 -ss 00:00:00 -vframes 1 -vf "scale=720:-2" -q:v 2 hero-poster.jpg
```

Coloque os 3 arquivos em `/public/media/`. Tamanho-alvo: WebM <800 KB, MP4 <1.5 MB.

**Nota:** se a animação tem detalhes finos que ficam ruins em 720p, sobe pra `scale=900:-2`. Acima disso é desperdício pra mobile.

---

## FASE 0 — Bootstrap

```
Crie um projeto Next.js 15 com App Router, TypeScript estrito, TailwindCSS, ESLint e Prettier.

Configure:
- shadcn/ui com tema customizado. Cores no tailwind.config.ts:
  - primary: #1F4D3A (verde Caju Limão)
  - accent: #F5A98A (pêssego do avatar)
  - background: #FAF6F0 (creme)
  - foreground: #2A2A2A (charcoal)
- Framer Motion (npm i framer-motion)
- Prisma com provider postgresql (npx prisma init)
- canvas-confetti + @types/canvas-confetti
- react-hook-form + @hookform/resolvers + zod
- lucide-react

Variáveis em .env.example:
- DATABASE_URL
- ADMIN_PASSWORD
- NEXT_PUBLIC_SITE_URL=https://steniofaz55.eteolabs.com.br

Fontes (next/font/google) em /app/layout.tsx:
- Fraunces (display, weights 400 e 600, variable --font-display)
- Inter (body, weights 400 e 500, variable --font-body)
Aplique as variáveis no <body> e configure no tailwind.config.ts em theme.fontFamily.

Estrutura:
/app
  layout.tsx, page.tsx, globals.css
  /api
  /admin
/components
  /ui (shadcn)
  /sections (Hero, EventDetails, Venue, Rsvp, Guestbook, Quiz)
/lib
  prisma.ts, utils.ts, validators.ts
/public/media (vídeo, fotos do boteco, avatar)

Não crie nenhuma seção visual ainda. Apenas o esqueleto: layout raiz com fontes carregadas, page.tsx renderizando "OK", e o cliente Prisma em /lib/prisma.ts (singleton padrão pra evitar múltiplas conexões em dev).
```

---

## FASE 1 — Hero com vídeo do avatar

```
Crie /components/sections/Hero.tsx:

Visual:
- Background cor accent (#F5A98A) full-width
- Altura 100vh em desktop, 100svh em mobile (svh resolve bug da barra do Safari iOS)
- Layout vertical centralizado: tag → vídeo → título → subtítulo → CTAs

Conteúdo (tom descontraído-boteco):
- Tag superior pequena: "07.05.2026 · QUINTA · 19H"
- <video autoplay muted playsinline loop preload="metadata"> com:
    - <source src="/media/hero.webm" type="video/webm" />
    - <source src="/media/hero.mp4" type="video/mp4" />
    - poster="/media/hero-poster.jpg"
    - max-width: 600px, sem controles, drop-shadow suave embaixo
    - aria-hidden="true" (decorativo)
- Título <h1>: "Stênio faz 55" em Fraunces 600, clamp(3rem, 8vw, 6rem), cor foreground
- Subtítulo: "55 motivos pra brindar. Vem com a gente?"
- Localização menor: "Boteco Caju Limão · Sudoeste"
- CTA primário: "Tô dentro" → scroll suave até #rsvp
- CTA secundário (outline): "Como chegar" → abre Google Maps em nova aba

Animações Framer Motion:
- Vídeo: scale 0.9→1, opacity 0→1, duration 0.8s, ease "easeOut"
- Texto: stagger filho com delayChildren 0.4s e staggerChildren 0.15s
- Confete discreto no mount: canvas-confetti({ particleCount: 80, spread: 100, origin: { y: 0.3 }, colors: ['#1F4D3A','#F5A98A','#FAF6F0'] })

Acessibilidade:
- <h1> único na página
- Botões com foco visível (ring-2 ring-primary)
- prefers-reduced-motion: desativa animações via hook useReducedMotion

Use semantic HTML (<header>). Não acrescente outras seções nesta fase.
```

---

## FASE 2 — Detalhes do evento + countdown + add to calendar

```
Adicione /components/sections/EventDetails.tsx logo após Hero em page.tsx.

Background: background (#FAF6F0). Padding vertical generoso (py-20).
Layout: grid lg:grid-cols-2 gap-12, stack em mobile.

COLUNA ESQUERDA — Countdown
Componente <Countdown targetDate="2026-05-07T19:00:00-03:00" />

- Quatro cartões lado a lado: DIAS / HORAS / MIN / SEG
- Cada cartão: bg-primary, texto cream, número grande Fraunces, label menor Inter uppercase tracking-wide
- Flip animation no número quando muda: AnimatePresence + motion.span com initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-20,opacity:0}}, key no valor
- Atualiza via setInterval(1000), cleanup obrigatório no unmount
- Quando diff <= 0: substitui tudo por "É HOJE!" Fraunces enorme, animação pulse

COLUNA DIREITA — Detalhes
- Sobretítulo: "Salve a data" Fraunces, accent
- Lista visual com ícones lucide (Calendar, Clock, MapPin, Users):
    - "Quinta, 07 de maio de 2026"
    - "A partir das 19h"
    - "Boteco Caju Limão · Sudoeste"
    - "Salão Sudoeste — área reservada"
- Texto descontraído: "Mesa garantida, geladeira lotada. Só falta você."
- Dois botões:
  1. "Adicionar ao Google Calendar" → link externo:
     https://calendar.google.com/calendar/render?action=TEMPLATE&text=Sten%C3%ADo+faz+55&dates=20260507T220000Z/20260508T030000Z&details=Boteco+Caju+Lim%C3%A3o+-+Sudoeste&location=SIG+Quadra+8+Sudoeste+Bras%C3%ADlia
     (datas em UTC: 19h BRT = 22h UTC)
  2. "Baixar .ics" → link pra /api/calendar.ics

Crie /app/api/calendar.ics/route.ts:
- Retorna string VCALENDAR válida com UM VEVENT
- Headers: Content-Type "text/calendar; charset=utf-8", Content-Disposition "attachment; filename=stenio-55.ics"
- Campos: UID único (use crypto.randomUUID), DTSTAMP, DTSTART, DTEND (DTSTART + 6h), SUMMARY, LOCATION, DESCRIPTION, GEO (-15.7975;-47.9215 aproximado pro Sudoeste — peça pra eu confirmar coords exatas se quiser precisão)
- Datas em formato YYYYMMDDTHHMMSSZ (UTC)
- Sem dependência externa, gere a string manualmente

Não use bibliotecas pesadas pra .ics. Formato é trivial.
```

---

## FASE 3 — Galeria do boteco + mapa

```
Crie /components/sections/Venue.tsx:

Background: primary (#1F4D3A). Texto cream/accent.

ESTRUTURA
- Sobretítulo: "O QG da festa"
- Título Fraunces: "Boteco Caju Limão"
- Parágrafo curto descontraído: "Choppe gelado, petisco fritinho na hora e aquele clima de boteco bom de Brasília. É lá que a gente vai derrubar o 55."

GRID DE FOTOS (em /public/media/boteco/)
Layout em 12 colunas:
- Foto 1 (boteco-caju-1.jpg) — col-span-12 lg:col-span-8 row-span-2 (destaque, salão)
- Foto 2 (boteco-caju-2.jpg) — col-span-6 lg:col-span-4
- Foto 3 (caju-limao-3.jpg, coxinha) — col-span-6 lg:col-span-4
- Foto 4 (caju-limao-4.jpg, bolinhos) — col-span-6 lg:col-span-6
- Foto 5 (caju-limao-5.jpg, picanha na chapa) — col-span-6 lg:col-span-6

Cada foto:
- next/image com placeholder="blur" (gere blurDataURL com plaiceholder ou base64 manual)
- Aspect ratio fixo (aspect-[4/3] ou aspect-square dependendo da composição)
- Hover desktop: scale 1.03 + brightness-110, transition-all duration-300
- Mobile: carousel horizontal com snap-x snap-mandatory, scrollbar-hide

ENDEREÇO + MAPA
Card destacado abaixo do grid (bg-background/10 backdrop-blur, border accent/30):
- Ícone MapPin
- "SIG Quadra 8 — Cruzeiro/Sudoeste/Octogonal"
- "Brasília - DF · 70610-480"
- Plus code menor, text-accent: "633M+W7"

Três botões em flex-wrap gap-3:
1. "Abrir no Google Maps" (primary):
   https://www.google.com/maps/search/?api=1&query=633M%2BW7+Sudoeste%2FOctogonal+Bras%C3%ADlia+-+DF
2. "Abrir no Waze" (outline):
   https://waze.com/ul?q=Boteco+Caju+Lim%C3%A3o+Sudoeste+Bras%C3%ADlia
3. "Chamar Uber" (outline ghost):
   https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=SIG+Quadra+8+Sudoeste+Bras%C3%ADlia

Todos os links com target="_blank" rel="noopener noreferrer".
```

---

## FASE 4 — RSVP com Postgres

```
SCHEMA — adicione em prisma/schema.prisma:

model Rsvp {
  id         String   @id @default(cuid())
  name       String
  attending  Boolean
  guests     Int      @default(0)
  message    String?
  dietary    String?
  createdAt  DateTime @default(now())
  ipHash     String?
  @@index([createdAt])
}

Rode npx prisma migrate dev --name init.

VALIDADOR — /lib/validators.ts:
import { z } from "zod";
export const rsvpSchema = z.object({
  name: z.string().trim().min(2).max(60),
  attending: z.boolean(),
  guests: z.number().int().min(0).max(3),
  message: z.string().trim().max(500).optional(),
  dietary: z.string().trim().max(120).optional(),
});

API POST — /app/api/rsvp/route.ts:
- Parse body com rsvpSchema; se falhar, retorna 400 com issues
- Hash IP: crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex')
- Rate limit caseiro em memória (Map<ipHash, timestamps[]>): max 3 submits/hora. Suficiente pra escala desse evento, sem dependência externa.
- prisma.rsvp.create({ data: {...validated, ipHash} })
- Retorna { ok: true, totalConfirmed }
- totalConfirmed = soma de (1 + guests) onde attending=true

API GET — /app/api/rsvp/count/route.ts:
- Retorna { confirmed: number, declined: number }
- Cache: export const revalidate = 30
- Use prisma.rsvp.aggregate ou groupBy

COMPONENTE — /components/sections/Rsvp.tsx (id="rsvp"):

Background accent (#F5A98A). Layout centralizado max-w-xl.

Cabeçalho:
- Sobretítulo: "Confirmação"
- Título: "Bora juntar a galera?"
- Texto: "Confirma aí pra gente ajustar a mesa e o estoque de cerveja. Prazo: 30 de abril."
- Contador social pequeno: "{n} já confirmaram presença" (puxa do /api/rsvp/count)

Form (react-hook-form + zodResolver(rsvpSchema)):
- Input: Seu nome
- Toggle/RadioGroup: Vai comparecer? [Tô dentro] [Não vou conseguir]
- Conditional (só se attending=true):
    - NumberInput: Quantos acompanhantes? (0-3, default 0)
    - Input opcional: Restrição alimentar? (placeholder: "vegetariano, sem glúten...")
- Textarea opcional: Recado pro Stênio (max 500)
- Button submit: "Confirmar" (loading state com spinner)

Após sucesso:
- canvas-confetti burst grande: { particleCount: 200, spread: 120, origin: { y: 0.6 } }
- Substitui form por card de sucesso:
    - Se attending: "Tá selada! Stênio mal pode te ver. 🍻"
    - Se !attending: "Sentiremos sua falta! Manda um abraço pelo mural."
- Botão "Deixar recado no mural" → scroll até #mural

Erros:
- Validação client-side via zod (instantânea)
- Erros do servidor mostrados em toast (use sonner do shadcn)
- Rate limit (429): "Calma aí, parceiro. Tenta de novo em alguns minutos."

LGPD: não armazenamos email/telefone. Adicione nota pequena abaixo do form: "A gente só guarda seu nome e a confirmação. Nada mais."
```

---

## FASE 5 — Mural de recados

```
SCHEMA — adicione:

model GuestbookMessage {
  id         String   @id @default(cuid())
  name       String
  message    String
  approved   Boolean  @default(false)
  createdAt  DateTime @default(now())
  @@index([approved, createdAt])
}

Migrate.

VALIDADOR:
export const guestbookSchema = z.object({
  name: z.string().trim().min(2).max(40),
  message: z.string().trim().min(3).max(240),
});

APIs:
- POST /api/guestbook → valida, cria com approved=false, retorna { ok: true, pending: true }
- GET /api/guestbook → retorna mensagens approved=true ordenadas por createdAt desc, limit 100
- Mesma estratégia de rate limit do RSVP (3/hora por ipHash)

COMPONENTE — /components/sections/Guestbook.tsx (id="mural"):

Background: background (#FAF6F0). Padding generoso.

Cabeçalho:
- Sobretítulo: "Mural"
- Título: "Deixa um recado pro aniversariante"
- Texto: "Memória boa, piada interna, abraço daqueles. Vai tudo no mural."

Form inline (max-w-md mx-auto):
- Input nome
- Textarea mensagem (240 char com contador visual)
- Button: "Mandar recado"
- Após sucesso: "Recadinho na fila pra aprovação. Logo logo aparece aqui."

Lista de mensagens aprovadas:

Layout masonry com CSS columns (sem lib):
className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"
Cada card: break-inside-avoid

Cada card:
- Padding generoso (p-6)
- Cor de fundo aleatória estável (hash do id) entre: #FFE9D6, #DCEFE3, #F5DCE0, #FFF4C2
- Rotação aleatória estável: rotate-[-2deg], rotate-[1deg], rotate-[-1deg], rotate-[2deg]
- Box-shadow tipo post-it (shadow-md, hover:shadow-xl transition)
- Hover: scale-105
- Mensagem em Inter, max 240 char (já validado)
- Nome em Fraunces, menor, abaixo, prefixado por "—"
- Data relativa pequena: "há 2 horas" (use date-fns/formatDistanceToNow com locale ptBR)

Animações:
- Stagger no mount: motion.div com initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition delay baseado no index (Math.min(index*0.05, 0.5))

Polling:
- useEffect com setInterval 30s pra refetchar /api/guestbook
- Sem WebSocket — overkill pra esse volume

Empty state:
- "Ainda ninguém deixou recado. Quebra o gelo aí!" + ilustração simples (use lucide MessageCircle gigante com opacity-20)
```

---

## FASE 6 — Quiz "Quanto você conhece o Stênio?"

```
DADOS — crie /lib/quiz-data.ts com 8-10 perguntas. Esqueleto:

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  reaction: { right: string; wrong: string };
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Qual cidade o Stênio chama de berço?",
    options: ["Brasília", "Goiânia", "[CIDADE_REAL]", "Cuiabá"],
    correctIndex: 2,
    reaction: { right: "Esse aí é raiz!", wrong: "Errou feio, parceiro." }
  },
  // ... mais 7-9 perguntas
];

DEIXE PLACEHOLDERS [CIDADE_REAL], [TIME_REAL], [COMIDA_FAVORITA] etc. pra eu preencher depois. Documente isso em comentário no topo do arquivo.

Sugestões de perguntas (todas com placeholder):
1. Cidade natal
2. Time de coração
3. Comida favorita do boteco
4. Banda/artista que mais escuta
5. Maior conquista profissional
6. Filme/série que assistiu mais vezes
7. Hobby fora do trabalho
8. Bebida preferida no happy hour
9. Frase típica que ele solta no corredor
10. Anos de PRF/serviço público

ESTADO — use useState local (sem persistir no DB; quiz é só diversão):

type QuizState = {
  phase: 'intro' | 'playing' | 'result';
  currentIndex: number;
  answers: number[]; // index escolhido por pergunta
};

COMPONENTE — /components/sections/Quiz.tsx:

Background: gradient from-primary to-primary/80. Texto cream.

FASE INTRO:
- Sobretítulo: "Quiz"
- Título: "Quanto você conhece o Stênio?"
- Texto: "10 perguntas. Quem acertar mais ganha o respeito da galera (e nada mais)."
- Botão grande "Bora!" → seta phase='playing'

FASE PLAYING:
- Barra de progresso no topo (currentIndex / total)
- Card central:
    - "Pergunta {currentIndex+1} de {total}"
    - Pergunta em Fraunces grande
    - 4 botões de opção em grid (grid-cols-1 md:grid-cols-2 gap-3)
    - Cada opção: bg-cream/10 hover:bg-cream/20 com transition
- Ao clicar:
    - Botão escolhido: se correto vira bg-emerald-500, se errado vira bg-red-500
    - Botão correto (se errou) também destaca em emerald
    - Mostra reaction text por 1.2s
    - Confete pequeno se acertou
    - Avança automaticamente após 1.5s (setTimeout com cleanup)
- Animação entre perguntas: AnimatePresence + slide horizontal (x: 100→0, exit x: -100)

FASE RESULT:
- Score grande: "{acertos}/{total}"
- Mensagem por faixa:
    - 9-10: "Você é da família. Stênio te deve uma."
    - 7-8: "Mandou bem, parceiro!"
    - 4-6: "Tá no caminho. Próximo happy hour eu te explico."
    - 0-3: "Você conheceu o Stênio agora? Vem na festa pra atualizar."
- Confete grande proporcional ao score
- Botões:
    - "Jogar de novo" → reset state
    - "Compartilhar score" → share API nativa OU fallback wa.me com texto: "Acertei {x}/{total} no quiz do aniversário do Stênio! 🎉 {url}"

Acessibilidade:
- Botões de opção navegáveis por teclado
- aria-live="polite" no feedback de resposta
- prefers-reduced-motion respeitado nas transições

Não persiste no DB. Score é efêmero por design (privacidade + simplicidade).
```

---

## FASE 7 — Painel admin

```
MIDDLEWARE — /middleware.ts:

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login') {
    const auth = req.cookies.get('admin-auth')?.value;
    const expected = process.env.ADMIN_PASSWORD_HASH;
    if (auth !== expected) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };

LOGIN — /app/admin/login/page.tsx:
- Form simples: campo password + submit
- POST /api/admin/login → server compara com bcrypt.compare(senha, ADMIN_PASSWORD_HASH)
  - OU: hash sha256 simples da senha em runtime e compara com env (suficiente pra esse caso)
- Sucesso: cookies.set('admin-auth', valueHash, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60*60*24 })
- Redirect /admin

DASHBOARD — /app/admin/page.tsx (server component):

Topo — 4 cards de métricas:
- Confirmados (sum 1+guests where attending=true)
- Não confirmados (count where attending=false)
- Total esperado (mesma fórmula confirmados)
- Mensagens pendentes (count where approved=false)

Layout: tabs do shadcn com 3 abas:

ABA 1: RSVPs
- Tabela shadcn (Name, Comparece?, Acompanhantes, Restrição, Mensagem, Data)
- Busca client-side por nome (input com filter no array)
- Sort por createdAt desc default
- Botão "Exportar CSV" → /api/admin/export.csv que retorna text/csv com BOM UTF-8 (Excel BR-friendly)

ABA 2: Mural pendente
- Lista de cards com mensagens approved=false
- Cada um: Nome, Mensagem, Data + 2 botões: Aprovar / Rejeitar
- Aprovar: PATCH /api/admin/guestbook/[id] { approved: true }
- Rejeitar: DELETE /api/admin/guestbook/[id]
- Optimistic UI: remove da lista no clique, rollback se erro

ABA 3: Mural aprovado
- Mesma lista, mas approved=true
- Botão "Reverter" se moderar errado (PATCH approved: false)

API ROTAS — todas verificam cookie admin-auth no handler antes de qualquer query.

Sem NextAuth. Pra um evento único com um único admin, senha em env é proporcional. Não escalaria pra produção real, mas escala pro caso.
```

---

## FASE 8 — Open Graph dinâmico

```
META TAGS — /app/layout.tsx:

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: "Stênio faz 55 — 07 de maio de 2026",
  description: "Boteco Caju Limão Sudoeste. Choppe gelado, petisco na chapa e 55 anos pra brindar. Confirma aí?",
  openGraph: {
    title: "Stênio faz 55 🍻",
    description: "07.05.2026 · Boteco Caju Limão Sudoeste. Vem com a gente?",
    url: "/",
    siteName: "Stênio 55",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Convite Stênio 55" }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  themeColor: "#F5A98A",
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
};

OG IMAGE DINÂMICA — /app/api/og/route.tsx (next/og):

import { ImageResponse } from 'next/og';
export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#F5A98A', fontFamily: 'serif',
      }}>
        <div style={{ fontSize: 140, fontWeight: 700, color: '#2A2A2A', letterSpacing: -4 }}>
          Stênio faz 55
        </div>
        <div style={{ fontSize: 36, color: '#2A2A2A', marginTop: 20 }}>
          07.05.2026 · Boteco Caju Limão Sudoeste
        </div>
        <div style={{ fontSize: 28, color: '#1F4D3A', marginTop: 40 }}>
          🍻 vem com a gente?
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

Idealmente embute o avatar como imagem de fundo. Pra isso:
- Coloque uma versão do avatar PNG em /public/og/avatar-bg.png
- Importe via fetch no edge: const data = await fetch(new URL('../../og/avatar-bg.png', import.meta.url)).then(r => r.arrayBuffer())
- Renderize como <img> dentro do JSX da ImageResponse

Teste após deploy:
- https://opengraph.xyz/url/https%3A%2F%2Fsteniofaz55.eteolabs.com.br
- WhatsApp: cole link em conversa de teste, vê preview
```

---

## FASE 9 — Polimento e deploy Railway

```
POLIMENTO

1. Favicon e ícones:
   - Gere favicon.ico, apple-touch-icon.png (180x180), icon-192.png, icon-512.png
   - Use os óculos roxos do avatar sobre fundo pêssego — distintivo
   - Adicione manifest.json em /public

2. Performance:
   - Todas as imagens do boteco em WebP, <150KB cada (use squoosh.app ou sharp)
   - next/image com sizes correto pra cada breakpoint
   - Lazy loading default pra tudo abaixo do fold
   - Lighthouse target: Performance 95+, Accessibility 100, Best Practices 100, SEO 100

3. Acessibilidade final:
   - Skip link no topo do <body>: "Pular para o conteúdo"
   - Foco visível em todos os elementos interativos (focus-visible:ring-2)
   - Contraste mínimo AA em todos os textos (verificar especialmente cream sobre accent)
   - alt em todas as imagens
   - aria-labels em botões só com ícone

4. Mobile:
   - Testar em iOS Safari real (svh, video autoplay com playsinline)
   - Testar em Android Chrome
   - Touch targets mínimo 44x44px

5. SEO:
   - sitemap.ts gerando /sitemap.xml
   - robots.ts (allow all, mas considere: convite particular? Se sim, robots disallow + noindex meta)

DEPLOY RAILWAY

1. Push do projeto pro GitHub (privado se preferir).

2. railway.app → New Project → Deploy from GitHub repo.

3. Add plugin: Postgres. DATABASE_URL é injetada automaticamente nas variáveis do serviço.

4. Adicione variáveis de ambiente no painel Railway:
   - ADMIN_PASSWORD_HASH (gere com: echo -n "suaSenha" | sha256sum)
   - IP_SALT (qualquer string longa aleatória)
   - NEXT_PUBLIC_SITE_URL=https://steniofaz55.eteolabs.com.br

5. Build command (no painel ou em railway.toml):
   npx prisma generate && npx prisma migrate deploy && npm run build

6. Start command:
   npm start

7. Custom domain:
   - Settings → Networking → Add custom domain → steniofaz55.eteolabs.com.br
   - Railway dá um valor de CNAME (ex: xyz.up.railway.app)
   - No DNS do eteolabs.com.br: cria CNAME steniofaz55 → xyz.up.railway.app
   - SSL é automático (Let's Encrypt via Railway)
   - Aguarda 5-15 min pra propagar

8. Pós-deploy:
   - Acesse o domínio, valida hero, RSVP, mural, quiz
   - Submeta um RSVP de teste, confirma no admin
   - Submeta uma mensagem de mural, aprova no admin
   - Testa OG: cola link no WhatsApp web
   - Testa .ics: baixa, abre no Google Calendar
   - Lighthouse no Chrome DevTools

9. Backup pré-evento (1 dia antes):
   - Exporta CSV de RSVPs
   - Pega snapshot do Postgres via Railway (Database → Backups)
```

---

## Decisões pendentes (preencher antes do deploy)

- [ ] Coordenadas GPS exatas do Boteco Caju Limão Sudoeste (pra GEO no .ics) — busca rápida no Maps
- [ ] Conteúdo das 10 perguntas do quiz (substituir placeholders em /lib/quiz-data.ts)
- [ ] Texto descritivo do boteco na seção Venue (1-2 frases sob medida)
- [ ] Decisão: convite indexável no Google ou privado? (afeta robots.ts)
- [ ] Senha admin definida e hash gerado

## Ordem de execução recomendada

Fase 0 → 1 → 2 → 3 → 4 → 7 (admin antes do mural pra moderar desde o início) → 5 → 6 → 8 → 9.

Faça commit ao final de cada fase. Se algo quebrar, `git revert` é mais barato que debugar.

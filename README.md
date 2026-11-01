# Kingdoms of Eternia — Multiplayer online + Contas (v2.0.0)

Tower defense pixel-art em HTML5 Canvas. **Modo solo continua 100% funcional offline** (abrir `web/index.html`, sem servidor).
Multiplayer cooperativo (até 6 jogadores) e contas com progresso salvo em banco de dados exigem o servidor Node.js.

## 1. Arquitetura

```
 Navegador (Vercel, estático)  ──HTTPS /api/*──▶  Servidor Node.js (Render/Railway/Fly…)  ──▶  PostgreSQL (Neon/Supabase/…)
        web/index.html          ──WSS  /ws ────▶   server/server.js  (WebSocket + API REST)       (ou SQLite em volume)
```
* **Vercel** só serve o frontend estático (não mantém WebSocket nem disco). A URL do servidor é injetada no build (`ETERNIA_SERVER_URL`).
* **Servidor** em hospedagem com conexões persistentes. Roda o *mesmo motor de jogo* do cliente (`game-core.js`, gerado do código do cliente) a 60 Hz; clientes enviam só intenções (construir, melhorar, vender, próxima onda); o servidor valida (ouro, posição, posse da torre, dono) e envia snapshots (~15/s). Não existe estado duplicado → sem dessincronização; ouro/vidas/ondas não são manipuláveis pelo cliente.
* **Banco**: `DATABASE_URL` → PostgreSQL (recomendado: dados fora do servidor, sobrevivem a deploys). Sem ela → SQLite em `DATA_DIR` (exige disco persistente).
* **Contas**: senha com *scrypt* + sal aleatório (nunca em texto puro); sessão = token aleatório de 256 bits (só o SHA-256 fica no banco, validade 90 dias, máx. 6 por conta); limite de tentativas por IP e usuário; perfil validado/limitado campo a campo; controle de concorrência (dois dispositivos são unidos, sem perder torres/moedas).
* **Salas**: código de 5 caracteres, máx. 6 jogadores, anfitrião promovido se sair, reconexão automática (90 s em jogo), expulsão pelo anfitrião, limite de mensagens/IP/sala, `ALLOWED_ORIGINS`.
* **Recompensas**: cada partida online tem um `gid`; o cliente registra o `gid` já recebido (sem duplicar moedas/XP).

## 2. Arquivos
**Criados:** `server/{server,rooms,accounts,db,game-core}.js`, `server/{package.json,.env.example,Dockerfile,render.yaml}`, `web/{build.js,vercel.json}`, `tests/*.js`, `README.md`.
**Modificado:** `web/index.html` (era o `index.html` único; agora inclui: login/cadastro, perfil, lobby multiplayer, cliente de rede, sincronização da conta, partida online, indicadores de conexão, backup por código; sorteio de torres, modo solo e todo o resto mantidos).
`game-core.js` é **gerado** do código do jogo (não edite à mão).

## 3. Instalar e rodar localmente
Requer **Node 22.5+**.
```bash
cd server && npm install
node server.js            # http://localhost:8080  (também serve web/index.html)
```
Abra `http://localhost:8080` em 2 abas/computadores da rede (`http://IP-DO-PC:8080`) para testar. Sem `DATABASE_URL` usa SQLite em `server/data/`.
Solo sem servidor: abra `web/index.html` direto no navegador.

## 4. Variáveis de ambiente (servidor)
| Variável | Para quê |
|---|---|
| `DATABASE_URL` | URL do Postgres (ex.: `postgres://user:senha@host/db?sslmode=require`). **Segredo — só no painel da hospedagem.** |
| `ALLOWED_ORIGINS` | Domínio(s) do frontend, separados por vírgula. Ex.: `https://seu-jogo.vercel.app` |
| `PORT` | Porta (a hospedagem costuma definir) |
| `TRUST_PROXY` | `true` atrás de proxy (padrão) |
| `DATA_DIR` | Pasta do SQLite (sem `DATABASE_URL`) |
| `MAX_ROOMS`, `MAX_USERS`, `MAX_CONN_PER_IP`, `SNAP_HZ`, `PG_POOL_MAX`, `PGSSL` | Limites/ajustes opcionais |

Frontend (Vercel): `ETERNIA_SERVER_URL` = `https://seu-servidor…` (sem barra no fim).
Nenhuma senha/chave está no código; veja `server/.env.example`.

## 5. Banco de dados
As tabelas (`users`, `tokens`, `profiles`) são criadas **automaticamente** na primeira inicialização. Basta criar um Postgres vazio (ex.: Neon ou Supabase, planos gratuitos — confira as condições atuais) e colar a connection string em `DATABASE_URL`. Guardado por conta: moedas, torres, melhorias, mapas/estrelas, melhor onda por mapa, estatísticas, conquistas, histórico, configurações.

## 6. Publicar
**Servidor (ex.: Render):** novo *Web Service* a partir do repositório, *Root Directory* `server`, build `npm install --omit=dev`, start `node server.js`, Node 22, health check `/health`. Defina `DATABASE_URL` e `ALLOWED_ORIGINS`. (`render.yaml` e `Dockerfile` prontos; serve também para Railway/Fly.) Anote a URL pública `https://….onrender.com`.
**Frontend (Vercel):** importe o repositório, *Root Directory* `web`; em *Environment Variables* defina `ETERNIA_SERVER_URL` com a URL do servidor; deploy (usa `vercel.json` → `node build.js` → `public/`). Depois volte ao servidor e ponha o domínio da Vercel em `ALLOWED_ORIGINS`.
Convite: na sala, “Copiar link de convite” gera `https://seu-jogo.vercel.app/?room=CODIGO` (entra direto).
Planos gratuitos podem “dormir” por inatividade — a 1ª conexão pode demorar; o jogo avisa e tenta de novo.

## 7. O que depende de você
* Contas na hospedagem do servidor, do Postgres e da Vercel; `DATABASE_URL`; `ETERNIA_SERVER_URL`; `ALLOWED_ORIGINS`.
* Rodar `npm install` no servidor (instala `ws` e `pg`).

## 8. Limitações honestas
* **Testado aqui:** motor headless, 21 testes de contas (SQLite e SQL em Postgres 16 real), 37 testes de WebSocket com bots, testes em navegador (2 jogadores: criar/entrar, construir, sincronização, ondas, reconexão, troca de anfitrião; login em 2 “computadores”, merge, regressão do modo solo).
* **Não testado:** deploy real (Vercel/Render), o driver `pg` instalado de verdade (o SQL foi validado no Postgres via `psql`; o pacote `pg` não pôde ser instalado neste ambiente), carga com muitos jogadores.
* **Confiança no cliente:** o progresso/recompensas de fim de partida são calculados no cliente; o servidor só valida formato e limites. Dá para um usuário mexer no próprio save — não afeta partidas online (ouro, vidas, ondas e torres usadas são decididos/validados pelo servidor; online ignora melhorias permanentes). Para economia 100% à prova de trapaça seria preciso mover sorteio e recompensas para o servidor.
* Salas ficam na memória do servidor: reiniciar o servidor encerra as partidas em andamento (contas/progresso ficam no banco).
* Visitantes (sem conta) usam só as torres iniciais online.

## 9. Testes
`tests/` (precisam de Playwright e do servidor rodando; veja o topo de cada arquivo). `t_accounts.js`, `t_ws.js`, `t_mp.js`, `t_acct_ui.js`.

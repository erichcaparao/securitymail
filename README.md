# Simulação de Phishing Interna — Engelmig TI

Exercício **autorizado** de conscientização em segurança, conduzido pelo Departamento de TI contra os próprios colaboradores. Stack: **Next.js + MySQL + Brevo**.

Campanha: *Planejamento Orçamentário 2027* (tema: base histórica Set/2025–Ago/2026 no Plano/AllStrategy, login Microsoft 365).

## Privacidade (importante)
- **A senha digitada NUNCA é transmitida nem armazenada.** Na tela falsa, o campo de senha existe só para realismo; ao submeter, o navegador envia apenas `token` + e-mail. Não há coluna de senha no banco.
- Registramos somente: **recebeu / abriu / clicou / submeteu (caiu)**.

## Fluxo
1. E-mail (Brevo) → link `/acesso?id=TOKEN`
2. Tela de login Microsoft 365 falsa (registra clique e submissão)
3. Página educativa `/resultado` ("isto foi uma simulação")

## Setup

```bash
cd c:\xampp\htdocs\engelmig\phishing
npm install
```

1. **Banco:** rode `db/schema.sql` conectado ao banco `engelmig_phishing` (host 172.25.1.48).
2. **.env.local:** ajuste `BASE_URL` (URL pública real), `ADMIN_USER/ADMIN_PASS` e `BREVO_WEBHOOK_SECRET`.
   - ⚠️ A senha do MySQL e a API key do Brevo foram expostas em chat — **gere novas e troque aqui**.
3. **Build e start:**
```bash
npm run build
npm start        # http://localhost:3000
```

## Uso no painel (`/admin`, protegido por Basic Auth)
- **Contatos:** cole a lista ou envie `.csv` (`nome, email, cargo`). Um token único é gerado por pessoa.
- **Template:** pré-visualize o e-mail e dispare a campanha (pendentes ou todos).
- **Indicadores:** destinatários, enviados, receberam, abriram, clicaram, caíram + taxas.

Disparo por CLI (alternativa): `npm run enviar` (só pendentes) ou `npm run enviar -- todos`.

## Rastreio de abertura/recebimento (Brevo)
Configure no Brevo o webhook transacional apontando para:

```
{BASE_URL}/api/brevo-webhook?s={BREVO_WEBHOOK_SECRET}
```

Eventos tratados: `delivered` (recebeu), `opened` (abriu), `click`, `hard/soft_bounce`, `spam`.
O mapeamento ao destinatário é feito pela **tag = token** (enviada em cada e-mail) ou pelo e-mail.

## Entregabilidade / cuidados
- Autentique o domínio remetente no Brevo (**SPF, DKIM, DMARC**) para não cair em spam nem queimar o domínio.
- O remetente atual do `.env.local` usa `@engelmig.com.br` — só funciona bem com o domínio verificado no Brevo. A conta Brevo informada faz login com um Gmail; valide qual domínio/sender está autorizado.
- **Tenha autorização formal por escrito** (diretoria/RH/jurídico) antes de disparar.
- Comunique o resultado de forma **educativa e sem punição**; evite expor nominalmente quem caiu.

## Estrutura
```
app/acesso            tela M365 falsa (rastreio clique/submissão, sem senha)
app/resultado         página educativa
app/admin             painel (indicadores / contatos / template)
app/api/track         log de clique/submissão
app/api/import        importação de contatos
app/api/enviar        disparo via Brevo
app/api/brevo-webhook eventos do Brevo (recebeu/abriu/clicou)
lib/                  db, template, brevo, token
db/schema.sql         estrutura do banco
scripts/enviar.mjs    disparo por linha de comando
```

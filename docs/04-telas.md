# Telas (Frontend)

Duas telas, ambas HTML estático + JS inline (sem framework), servidas pelo próprio Express e consumindo a API por `fetch`. Visual em tema escuro.

## Tela do recrutador — `public/index.html` (rota `/`)

Servida como `index.html` estático. Gated por login.

### Estrutura
- **Barra de usuário** (`#userbar`): no carregamento chama `GET /api/me`.
  - Sem login → mostra "Você não está logado" + botão **Entrar com Google** (link para `/login`); o resto da tela (`#app`) fica escondido.
  - Logado → mostra "Logado como `<email>`" + link **sair** (`/logout`) e exibe o app.
- **Painel de participantes** (esquerda): montado a partir de `GET /api/config`. Cada pessoa tem dois checkboxes:
  - **Incluir** → entra como convidado.
  - **Obrig.** → entra no cálculo de disponibilidade. Marcar "Obrig." força "Incluir"; desmarcar "Incluir" remove "Obrig.".
- **Barra de ferramentas:**
  - **Duração (min)**: input numérico, default vindo de `config.defaultDurationMin` (30). Fácil de alterar.
  - **Urgência (ignora opcionais)**: checkbox; ao mudar, recarrega os horários.
  - Navegação de semana **←/→** (a anterior trava em `weekOffset = 0`) e botão **Buscar horários**.
- **Legenda:** azul = livre para todos; vermelho = só ignorando opcionais; verde = selecionado.
- **Grade** (`#grid`): 5 colunas (seg–sex). Cada horário é um item clicável:
  - classe `urgentslot` (vermelho) quando `urgentOnly` (com `title` listando os opcionais em conflito);
  - classe `selected` (verde, com ✓) quando está na seleção.
  - Clicar **alterna a seleção** (não agenda). A grade é re-renderizada a partir do último resultado (`lastData`) sem refazer o fetch.
- **Barra de geração** (`#genbar`, fixa embaixo): contador de selecionados, botão **Gerar link**, campo com o link gerado, **Copiar** e **Limpar seleção**.

### Chamadas à API
- `GET /api/me` — estado de login.
- `GET /api/config` — lista de pessoas + duração padrão.
- `GET /api/slots?weekOffset&duration&urgent&included&required` — horários da semana.
- `POST /api/links` (body: `included`, `required`, `urgent`, `duration`, `slots`) — gera o link; o `organizer` é definido no servidor pela sessão.

### Comportamentos
- Trocar a duração limpa a seleção e recarrega.
- `included` e `required` são derivados dos checkboxes; a constraint enviada depende da urgência (mas o servidor recalcula de qualquer forma).

## Tela do candidato — `public/candidate.html` (rota `/convite`)

Servida pelo Express em `GET /convite` (`res.sendFile(candidate.html)`). Pública, sem login. Lê o `id` da query string (`?id=...`).

### Estrutura
- **Título/subtítulo**: preenchidos a partir da resposta de `/api/links/:id/slots` (título do evento, duração, nº de horários disponíveis e quantos "ficaram indisponíveis e foram removidos").
- **Campo de e-mail** (obrigatório antes de escolher horário; aceita externo).
- **Grade** agrupada por dia (a partir dos slots disponíveis revalidados). Se zero, mostra "Nenhum horário disponível no momento".
- **Modal de confirmação**: ao clicar num horário (com e-mail preenchido), abre confirmando data/hora e e-mail; confirmar dispara o agendamento.

### Chamadas à API
- `GET /api/links/:id/slots` — horários ainda livres (revalidados como o organizador).
- `POST /api/links/:id/book` (body: `start`, `email`) — cria o convite; resposta traz `htmlLink` (link "ver evento") e, se aplicável, info de urgência/ignorados.

### Comportamentos
- Exige e-mail válido antes de abrir o modal.
- Após sucesso, mostra "Agendado!" com link para o evento e recarrega a lista (o horário recém-marcado some na revalidação).

## Observações de frontend
- Sem dependências externas: todo CSS e JS estão inline nos HTML.
- As datas/horas vêm do servidor já formatadas em SP (string `label` "HH:MM" e `date` "YYYY-MM-DD"); o frontend só formata para "DD/MM" e nome do dia.

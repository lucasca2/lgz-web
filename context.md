# Contexto para IA — Hackathon Wave 2026
## People AI Platform — Recrutamento Inteligente

> **Instruções de uso:** Este documento contém todo o contexto estratégico, técnico e operacional discutido para a construção da solução do hackathon. Cole este conteúdo no início de qualquer conversa com Claude ou outra IA para garantir alinhamento total com o que foi definido. O documento é autocontido — nenhuma informação adicional é necessária para entender o problema e a proposta.

---

## 1. CONTEXTO DO HACKATHON

**Evento:** Hackathon AI · Wave · 23 a 27 de junho de 2026
**Objetivo geral:** Reunir times de Tecnologia e Backoffice para construir agentes de IA que automatizem tarefas repetitivas e manuais do dia a dia de People e Financeiro.
**Nosso time:** 6 pessoas — 1 PM e 5 desenvolvedores fullstack sêniors com forte domínio em IA e automação.
**Desafios escolhidos:** 01, 02 e 03 — todos da área de People, com foco na recrutadora Beatriz Pierotti (Bia).
**Dia de build:** 27/06. Apresentações a partir das 15h30 — 30 minutos por grupo.
**Critério de avaliação:** Impacto, qualidade da solução, aderência à necessidade e usabilidade para quem vai usar no dia a dia.
**Penalidade:** Desafios selecionados e não entregues descontam pontos. Escopo realista é obrigatório.
**Premiação:** Jantar em São Paulo oferecido pela Wave.

---

## 2. A USUÁRIA CENTRAL

**Nome:** Beatriz Pierotti (Bia)
**Cargo:** Tech Recruiter
**Empresa:** Wave (Bemobi)
**Perfil:** Profissional de recrutamento em início de carreira. Opera sozinha num processo de alta complexidade — múltiplos projetos e clientes em paralelo (Tim, Sabesp, Algar, Telcel, Anti-spam, entre outros). Não tem par, não tem analista de apoio, não tem sistema dedicado de ATS.

### Ferramentas que usa hoje
- **Google Sheets** com 9 abas interconectadas como "sistema de recrutamento"
- **LinkedIn Premium + LinkedIn Recruiter** para hunting e abordagem de candidatos
- **Calendly** para agendamento da 1ª entrevista (agenda própria da Bia — não funciona para etapas subsequentes)
- **Agente de IA do Marquinhos** para análise de transcrições e ranqueamento de perfis (subutilizado)
- **WhatsApp e LinkedIn Recruiter inbox** para comunicação com candidatos (evita Gupy como canal adicional)
- **ChatGPT** para redigir feedbacks de reprovação

### Os três pilares que a Bia exige em qualquer solução
1. **Velocidade** — menos tempo entre cada etapa do processo
2. **Otimização** — candidatos com maior fit chegando ao funil; menos trabalho operacional
3. **Flexibilidade** — processo não-linear que não quebra com exceções; Bia no controle de cada decisão

### Constraint de autonomia — inegociável
A solução não pode depender de dev para ajustar configurações, mudar perguntas ou corrigir dados. A Bia precisa editar, corrigir e ajustar qualquer campo diretamente na interface, sem suporte técnico. A interface precisa ser tão intuitiva quanto o Google Sheets que ela já usa.

---

## 3. CONTEXTO ESTRATÉGICO — VISÃO DA LIDERANÇA

**Gabriela Monteiro** é a liderança direta da Bia e foi entrevistada para contextualização estratégica. Seus pontos mais importantes:

### O diagnóstico dela
- A Bia está fazendo ~20 entrevistas por semana, mas poucas avançam de etapa
- De abril para maio, aumentou uma entrevista por dia e a conversão **não melhorou**
- O filtro atual não é estratégico: 45 min por entrevista para descobrir que a pessoa não tem fit
- A principal barreira de reprovação **não é técnica — é cultural**. Difícil de mapear pelo LinkedIn. Resultado muito no feeling da Bia

### O reframe central (o mais importante do projeto)
> "Ela está fazendo um filtro que não é estratégico. Ela está perdendo tempo de entrevista para descobrir que a pessoa não tem o nosso perfil."
> "Volume não está resolvendo. A gente aumentou uma entrevista por dia e isso não se converteu em mais gente."

**Conclusão estratégica:** Mais velocidade operacional sem melhorar o filtro de entrada vai gerar mais do mesmo. O problema é qualitativo, não quantitativo.

### O ativo que a Gabi revelou
A ferramenta do Marquinhos já tem **todo o histórico de aprovados e reprovados** das entrevistas passadas. Isso é a base de treinamento para calibrar qualquer modelo de fit cultural. Não precisa criar do zero — precisa usar o que já existe dentro de casa.

### O tempo ganho com automação não deve virar mais volume
O tempo liberado com automação deve ir para entrevistas com candidatos de maior probabilidade de conversão — não para mais entrevistas com o mesmo perfil de baixa conversão.

---

## 4. OS TRÊS DESAFIOS — ENUNCIADO OFICIAL

### Desafio 01 · Sourcing e triagem de candidatos no LinkedIn
**Problema:** A partir dos requisitos da vaga, a recrutadora busca perfis no LinkedIn e valida cada um manualmente, gastando muito tempo com perfis desalinhados, e salva os contatos numa planilha para não perder a origem.
**Por quê:** Encontrar e validar bons candidatos é o que alimenta o funil de contratação — sem perfis qualificados, as vagas não avançam.

### Desafio 02 · Análise e insights do funil de recrutamento
**Problema:** Hoje os dados de candidatos são consolidados e cruzados manualmente no Google Sheets, com alto risco de erro e dificuldade de transformar números em conclusões. Precisamos de uma forma de gerar insights sobre o processo de recrutamento, olhando tanto para a quantidade de pessoas em cada etapa quanto para a ferramenta de feedback das entrevistas.
**Por quê:** Enxergar o funil com clareza — quantos candidatos, em que etapa e com quais feedbacks — é o que permite acompanhar e melhorar o recrutamento.

### Desafio 03 · Agendamento de entrevistas — casar agendas
**Problema:** Marcar uma entrevista exige encontrar um horário livre em comum entre três agendas — dois entrevistadores (quaisquer que sejam) e o candidato. Hoje esse cruzamento é feito manualmente. O objetivo é automatizar a busca por janelas que sirvam aos dois entrevistadores e ao candidato ao mesmo tempo.
**Por quê:** Achar rapidamente o horário que atende a todos acelera o agendamento e elimina as idas e vindas para fechar a entrevista.

---

## 5. DIAGNÓSTICO DETALHADO POR DESAFIO

### Desafio 01 — O que está acontecendo hoje

**Dores reais levantadas na entrevista com a Bia:**
- Filtros nativos do LinkedIn são ruins: busca por "espanhol avançado" traz básico e intermediário; filtro de gênero não existe (impacta estratégia de diversidade)
- Plataforma força uso do plano premium para funcionalidades essenciais (~4x mais caro)
- Revisão manual perfil a perfil: abre cada perfil individualmente, desce até o final para validar idioma e senioridade
- Workaround precário: usa boolean NOT nas palavras-chave para compensar filtros fracos
- Triagem por feeling: perguntas enviadas pelo LinkedIn são avaliadas subjetivamente, sem critério estruturado

**O que já existe e funcionou:**
- Agente do Marquinhos recebia PDFs das páginas de resultado + descritivo da vaga e ranqueava os perfis
- De 25 perfis → filtrou 5-6 mais aderentes. Resultado foi positivo
- **Gargalo não é o agente — é a forma de alimentá-lo:** limite de 25 PDFs/mês via página de busca do LinkedIn Recruiter
- Download direto pelo perfil individual do candidato pode ser ilimitado (a confirmar pelo time tech)

**Constraint crítico — não negociável:**
- LinkedIn detecta bots e automações com facilidade
- LinkedIn free: pausa temporária da página
- LinkedIn Premium: bloqueia a conta inteira até o dia seguinte
- **A conta da Bia é seu principal instrumento de trabalho. Risco zero é obrigatório.**
- Marquinhos já pesquisou automações externas e o risco de bloqueio inviabilizou todas

**O que a Bia já está testando (com resultado ainda inconclusivo):**
- Envio de perguntas iniciais via LinkedIn antes de agendar entrevista
- Ajuste recente na mensagem: deixa claro que o ambiente é dinâmico, com clientes tradicionais e alta abstração

---

### Desafio 02 — O que está acontecendo hoje

**Dores reais levantadas na entrevista com a Bia:**
- ~2h gastas toda quinzena compilando dados manualmente no Google Sheets para gerar análises de backoffice
- Tabelas dinâmicas bugam com frequência — qualquer ajuste de estrutura derruba fórmulas existentes
- Sem SLA confiável por etapa: o processo não-linear impede rastrear tempo entre etapas de forma automatizada
- Motivos de reprovação inseridos manualmente — sujeitos a esquecimento, inconsistência e erro de classificação
- Decisões por feeling: a Bia não consegue mostrar dados para a liderança (Garrido) sobre o que está funcionando
- A Bia não aproveita 100% do retorno do agente: refina manualmente e registra percepção própria, não o output completo

**A complexidade do fluxo — por design deliberado:**
- Processo seletivo é intencionalmente não-linear para não perder talentos por rigidez
- Ordem das etapas varia por vaga, candidato e disponibilidade de agenda
- Exemplo: etapa cultural pode ocorrer antes da técnica; candidatos fortes pulam etapas
- A planilha usa Sim / Não / Não Aplicável para acomodar essa variação
- **A flexibilidade não é um bug — é uma feature. A solução não pode forçar linearidade**

**Fluxo de entrevistas padrão (referência, não obrigatório):**

Para júnior/pleno:
1. Entrevista People (Bia)
2. Entrevista Técnica (sempre em dupla)
3. Teste Técnico
4. Entrevista Cultural (Marquinhos ou Gabi)

Para sênior/tech lead/staff:
1. Entrevista People (Bia)
2. Entrevista Técnica (Marquinhos)
3. Teste Técnico
4. Entrevista Cultural (Garrido)

**Estrutura de dados da planilha (já validada pela Bia):**

*Aba "Base de Candidatos" — 22 colunas:*
Nome, telefone, e-mail, pretensão salarial, LinkedIn, origem (Hunting / Gupy / Indicação), ferramenta, vaga, projeto, mês/ano da 1ª entrevista, etapas realizadas (número), etapa People (Sim/N/A), etapa Teste (Sim/N/A), etapa Técnico (Sim/N/A), etapa Liderança (Sim/N/A), etapa Cultura (Sim/N/A), etapa atual, status do candidato (Aprovado / Reprovado / Em andamento / Base de Talentos), etapa de eliminação, comentários/justificativa de reprovação, devolutiva enviada (TRUE/FALSE)

*Aba "Projeto":*
Prioridade, projeto, vaga, status (Aberta / Fechada / Stand-by / Cancelada), SLA em dias, data de abertura, data de fechamento, hiring manager, nome do contratado, budget

*Aba "Respostas Formulário Abertura de Vaga" — 26 campos:*
Contexto do projeto, soft skills indispensáveis, perfil que funciona no time, perfil que **não** funciona, contato com clientes, critérios do teste técnico, entre outros. **Este é o ativo mais subutilizado — já existe e não alimenta automaticamente nenhum agente.**

*Outras abas:* OKRs (acompanhamento semanal), Métricas LinkedIn, Vagas (Micro — pipeline por etapas), Explicação (instruções de uso da planilha)

**OKR existente mas inviável sem automação:**
- Meta: reduzir ciclo médio de recrutamento de 66 para 50 dias
- Sem SLA automatizado por etapa, esse número depende de cálculo manual e é pouco confiável

---

### Desafio 03 — O que está acontecendo hoje

**Dores reais levantadas na entrevista com a Bia:**
- Calendly resolve apenas a 1ª etapa (agenda própria da Bia). Todas as demais são 100% manuais
- Para cada entrevista subsequente: busca slot comum entre 2+ entrevistadores e o candidato no olho, via Google Calendar
- Após achar o slot: cria invite → copia link do LinkedIn do candidato → adiciona e-mails dos entrevistadores → envia confirmação por WhatsApp — tudo manual, passo a passo

**Contexto técnico relevante:**
- Google Calendar já mostra horários em comum entre agendas — mas só mostra, não age
- APIs do Google Calendar disponíveis para leitura de disponibilidade e criação de eventos
- APIs do Calendly existem — ponto a explorar pelo time
- Comunicação preferida da Bia com candidatos: WhatsApp e LinkedIn Recruiter inbox (separado do LinkedIn pessoal)
- Gupy tem dados mas a Bia evita usá-lo como canal de comunicação — uma plataforma a mais

---

## 6. A PROPOSTA DE SOLUÇÃO — VISÃO CONSOLIDADA

### Princípio central
Os três desafios não são problemas isolados — são etapas sequenciais de um mesmo processo. A solução é **uma plataforma única** que conecta o momento da abertura da vaga até a atualização automática do funil e a geração de KPIs, com a Bia no controle de cada decisão.

### O que muda com a plataforma

| Hoje (manual) | Com a plataforma (automatizado) |
|---|---|
| Bia abre perfil por perfil no LinkedIn | Agente ranqueia perfis por aderência ao JD |
| Perguntas enviadas pelo feeling | Questionário gerado por IA com base no histórico |
| Respostas avaliadas subjetivamente | Agente gera score de fit com justificativa |
| Bia gasta 45min para descobrir falta de fit | Candidatos sem fit são filtrados antes da entrevista |
| Dados copiados manualmente do Calendly | Pré-preenchimento automático ao confirmar agendamento |
| Slot de agenda buscado manualmente | Plataforma sugere janelas em comum e cria o invite |
| Transcrição colada manualmente no agente | Transcrição vai automaticamente à plataforma |
| ~2h compilando KPIs para reunião quinzenal | Dashboard gerado em tempo real sem trabalho manual |
| SLA calculado manualmente e impreciso | SLA calculado automaticamente com mecanismo de pause |

### Fluxo end-to-end proposto

```
LINHA 1 — PRÉ-FILTRO (antes da 1ª entrevista)
Solicitação de nova vaga
→ Preenchimento do formulário na plataforma (26 campos: critérios técnicos, soft skills, perfil ideal)
→ [AUTOMAÇÃO] Plataforma estrutura critérios e alimenta o agente
→ Hunting no LinkedIn — Bia busca candidatos normalmente
→ [AUTOMAÇÃO] Agente ranqueia perfis por aderência ao JD (sem automação invasiva)
→ Bia seleciona candidatos ranqueados para abordar
→ Abordagem no LinkedIn
→ Candidato responde
→ [AUTOMAÇÃO] Plataforma gera questionário de fit cultural calibrado pelo histórico de aprovados e reprovados
→ Candidato responde questionário via link externo (fora do LinkedIn)
→ [AUTOMAÇÃO] Agente avalia respostas e gera score de fit com justificativa
→ Bia avalia score de fit
  → Score baixo: Reprovado — feedback automático gerado e enviado
  → Score alto: Aprovado para entrevista People

LINHA 2 — PROCESSO (após aprovação no filtro)
Aprovado para entrevista People
→ [AUTOMAÇÃO] Plataforma sugere slots disponíveis na agenda da Bia
→ Envio do Calendly — candidato agenda 1ª entrevista
→ [AUTOMAÇÃO] Dados do candidato pré-preenchidos na plataforma
→ Entrevista People com a Bia
→ [AUTOMAÇÃO] Transcrição vai à plataforma — agente gera análise automática
→ Bia decide com base na análise
  → Reprovado: Feedback gerado automaticamente e enviado
  → Aprovado: Avança para próxima etapa
→ [AUTOMAÇÃO] Plataforma sugere slots em comum entre 2+ entrevistadores e candidato
→ Invite criado e enviado — Bia confirma em 1 clique
→ Entrevistas subsequentes (Técnica · Teste · Cultural)
→ [AUTOMAÇÃO] Funil atualizado em tempo real — SLA, status e KPIs gerados automaticamente
→ Loop: próxima etapa → slots → invite → entrevista
→ Etapas concluídas → Proposta
→ [AUTOMAÇÃO] KPIs e insights do processo disponíveis para relatório quinzenal
```

### A camada de aprendizado — parte da visão de produto
- Cada candidato que passa pelo questionário e tem um desfecho (aprovado, reprovado, declinou) alimenta o modelo de avaliação
- Com o tempo, o agente identifica padrões: quais respostas predizem aprovação, quais perguntas discriminam melhor entre perfis
- As próprias perguntas do questionário podem evoluir: se uma pergunta não está discriminando bem, ela é revisada
- O histórico que já existe no agente do Marquinhos é o ponto de partida — não precisa começar do zero
- **Esta é a visão de produto — o time tech decide se entra no build do hackathon ou é apresentado como evolução futura**

---

## 7. COMO OS TRÊS DESAFIOS SE INTEGRAM

| Desafio | Entrada | O que a plataforma faz | Saída para os outros |
|---|---|---|---|
| 01 · Triagem | Formulário da vaga (D02) + perfis do LinkedIn | Ranqueia candidatos por fit. Gera e envia questionário. Avalia respostas com o agente. | Score de fit → dispara agendamento (D03). Resultado → registra no funil (D02). |
| 02 · Funil & KPIs | Formulário de abertura + dados de todos os eventos | Mantém funil em tempo real. Calcula SLA. Gera KPIs automáticos. Envia relatório quinzenal. | Critérios da vaga → alimenta agente (D01). Etapas agendadas → recebe atualização (D03). |
| 03 · Agendamento | Candidato aprovado no filtro (D01) + entrevistadores | Busca horários em comum. Cria invite e envia confirmação com um clique da Bia. | Evento criado → atualiza etapa no funil (D02). Dados do candidato → pré-preenchidos no invite. |

**Princípio de integração:** Nada cria dados em paralelo — tudo alimenta a mesma base central.

---

## 8. ATIVOS EXISTENTES QUE DEVEM SER APROVEITADOS

### Agente do Marquinhos
- Já existe e já funciona
- Já ranqueia perfis por aderência ao JD (input: PDF de perfis + descritivo da vaga)
- Já analisa transcrições de entrevistas e gera: resumo, avaliação, recomendação, pontos fortes e pontos de atenção
- Já tem histórico completo de aprovados e reprovados — base para calibrar o questionário de fit
- **Não precisa ser reconstruído — precisa ser integrado como motor de avaliação, com input automatizado e output estruturado**

### Planilha de People (Google Sheets)
- Schema de dados já validado pela Bia no dia a dia
- 22 colunas cobrindo toda a jornada do candidato
- A Bia conhece e controla essa estrutura
- **A plataforma pode replicar ou integrar essa estrutura — sem forçar uma mudança que gere resistência**

### Formulário de abertura de vaga
- 26 campos ricos já preenchidos pelos hiring managers
- Contém exatamente o que um agente de triagem precisaria para avaliar fit: contexto do projeto, soft skills, perfil que funciona, perfil que não funciona
- **Dados que já existem e que hoje não alimentam automaticamente nenhum agente de triagem**

### Calendly
- Já usado pela Bia para a 1ª entrevista
- Tem APIs disponíveis para integração
- Captura: nome, telefone, e-mail e LinkedIn do candidato

---

## 9. CONSTRAINTS E DECISÕES TÉCNICAS

### Constraints não negociáveis

**1. LinkedIn — risco zero de bloqueio**
Qualquer solução que simule ações humanas automatizadas (cliques, scrolls, abertura sequencial de perfis) arrisca a conta da Bia. A conta é o principal instrumento de trabalho dela. O time deve escolher uma abordagem que opere dentro das permissões da plataforma.

**2. Autonomia operacional da Bia**
A solução não pode depender de dev para ajustar configurações. Qualquer campo precisa ser editável por ela diretamente na interface.

**3. Processo não-linear por design**
A plataforma não pode forçar um fluxo rígido. Etapas puladas, ordem invertida e N/A são casos esperados e frequentes — a solução precisa acomodar isso sem bugar o SLA ou os KPIs. O mecanismo de SLA precisa de um botão de "pause" para situações de dependência externa (candidato sumiu, entrevistador indisponível).

**4. O demo precisa funcionar de ponta a ponta**
27/06 é o dia de build. Desafios selecionados e não entregues descontam pontos.

### Decisões que o time tech precisa tomar

1. **Abordagem LinkedIn:** extensão de Chrome (lê a página enquanto a Bia navega normalmente), fluxo de PDF otimizado (mantém input manual mas torna análise fluida), ou API oficial do LinkedIn (mais limitada, sem risco de bloqueio — requer aprovação)

2. **Plataforma vs. integração com Sheets:** construir interface nova ou usar Google Sheets como backend com camada de automação por cima?

3. **Calendly:** integração via webhook (dados chegam automaticamente quando candidato agenda) ou via API pull periódico?

4. **Canal de comunicação com candidato:** WhatsApp Business API, e-mail, ou link de confirmação?

5. **Modelo de SLA com pause:** como calcular tempo útil em processo que pode pausar por dias sem ação?

6. **Escopo do ciclo de aprendizado:** entra no build do hackathon ou é apresentado como visão de produto?

### Possibilidades técnicas para o desafio 01

| Abordagem | Vantagem | Risco / Limitação |
|---|---|---|
| Extensão de Chrome | Bia navega normalmente, sem automação aparente | Complexidade de build; depende do DOM do LinkedIn |
| Fluxo de PDF otimizado | Aproveita o que já funciona no agente do Marquinhos | Processo ainda manual; limite de 25 PDFs/mês pela página |
| API oficial do LinkedIn | Sem risco de bloqueio | Dados limitados; requer aprovação de acesso; prazo |

---

## 10. CRITÉRIOS DE SUCESSO

### Por desafio

**Desafio 01:**
- A Bia consegue, a partir do hunting, enviar o questionário e receber o score de fit — tudo dentro da plataforma, sem abrir LinkedIn, ChatGPT ou planilha separadamente
- O agente ranqueia candidatos por aderência ao JD sem a Bia precisar montar o prompt
- Nenhuma ação automatizada arrisca a conta do LinkedIn

**Desafio 02:**
- A Bia abre o dashboard antes da reunião quinzenal e os KPIs já estão prontos — sem tocar no Google Sheets, sem filtrar tabela dinâmica, sem calcular nada manualmente
- Dados de candidatos chegam automaticamente quando o Calendly confirma um agendamento
- SLA por etapa calculado de forma confiável mesmo com processo não-linear

**Desafio 03:**
- A Bia clica em "agendar próxima etapa", seleciona um horário e o invite está criado, enviado e registrado no funil — sem abrir Google Calendar, LinkedIn ou WhatsApp separadamente
- O funil é atualizado automaticamente quando o agendamento é confirmado

### O critério final
**A Bia usaria no dia seguinte?** Uma solução que funciona no demo mas é complexa demais para operar sozinha não resolve o problema. O teste real: depois da apresentação, a Bia consegue abrir a plataforma, entrar um candidato novo e navegar pelo processo sem precisar de ajuda?

### Critérios de avaliação do hackathon
- **Impacto:** A solução resolve de fato o problema e muda o dia a dia da Bia?
- **Qualidade:** A solução funciona de ponta a ponta, sem gambiarra visível no demo?
- **Usabilidade:** A Bia consegue usar sem suporte técnico no dia a dia?

---

## 11. INSIGHTS ESTRATÉGICOS — PARA NÃO ESQUECER

1. **O problema não é velocidade — é qualidade do filtro de entrada.** A Bia pode fazer 30 entrevistas por semana e continuar contratando na mesma proporção. O que move o resultado é melhorar quem entra no funil.

2. **O desafio 02 é a espinha dorsal.** Funil e KPIs é o que conecta tudo — triagem melhor alimenta o funil, agendamento automatizado atualiza o funil. Sem o funil centralizado e confiável, mesmo resolvendo 01 e 03, a Bia continua sem visibilidade.

3. **O formulário de abertura de vaga é o ativo mais subutilizado.** 26 campos ricos que os hiring managers já preenchem e que hoje não alimentam automaticamente nenhum agente. É a fonte de contexto que transforma a triagem.

4. **O agente do Marquinhos não precisa ser refeito — precisa ser integrado.** O trabalho é criar um pipeline limpo de input e output, não reconstruir a inteligência.

5. **Candidatos por indicação têm maior taxa de conversão.** O questionário de fit cultural antes da 1ª entrevista replica para candidatos de qualquer origem o filtro implícito que uma indicação já traz.

6. **A Bia está no início de carreira operando sem suporte de dados.** Chegar a conclusões sozinha, sem ferramentas que pensem junto, é custoso. A ferramenta precisa gerar inteligência, não só registrar dados.

7. **Flexibilidade é a premissa de design — não uma variável.** Qualquer decisão técnica precisa ser avaliada sob a pergunta: "isso quebra se a ordem das etapas mudar?"

8. **O pré-preenchimento automático é o ganho mais imediato e mais visível.** Quando o Calendly confirma, todos os dados já chegam na plataforma. Isso sozinho elimina um passo manual que acontece dezenas de vezes por semana.

---

## 12. FONTES E REFERÊNCIAS

| Fonte | Data | Conteúdo |
|---|---|---|
| Briefing oficial do hackathon (PDF) | 23/06/2026 | Enunciado dos 13 desafios, critérios de avaliação, cronograma |
| Documento Hackathon Wave — Bia (PDF) | 23/06/2026 | Detalhamento técnico dos desafios 01, 02 e 03, constraints e direcionamentos |
| Entrevista com Beatriz Pierotti (Granola) | 26/06/2026 | Dores operacionais, fluxo atual, o que já foi testado, constraints do LinkedIn |
| Entrevista com Gabriela Monteiro (Granola) | 26/06/2026 | Diagnóstico estratégico, visão da liderança, oportunidade do formulário de fit |
| Planilha de People — Hackathon 2026 (mock) | 26/06/2026 | Estrutura de dados, abas, colunas — dados fictícios para ilustrar o schema real |
| Discussão estratégica com PM | 26-27/06/2026 | Definição da proposta integrada, fluxo end-to-end, constraints e critérios de sucesso |

---

*Documento gerado em 27/06/2026 · People AI Platform · Hackathon Wave 2026*
*Ponto focal do desafio: Beatriz Pierotti — beatriz.pierotti@bemobi.com*
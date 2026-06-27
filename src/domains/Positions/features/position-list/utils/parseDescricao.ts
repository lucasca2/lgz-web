/**
 * O `descricao` de uma posição é um único blob de texto, mas com rótulos reais
 * embutidos (ex.: "Experiência:", "Responsabilidades:", "Diferenciais:",
 * "Não esperado:", "Tipo de problema:"). Este parser quebra o texto nessas
 * seções pra renderizar agrupado — SEM categoria inventada.
 *
 * É defensivo: se nenhum rótulo casar, devolve uma única seção com o texto cru
 * (renderizado como hoje), então não quebra quando os dados mudarem.
 */

export type DescricaoSection = {
  /** Rótulo da seção (vindo do próprio texto) ou `null` pra intro/texto cru. */
  label: string | null;
  /** Texto corrido da seção (intro, valor inline de um rótulo, etc.). */
  text: string | null;
  /** Itens em formato de lista (linhas iniciadas por "-", "*" ou "•"). */
  bullets: string[];
};

// Linha-rótulo: começa com maiúscula e tem um ":" perto do início.
const LABEL_RE = /^([A-ZÀ-Ý][^:]{1,59}):\s*(.*)$/;
// Linha de bullet: começa com marcador de lista.
const BULLET_RE = /^[-*•]\s+(.+)$/;

export function parseDescricao(descricao: string): DescricaoSection[] {
  const sections: DescricaoSection[] = [];
  let current: DescricaoSection = { label: null, text: null, bullets: [] };
  let sawLabel = false;

  const flush = () => {
    if (current.label || current.text || current.bullets.length > 0) {
      sections.push(current);
    }
  };

  for (const raw of descricao.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    const bullet = BULLET_RE.exec(line);
    if (bullet) {
      current.bullets.push(bullet[1].trim());
      continue;
    }

    const label = LABEL_RE.exec(line);
    if (label) {
      flush();
      sawLabel = true;
      const value = label[2].trim();
      current = { label: label[1].trim(), text: value || null, bullets: [] };
      continue;
    }

    current.text = current.text ? `${current.text}\n${line}` : line;
  }
  flush();

  // Fallback: texto sem nenhum rótulo reconhecível → mostra cru, como antes.
  if (!sawLabel) {
    return [{ label: null, text: descricao.trim(), bullets: [] }];
  }

  return sections;
}

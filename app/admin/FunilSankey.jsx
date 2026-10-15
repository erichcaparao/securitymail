// Gráfico de funil estilo Sankey (SVG puro, sem dependências).
// Fluxo: Enviados -> (Abriram | Não abriram) -> Clicaram -> Digitou e-mail -> Caiu.
// As perdas de cada etapa "sobem"; a espinha que continua fica na base.

export default function FunilSankey({ enviados, abriram, naoAbriram, clicaram, digitaram, cairam }) {
  const env = Math.max(enviados, 0);
  if (!env) {
    return <div style={{ fontSize: 13, color: '#888', padding: '8px 0' }}>Sem envios ainda para montar o funil.</div>;
  }

  const W = 1180, H = 400, top = 44, Hbar = 300, base = top + Hbar;
  const nw = 13;                 // largura das barras de nó
  const scale = Hbar / env;      // px por destinatário
  const pct = (x) => Math.round((x / env) * 100);
  const pctCli = (x) => (clicaram ? Math.round((x / clicaram) * 100) : 0);

  // Colunas (x da barra de nó)
  const X = { env: 60, split: 468, cli: 712, dig: 912, caiu: 1107 };

  // Segmentos verticais (bottom-aligned na base, perdas sobem)
  const naoTop = top, naoBot = top + naoAbriram * scale;      // não abriram (topo)
  const abrTop = naoBot, abrBot = base;                       // abriram (base)
  const cliTop = base - clicaram * scale, cliBot = base;
  const digTop = base - digitaram * scale, digBot = base;
  const caiTop = base - cairam * scale, caiBot = base;

  // Cores
  const C = {
    gray: '#9aa0a6', green: '#5cb37f', orange: '#f3a64d',
    amber: '#e08a2b', red: '#ED1C24', node: '#3f51b5',
  };

  // Band: quadrilátero com bezier horizontal entre duas colunas
  const band = (x1, yt1, yb1, x2, yt2, yb2) => {
    const xm = (x1 + x2) / 2;
    return `M${x1},${yt1} C${xm},${yt1} ${xm},${yt2} ${x2},${yt2} L${x2},${yb2} C${xm},${yb2} ${xm},${yb1} ${x1},${yb1} Z`;
  };

  const flows = [
    // Enviados -> Não abriram (porção de cima) e Abriram (porção de baixo)
    { d: band(X.env + nw, top, naoBot, X.split, naoTop, naoBot), fill: C.green, op: .5 },
    { d: band(X.env + nw, naoBot, base, X.split, abrTop, abrBot), fill: C.gray, op: .55 },
    // Abriram -> Clicaram (base da barra "abriram")
    { d: band(X.split + nw, abrBot - clicaram * scale, abrBot, X.cli, cliTop, cliBot), fill: C.orange, op: .7 },
    // Clicaram -> Digitou
    { d: band(X.cli + nw, cliBot - digitaram * scale, cliBot, X.dig, digTop, digBot), fill: C.amber, op: .75 },
    // Digitou -> Caiu
    { d: band(X.dig + nw, digBot - cairam * scale, digBot, X.caiu, caiTop, caiBot), fill: C.red, op: .7 },
  ];

  const nodes = [
    { x: X.env, y: top, h: Hbar, c: C.node },
    { x: X.split, y: naoTop, h: naoBot - naoTop, c: C.green },
    { x: X.split, y: abrTop, h: abrBot - abrTop, c: C.orange },
    { x: X.cli, y: cliTop, h: cliBot - cliTop, c: C.orange },
    { x: X.dig, y: digTop, h: digBot - digTop, c: C.amber },
    { x: X.caiu, y: caiTop, h: caiBot - caiTop, c: C.red },
  ];

  // Caixa de rótulo (amarela, como a referência). cx = centro X, cy = centro Y.
  const Label = ({ cx, cy, lines }) => {
    const w = Math.max(...lines.map(l => l.length)) * 6.6 + 22;
    const h = lines.length * 16 + 12;
    return (
      <g>
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={5}
          fill="#fff8e1" stroke="#e3c53a" strokeWidth="1" />
        {lines.map((l, i) => (
          <text key={i} x={cx} y={cy - h / 2 + 17 + i * 16} textAnchor="middle"
            fontSize="12.5" fill="#231F20" fontWeight={i === 0 ? 700 : 400}>{l}</text>
        ))}
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img" aria-label="Funil da campanha de phishing">
      {flows.map((f, i) => <path key={i} d={f.d} fill={f.fill} fillOpacity={f.op} />)}
      {nodes.map((n, i) => <rect key={i} x={n.x} y={n.y} width={nw} height={Math.max(n.h, 1)} rx={2} fill={n.c} />)}

      <Label cx={150} cy={top + Hbar / 2} lines={[`${env}`, 'enviados']} />
      <Label cx={590} cy={Math.max(naoTop + (naoBot - naoTop) / 2, 74)}
        lines={[`${naoAbriram} não abriram`, `${pct(naoAbriram)}%`]} />
      <Label cx={600} cy={Math.min(abrTop + (abrBot - abrTop) / 2, base - 18)}
        lines={[`${abriram} abriram`, `${pct(abriram)}%`]} />
      <Label cx={X.cli + 2} cy={cliTop - 30} lines={[`${clicaram} clicaram`, `${pct(clicaram)}%`]} />
      <Label cx={X.dig + 2} cy={digTop - 30} lines={[`${digitaram} digitaram e-mail`, `${pct(digitaram)}%`]} />
      <Label cx={X.caiu - 58} cy={caiTop - 34}
        lines={[`${cairam} caíram`, `${pct(cairam)}% | ${pctCli(cairam)}% dos cliques`]} />
    </svg>
  );
}

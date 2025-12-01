import express from 'express';
import db from '../config/db.js';

const router = express.Router();

function buildDateFilters(column) {
  return ({ data_inicio, data_fim }, startIndex) => {
    const clauses = [];
    const params = [];
    if (data_inicio) {
      params.push(data_inicio);
      clauses.push(`${column} >= $${startIndex + params.length - 1}`);
    }
    if (data_fim) {
      params.push(data_fim);
      clauses.push(`${column} <= $${startIndex + params.length - 1}`);
    }
    const sql = clauses.length ? ` AND ${clauses.join(' AND ')}` : '';
    return { sql, params };
  };
}

const salesDateFilter = buildDateFilters('COALESCE(data_pagamento, data_agendamento)');
const despesasDateFilter = buildDateFilters('data');
const investimentoDateFilter = buildDateFilters('data');

router.get('/', async (req, res) => {
  const { cliente_id } = req.user || {};
  const { data_inicio, data_fim, atendente_id } = req.query;
  if (!cliente_id) return res.status(400).json({ message: 'cliente_id não encontrado no token.' });

  try {
    const baseParams = [cliente_id];
    const atendimentoFilter = atendente_id ? ` AND atendente_id = $${baseParams.length + 1}` : '';
    const atendimentoParams = atendente_id ? [atendente_id] : [];

    const salesDate = salesDateFilter({ data_inicio, data_fim }, baseParams.length + atendimentoParams.length + 1);
    const faturamentoQuery = `
      SELECT COALESCE(SUM(valor), 0) AS total, COALESCE(SUM(comissao_gerada), 0) AS comissao
      FROM vendas
      WHERE cliente_id = $1
      ${atendimentoFilter}
      AND status IN ('PAGO', 'PAGAMENTO_ATRASADO')
      ${salesDate.sql}
    `;
    const faturamentoParams = [...baseParams, ...atendimentoParams, ...salesDate.params];
    const faturamento = await db.query(faturamentoQuery, faturamentoParams);

    const pendentesDate = salesDateFilter({ data_inicio, data_fim }, baseParams.length + atendimentoParams.length + 1);
    const comissaoPendenteQuery = `
      SELECT COALESCE(SUM(comissao_gerada), 0) AS total
      FROM vendas
      WHERE cliente_id = $1
      ${atendimentoFilter}
      AND status IN ('AGENDADO', 'AGUARDANDO_PAGAMENTO')
      ${pendentesDate.sql}
    `;
    const comissaoPendente = await db.query(comissaoPendenteQuery, [...baseParams, ...atendimentoParams, ...pendentesDate.params]);

    const statusQuery = `
      SELECT status, COUNT(*) AS quantidade, COALESCE(SUM(valor),0) AS total
      FROM vendas
      WHERE cliente_id = $1
      ${atendimentoFilter}
      ${salesDate.sql}
      GROUP BY status
    `;
    const statusData = await db.query(statusQuery, faturamentoParams);

    const salarioTotal = await db.query('SELECT COALESCE(SUM(salario_mensal),0) AS total FROM atendentes WHERE cliente_id = $1 AND ativo = TRUE', baseParams);

    const despesasDateSql = despesasDateFilter({ data_inicio, data_fim }, baseParams.length + 1);
    const despesas = await db.query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM despesas WHERE cliente_id = $1 ${despesasDateSql.sql}`,
      [...baseParams, ...despesasDateSql.params]
    );

    const investimentoSql = investimentoDateFilter({ data_inicio, data_fim }, baseParams.length + 1);
    const investimento = await db.query(
      `SELECT COALESCE(SUM(valor),0) AS total FROM gastos_criativos WHERE cliente_id = $1 ${investimentoSql.sql}`,
      [...baseParams, ...investimentoSql.params]
    );

    const faturamentoTotal = Number(faturamento.rows[0].total);
    const comissaoPaga = Number(faturamento.rows[0].comissao);
    const comissaoPotencial = Number(comissaoPendente.rows[0].total);
    const salarioMensal = Number(salarioTotal.rows[0].total);
    const despesasTotal = Number(despesas.rows[0].total);
    const investimentoTotal = Number(investimento.rows[0].total);

    const lucroLiquido = faturamentoTotal - investimentoTotal - despesasTotal - salarioMensal;
    const roas = investimentoTotal > 0 ? +(faturamentoTotal / investimentoTotal).toFixed(2) : null;
    const projecaoGanhos = salarioMensal + comissaoPaga + comissaoPotencial;

    res.json({
      filtros: { data_inicio, data_fim, atendente_id },
      faturamento: faturamentoTotal,
      investimento: investimentoTotal,
      despesas: despesasTotal,
      salario_atendentes: salarioMensal,
      lucro_liquido: lucroLiquido,
      roas,
      comissao_paga: comissaoPaga,
      comissao_potencial: comissaoPotencial,
      projecao_ganhos: projecaoGanhos,
      status_resumo: statusData.rows.reduce((acc, row) => {
        acc[row.status] = { quantidade: Number(row.quantidade), total: Number(row.total) };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ message: 'Erro ao gerar dashboard', details: error.message });
  }
});

export default router;

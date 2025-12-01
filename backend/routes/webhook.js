import express from 'express';
import db from '../config/db.js';

const router = express.Router();

const STATUS_MAP = {
  paid: 'PAGO',
  pago: 'PAGO',
  aguardando_pagamento: 'AGUARDANDO_PAGAMENTO',
  waiting_payment: 'AGUARDANDO_PAGAMENTO',
  agendado: 'AGENDADO',
  scheduled: 'AGENDADO',
  pagamento_atrasado: 'PAGAMENTO_ATRASADO',
  late: 'PAGAMENTO_ATRASADO',
  cancelada: 'CANCELADA',
  canceled: 'CANCELADA',
  frustrado: 'FRUSTRADO',
  frustrated: 'FRUSTRADO',
};

async function computeComissao(clienteId, atendenteId, kitId, valor) {
  const personalized = await db.query(
    `SELECT tipo, valor FROM comissoes_personalizadas WHERE atendente_id = $1 AND kit_id = $2 LIMIT 1`,
    [atendenteId, kitId]
  );

  if (personalized.rows[0]) {
    const { tipo, valor: regraValor } = personalized.rows[0];
    if (tipo === 'percentual') return (Number(valor) * Number(regraValor)) / 100;
    return Number(regraValor);
  }

  const kit = await db.query('SELECT comissao_fixa, comissao_percentual FROM kits WHERE cliente_id = $1 AND id = $2', [clienteId, kitId]);
  const base = kit.rows[0] || { comissao_fixa: 0, comissao_percentual: 0 };
  return Number(base.comissao_fixa || 0) + (Number(valor) * Number(base.comissao_percentual || 0)) / 100;
}

async function ensureAutorizacao(atendenteId, criativoId) {
  const result = await db.query(
    'SELECT id FROM atendente_criativo WHERE atendente_id = $1 AND criativo_id = $2',
    [atendenteId, criativoId]
  );
  return !!result.rows[0];
}

function normalizeStatus(status) {
  if (!status) return null;
  const normalized = status.toLowerCase();
  return STATUS_MAP[normalized] || status.toUpperCase();
}

router.post('/braip', async (req, res) => {
  try {
    const expectedSecret = process.env.BRAIP_WEBHOOK_SECRET;
    if (expectedSecret && req.headers['x-braip-secret'] !== expectedSecret) {
      return res.status(401).json({ message: 'Assinatura do webhook inválida.' });
    }

    const {
      pedido_id_braip,
      status,
      valor,
      cliente_id,
      kit_codigo,
      kit_id,
      utm_content,
      utm_atendente,
      cliente_nome,
      cliente_telefone,
      cliente_cpf,
      cliente_estado,
      data_pagamento,
      observacoes,
    } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ message: 'cliente_id é obrigatório no webhook.' });
    }

    const novoStatus = normalizeStatus(status);
    if (!novoStatus) return res.status(400).json({ message: 'Status inválido ou ausente.' });

    const kitResult = kit_id
      ? await db.query('SELECT id, cliente_id FROM kits WHERE cliente_id = $1 AND id = $2', [cliente_id, kit_id])
      : await db.query('SELECT id, cliente_id FROM kits WHERE cliente_id = $1 AND codigo_braip = $2', [cliente_id, kit_codigo]);
    const kit = kitResult.rows[0];
    if (!kit) return res.status(400).json({ message: 'Kit não encontrado para o cliente.' });

    const criativoResult = await db.query(
      'SELECT id FROM criativos WHERE cliente_id = $1 AND nome = $2 LIMIT 1',
      [cliente_id, utm_content || '']
    );
    const criativo = criativoResult.rows[0];

    const atendenteResult = await db.query(
      'SELECT id FROM atendentes WHERE cliente_id = $1 AND codigo = $2 LIMIT 1',
      [cliente_id, utm_atendente || '']
    );
    const atendente = atendenteResult.rows[0];

    if (criativo && atendente) {
      const autorizado = await ensureAutorizacao(atendente.id, criativo.id);
      if (!autorizado) return res.status(403).json({ message: 'Atendente não autorizado para o criativo informado.' });
    }

    const valorVenda = Number(valor || 0);
    const comissaoGerada = atendente ? await computeComissao(cliente_id, atendente.id, kit.id, valorVenda) : 0;

    const existing = await db.query('SELECT * FROM vendas WHERE pedido_id_braip = $1 AND cliente_id = $2', [pedido_id_braip, cliente_id]);
    let vendaId;
    let statusAntigo;

    if (existing.rows[0]) {
      const venda = existing.rows[0];
      statusAntigo = venda.status;
      const update = await db.query(
        `UPDATE vendas SET status = $1, valor = $2, comissao_gerada = $3, data_pagamento = COALESCE($4, data_pagamento),
          atendente_id = COALESCE($5, atendente_id), criativo_id = COALESCE($6, criativo_id), updated_at = NOW()
         WHERE id = $7 RETURNING id`,
        [novoStatus, valorVenda, comissaoGerada, data_pagamento, atendente?.id || null, criativo?.id || null, venda.id]
      );
      vendaId = update.rows[0].id;
    } else {
      const insert = await db.query(
        `INSERT INTO vendas (
          cliente_id, pedido_id_braip, cliente_nome, cliente_telefone, cliente_cpf, cliente_estado,
          atendente_id, criativo_id, kit_id, status, data_pagamento, valor, comissao_gerada, utm_content, utm_atendente,
          sem_identificacao, observacoes
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
        ) RETURNING id`,
        [
          cliente_id,
          pedido_id_braip,
          cliente_nome,
          cliente_telefone,
          cliente_cpf,
          cliente_estado,
          atendente?.id || null,
          criativo?.id || null,
          kit.id,
          novoStatus,
          data_pagamento,
          valorVenda,
          comissaoGerada,
          utm_content,
          utm_atendente,
          !utm_content || !utm_atendente,
          observacoes || null,
        ]
      );
      vendaId = insert.rows[0].id;
    }

    if (statusAntigo !== novoStatus) {
      await db.query(
        `INSERT INTO historico_status_venda (cliente_id, venda_id, status_antigo, status_novo, origem)
         VALUES ($1, $2, $3, $4, 'WEBHOOK')`,
        [cliente_id, vendaId, statusAntigo, novoStatus]
      );
    }

    res.status(existing.rows[0] ? 200 : 201).json({ message: 'Webhook processado com sucesso', venda_id: vendaId });
  } catch (error) {
    console.error('Erro no webhook Braip:', error);
    res.status(500).json({ message: 'Erro ao processar webhook', details: error.message });
  }
});

export default router;

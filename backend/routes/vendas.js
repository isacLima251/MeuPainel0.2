import express from 'express';
import db from '../config/db.js';

const router = express.Router();

router.put('/:id', async (req, res) => {
  const { cliente_id } = req.user || {};
  const { status, observacoes, atendente_id, criativo_id, valor, data_pagamento } = req.body;
  if (!cliente_id) return res.status(400).json({ message: 'cliente_id não encontrado no token.' });

  try {
    const vendaResult = await db.query('SELECT * FROM vendas WHERE id = $1 AND cliente_id = $2', [req.params.id, cliente_id]);
    const venda = vendaResult.rows[0];
    if (!venda) return res.status(404).json({ message: 'Venda não encontrada.' });

    const updates = [];
    const params = [];
    if (status) {
      updates.push(`status = $${updates.length + 1}`);
      params.push(status);
    }
    if (observacoes !== undefined) {
      updates.push(`observacoes = $${updates.length + 1}`);
      params.push(observacoes);
    }
    if (atendente_id !== undefined) {
      updates.push(`atendente_id = $${updates.length + 1}`);
      params.push(atendente_id);
    }
    if (criativo_id !== undefined) {
      updates.push(`criativo_id = $${updates.length + 1}`);
      params.push(criativo_id);
    }
    if (valor !== undefined) {
      updates.push(`valor = $${updates.length + 1}`);
      params.push(valor);
    }
    if (data_pagamento !== undefined) {
      updates.push(`data_pagamento = $${updates.length + 1}`);
      params.push(data_pagamento);
    }

    if (!updates.length) return res.status(400).json({ message: 'Nenhum campo enviado para atualização.' });

    params.push(req.params.id);
    params.push(cliente_id);

    const updateQuery = `UPDATE vendas SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length - 1} AND cliente_id = $${params.length} RETURNING *`;
    const updated = await db.query(updateQuery, params);

    if (status && status !== venda.status) {
      await db.query(
        `INSERT INTO historico_status_venda (cliente_id, venda_id, status_antigo, status_novo, origem)
         VALUES ($1, $2, $3, $4, 'MANUAL')`,
        [cliente_id, venda.id, venda.status, status]
      );
    }

    res.json(updated.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({ message: 'Erro ao atualizar venda', details: error.message });
  }
});

export default router;

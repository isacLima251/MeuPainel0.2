import express from 'express';
import db from '../config/db.js';

const router = express.Router();

function requireTenant(req, res) {
  if (!req.user?.cliente_id) {
    res.status(400).json({ message: 'cliente_id não encontrado no token.' });
    return false;
  }
  return true;
}

function buildUpdateSet(body, allowedFields) {
  const fields = [];
  const values = [];
  Object.entries(body).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value !== undefined) {
      values.push(value);
      fields.push(`${key} = $${values.length}`);
    }
  });
  return { fields, values };
}

router.get('/atendentes', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM atendentes WHERE cliente_id = $1 ORDER BY id DESC', [req.user.cliente_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar atendentes', details: error.message });
  }
});

router.post('/atendentes', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { user_id, nome, codigo, telefone, salario_mensal, ativo = true } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO atendentes (cliente_id, user_id, nome, codigo, telefone, salario_mensal, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.cliente_id, user_id, nome, codigo, telefone, salario_mensal || 0, ativo]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar atendente', details: error.message });
  }
});

router.put('/atendentes/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['user_id', 'nome', 'codigo', 'telefone', 'salario_mensal', 'ativo']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });

  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE atendentes SET ${fields.join(', ')}, updated_at = NOW()
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Atendente não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar atendente', details: error.message });
  }
});

router.delete('/atendentes/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM atendentes WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Atendente não encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar atendente', details: error.message });
  }
});

router.get('/kits', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM kits WHERE cliente_id = $1 ORDER BY id DESC', [req.user.cliente_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar kits', details: error.message });
  }
});

router.post('/kits', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { nome, codigo_braip, comissao_fixa = 0, comissao_percentual = 0, ativo = true } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO kits (cliente_id, nome, codigo_braip, comissao_fixa, comissao_percentual, ativo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.cliente_id, nome, codigo_braip, comissao_fixa, comissao_percentual, ativo]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar kit', details: error.message });
  }
});

router.put('/kits/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['nome', 'codigo_braip', 'comissao_fixa', 'comissao_percentual', 'ativo']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE kits SET ${fields.join(', ')}, updated_at = NOW()
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Kit não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar kit', details: error.message });
  }
});

router.delete('/kits/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM kits WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Kit não encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar kit', details: error.message });
  }
});

router.get('/criativos', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM criativos WHERE cliente_id = $1 ORDER BY id DESC', [req.user.cliente_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar criativos', details: error.message });
  }
});

router.post('/criativos', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { nome, campanha, status = 'teste' } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO criativos (cliente_id, nome, campanha, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.cliente_id, nome, campanha, status]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar criativo', details: error.message });
  }
});

router.put('/criativos/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['nome', 'campanha', 'status']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE criativos SET ${fields.join(', ')}, updated_at = NOW()
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Criativo não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar criativo', details: error.message });
  }
});

router.delete('/criativos/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM criativos WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Criativo não encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar criativo', details: error.message });
  }
});

router.get('/gastos/midia', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query(
      'SELECT * FROM gastos_criativos WHERE cliente_id = $1 ORDER BY data DESC, id DESC',
      [req.user.cliente_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar gastos em mídia', details: error.message });
  }
});

router.post('/gastos/midia', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { criativo_id, valor, data } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO gastos_criativos (cliente_id, criativo_id, valor, data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.cliente_id, criativo_id, valor, data]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar gasto em mídia', details: error.message });
  }
});

router.put('/gastos/midia/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['criativo_id', 'valor', 'data']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE gastos_criativos SET ${fields.join(', ')}
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Gasto em mídia não encontrado.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar gasto em mídia', details: error.message });
  }
});

router.delete('/gastos/midia/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM gastos_criativos WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Gasto em mídia não encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar gasto em mídia', details: error.message });
  }
});

router.get('/despesas', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM despesas WHERE cliente_id = $1 ORDER BY data DESC', [req.user.cliente_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar despesas', details: error.message });
  }
});

router.post('/despesas', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { descricao, valor, categoria, data } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO despesas (cliente_id, descricao, valor, categoria, data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.cliente_id, descricao, valor, categoria, data]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar despesa', details: error.message });
  }
});

router.put('/despesas/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['descricao', 'valor', 'categoria', 'data']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE despesas SET ${fields.join(', ')}
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Despesa não encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar despesa', details: error.message });
  }
});

router.delete('/despesas/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM despesas WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Despesa não encontrada.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar despesa', details: error.message });
  }
});

router.get('/metas', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM metas_mensais WHERE cliente_id = $1 ORDER BY ano DESC, mes DESC', [req.user.cliente_id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar metas', details: error.message });
  }
});

router.post('/metas', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { atendente_id, mes, ano, meta_vendas_qtd = 0, meta_valor = 0 } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO metas_mensais (cliente_id, atendente_id, mes, ano, meta_vendas_qtd, meta_valor)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (atendente_id, mes, ano) DO UPDATE SET
         meta_vendas_qtd = EXCLUDED.meta_vendas_qtd,
         meta_valor = EXCLUDED.meta_valor,
         cliente_id = EXCLUDED.cliente_id,
         created_at = metas_mensais.created_at
       RETURNING *`,
      [req.user.cliente_id, atendente_id, mes, ano, meta_vendas_qtd, meta_valor]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar/atualizar meta', details: error.message });
  }
});

router.put('/metas/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  const { fields, values } = buildUpdateSet(req.body, ['atendente_id', 'mes', 'ano', 'meta_vendas_qtd', 'meta_valor']);
  if (fields.length === 0) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
  try {
    values.push(req.user.cliente_id);
    values.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE metas_mensais SET ${fields.join(', ')}
       WHERE cliente_id = $${values.length - 1} AND id = $${values.length}
       RETURNING *`,
      values
    );
    if (!rows[0]) return res.status(404).json({ message: 'Meta não encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar meta', details: error.message });
  }
});

router.delete('/metas/:id', async (req, res) => {
  if (!requireTenant(req, res)) return;
  try {
    const { rowCount } = await db.query('DELETE FROM metas_mensais WHERE cliente_id = $1 AND id = $2', [req.user.cliente_id, req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Meta não encontrada.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar meta', details: error.message });
  }
});

export default router;

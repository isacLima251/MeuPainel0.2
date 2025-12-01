import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';

const router = express.Router();

function ensureSuperAdmin(req, res) {
  if (req.user?.role !== 'super_admin') {
    res.status(403).json({ message: 'Apenas super admins podem gerenciar clientes.' });
    return false;
  }
  return true;
}

function mapClientRow(row) {
  return {
    id: row.id?.toString(),
    name: row.name,
    documento: row.documento,
    plan: row.plan,
    active: row.active,
    createdAt: row.created_at,
  };
}

router.get('/', async (req, res) => {
  if (!ensureSuperAdmin(req, res)) return;
  try {
    const { rows } = await db.query('SELECT * FROM clientes ORDER BY created_at DESC');
    res.json(rows.map(mapClientRow));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar clientes', details: error.message });
  }
});

router.post('/', async (req, res) => {
  if (!ensureSuperAdmin(req, res)) return;
  const { name, documento, plan = 'trial', active = true, admin } = req.body;

  if (!name || !documento) {
    return res.status(400).json({ message: 'Nome e documento são obrigatórios.' });
  }

  const adminName = admin?.name || `${name} Admin`;
  const adminEmail = admin?.email;
  const adminPassword = admin?.password || '123456';

  if (!adminEmail) {
    return res.status(400).json({ message: 'Email do administrador é obrigatório.' });
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const clientInsert = await client.query(
      `INSERT INTO clientes (name, documento, plan, active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, documento, plan, active]
    );

    const createdClient = clientInsert.rows[0];
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const adminInsert = await client.query(
      `INSERT INTO users (cliente_id, name, email, password_hash, role, ativo)
       VALUES ($1, $2, $3, $4, 'admin', TRUE)
       RETURNING id, cliente_id, name, email, role, ativo`,
      [createdClient.id, adminName, adminEmail, passwordHash]
    );

    await client.query('COMMIT');

    res.status(201).json({
      client: mapClientRow(createdClient),
      admin: {
        id: adminInsert.rows[0].id,
        cliente_id: adminInsert.rows[0].cliente_id,
        name: adminInsert.rows[0].name,
        email: adminInsert.rows[0].email,
        role: adminInsert.rows[0].role,
        ativo: adminInsert.rows[0].ativo,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erro ao criar cliente', details: error.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  if (!ensureSuperAdmin(req, res)) return;
  const { name, documento, plan, active } = req.body;

  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push(`name = $${fields.length + 1}`);
    values.push(name);
  }
  if (documento !== undefined) {
    fields.push(`documento = $${fields.length + 1}`);
    values.push(documento);
  }
  if (plan !== undefined) {
    fields.push(`plan = $${fields.length + 1}`);
    values.push(plan);
  }
  if (active !== undefined) {
    fields.push(`active = $${fields.length + 1}`);
    values.push(active);
  }

  if (!fields.length) return res.status(400).json({ message: 'Nenhum campo enviado para atualização.' });

  values.push(req.params.id);

  try {
    const { rows } = await db.query(
      `UPDATE clientes SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );

    if (!rows[0]) return res.status(404).json({ message: 'Cliente não encontrado.' });

    res.json(mapClientRow(rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar cliente', details: error.message });
  }
});

export default router;

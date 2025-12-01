import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'development-secret';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function signToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    cliente_id: user.cliente_id || null,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, secret, { expiresIn: '12h' });
}

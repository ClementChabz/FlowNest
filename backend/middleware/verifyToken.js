// backend/middleware/verifyToken.js

import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Vérifie si un token est fourni
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Injecte l’ID utilisateur dans req.user
    next(); // Continue vers la route protégée
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

export default verifyToken;

const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'access_secret',
        { expiresIn: '15m' }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        { expiresIn: '7d' }
    );
};

const verifyToken = (token, secret) => {
    return jwt.verify(token, secret);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken
};

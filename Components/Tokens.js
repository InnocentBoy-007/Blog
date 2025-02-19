import jwt from 'jsonwebtoken'

/**
 * To generate token: tokens.generateToken(payload); ---- 'payload' is 'userId'
 * To compare token: tokens.compareToken(token); ---- 'token' contains the userId and the secretkey
 */
class Tokens {
    async generateToken(payload) {
        return jwt.sign(payload, process.env.SECRETKEY, {'expiresIn':'1h'}); // store the jwt in a cookie inside the browser
    }

    async compareToken(token) {
        return jwt.verify(token, process.env.SECRETKEY);
    }
}

const tokens = new Tokens();
export default tokens;
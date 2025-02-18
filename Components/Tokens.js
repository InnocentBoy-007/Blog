import jwt from 'jsonwebtoken'

class Tokens {
    async generateToken(payload) {
        return jwt.sign(payload, process.env.SECRETKEY, {'expiresIn':'1h'}); // store the jwt in a cookie inside the browser
    }
}

const tokens = new Tokens();
export default tokens;
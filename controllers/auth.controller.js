const AuthService = require('../services/auth.service');

class AuthController {
    static async login(req, res, next) {
        try {

            const { login, password } = req.body;

            const user = await AuthService.login({ login, password });

            res.json({ ok: true, user });

        } catch(e) {
            next(e);
        }
    }
}

module.exports = AuthController;
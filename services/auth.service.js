const { AuthModel } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    static async register({ login, password, role }) {
        const oldUser = await AuthModel.findOne({ login });
        if (oldUser) return console.error('User Already Exist');

        const hashPassword = await bcrypt.hash(password, 10);

        await AuthModel.create({
            login,
            password: hashPassword,
            role,
            active: true
        })

        console.log(`User ${login} (${role}) created!`);
    }
    static async login({ login, password }) {
        const user = await AuthModel.findOne({ login });
        if (!user) throw new Error('Логин или пароль неверны');

        const comparedPassword = await bcrypt.compare(password, user.password);
        if (!comparedPassword) throw new Error('Логин или пароль неверны');

        const token = jwt.sign(
            { id: user._id, login },
            process.env.TOKEN_KEY,
            {
                expiresIn: "7d",
            }
        );
    
        user.token = token;
    
        return user;
    }
}

module.exports = AuthService;
const CitiesService = require('../services/cities.service')

class CitiesController {
    static async getAll(_, res, next) {
        try {

            const cities = await CitiesService.getAll();
    
            res.json({ cities });
        } catch(e) {
            next(e);
        }
    }
    static async updateOne(req, res, next) {
        try {
            const { id } = req.params;
            const { price } = req.body;

            await CitiesService.updateById(id, { price });

            res.status(200).json({ ok: true });

        } catch(e) {
            next(e);
        }
    }
}

module.exports = CitiesController;
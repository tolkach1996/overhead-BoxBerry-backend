const OrdersService = require('./orders.service');

class OrdersController {
    static async getOrderById(req, res, next) {
        try {
            const { id } = req.params;
    
            const order = await OrdersService.getById(id);
    
            res.json({ ok: true, order })
    
        } catch(e) {
            next(e);
        }
    }
    static async getOrderByDocumentId(req, res, next) {
        try {
            const { id } = req.params;
    
            const order = await OrdersService.getByDocumentId(id);
    
            res.json({ ok: true, order })
    
        } catch(e) {
            next(e);
        }
    }
    static async updateOrderById(req, res, next) {
        try {
            const { id } = req.params;
            const { type } = req.body;
    
            const order = await OrdersService.getById(id);
            await OrdersService.updateStatusByDocumenId(order.id, type);
            await OrdersService.createOrderMoveByDocumentId(order.id, { type });
            
            res.json({ ok: true })
    
        } catch(e) {
            next(e);
        }
    }
    static async getOrdersByFilter(req, res, next) {
        try {
            const { selectedMetadata, selectedProjects } = req.body;

            const orders = await OrdersService.getAllByFilter({ states: selectedMetadata, projects: selectedProjects });

            res.status(200).json({ ok: true, orders });

        } catch(e) {
            next(e);
        }
    }
    static async getOrdersMove(req, res, next) {
        try {

            const orders = await OrdersService.getOrdersMove(req.query);

            res.status(200).json({ ok: true, orders });

        } catch(e) {
            next(e);
        }
    }
}

module.exports = OrdersController;
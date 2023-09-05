const Moysklad = require('moysklad');
const { fetch } = require('undici');

const msToken = process.env.MOYSKLAD_TOKEN
const ms = Moysklad({ msToken, fetch });

class MoyskladService {
    static async getById(id) {
        const orders = await ms.GET(`entity/customerorder`, {
            filter: {
                name: id
            },
            expand: 'positions,agent'
        })

        const { rows } = orders;

        for (let row of rows) {
            if (row.name === id) return { order: row }
        }

        throw new Error('Заказ не найден');
    }
    static async updateStatusById(id) {

        const state = {
            state: {
                meta: {
                    href: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/0f14d720-c559-11ec-0a80-08a6000eaca5',
                    metadataHref: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata',
                    type: 'state',
                    mediaType: 'application/json'
                }
            }
        }

        await ms.PUT(`entity/customerorder/${id}`, state);
    }
    static async getStatisList() {
        const response = await ms.GET('entity/customerorder/metadata')
        const { states } = response;
    }
}

module.exports = MoyskladService;
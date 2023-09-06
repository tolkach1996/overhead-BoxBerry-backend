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
            expand: 'positions,positions.assortment,agent,state'
        })

        const { rows } = orders;

        for (let row of rows) {
            if (row.name === id) return row
        }

        throw new Error('Заказ не найден');
    }
    static async updateStatusById(id) {
        const state = {
            state: {
                meta: {
                    href: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/dd8bc731-caef-11e8-9109-f8fc0033f16e',
                    metadataHref: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata',
                    type: 'state',
                    mediaType: 'application/json'
                }
            }
        }

        await ms.PUT(`entity/customerorder/${id}`, state);
    }
    static async getStatusList() {
        const response = await ms.GET('entity/customerorder/metadata')
        const { states } = response;

        console.log(states);
    }
}

module.exports = MoyskladService;
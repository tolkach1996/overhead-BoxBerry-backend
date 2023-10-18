const Moysklad = require('moysklad');
const { fetch } = require('undici');

const { formatPhone } = require('../../helpers');
const { BoxberryModel } = require('../../models');
const OderMoveModel = require('./models/orderMovement.model');

const CitiesService = require('../../services/cities.service');

const msToken = process.env.MOYSKLAD_TOKEN
const ms = Moysklad({ msToken, fetch });

class OrdersService {
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

        throw new Error(`Заказ "${id}" не найден`);
    }
    static async getByDocumentId(id) {
        const order = await ms.GET(`entity/customerorder/${id}`, {
            filter: {
                name: id
            },
            expand: 'positions,positions.assortment,agent,state,project,store'
        })

        return order;
    }
    static async getAllByFilter({ states, projects }) {
        const projectUrl = 'https://online.moysklad.ru/api/remap/1.2/entity/project/';

        const options = {
            filter: {
                state: {
                    name: []
                },
                project: []
            },
            expand: 'agent, project, positions',
        }
        options.filter.state.name = states.map(item => item.name);
        options.filter.project = projects.map(item => (projectUrl + item.id));

        let getCustomerOrder = await ms.GET('entity/customerorder', options);
        const todayDate = new Date().toLocaleDateString('ru-RU', { year: "numeric", month: 'numeric', day: 'numeric' }).split('.').reverse().join('');
        const orders = [];

        const pages = Math.ceil(getCustomerOrder.meta.size / getCustomerOrder.meta.limit);

        for (let i = 0; i < pages; i++) {
            for (let item of getCustomerOrder.rows) {

                const partsComment = item.description.split(' ');
                const isBoxberry = !!partsComment.find(item => item == 'ПВЗ');

                if (isBoxberry) {
                    const declaredSum = Number(item.sum / 100);
                    const sumOrder = Number(item.sum / 100);
                    const index = partsComment.map(item => item.replace(/\D/g, '')).filter(item => item.length === 6);
                    const pointsBoxberry = await BoxberryModel.find({ Index: { $in: index } }, { Code: 1, Address: 1, CityName: 1 }).lean();
                    const pointBoxberry = pointsBoxberry.find(point => {
                        return item.description.includes(point.Address);
                    });
                    if (!pointBoxberry) {
                        console.error('ERROR');
                    }
                    let deliverySum = null;
                    let codePoint = null;
                    let paySum = null;
                    if (pointBoxberry) {
                        codePoint = pointBoxberry.Code;
                        const city = pointBoxberry.CityName;
                        if (city) {
                            const cityInfo = await CitiesService.findByCity(city);
                            deliverySum = cityInfo?.price || null;
                            paySum = deliverySum ? Math.ceil(deliverySum / 50) * 50 : null;
                        }
                    }

                    const weightPackage = item.positions.rows.reduce((pre, cur) => {
                        return pre += cur.weight || 0;
                    }, 0)

                    const rowData = {
                        id: item.id,
                        project: item?.project?.name || null,
                        fio: item.agent.name,
                        numberOrder: item.name,
                        sumOrder,
                        comment: item.description,
                        phone: formatPhone(item.agent.phone),
                        dataPackage: todayDate,
                        typeTransfer: '1',
                        deliverySum: deliverySum,
                        declaredSum,
                        paySum: paySum,
                        departurePointCode: '010',
                        codePWZ: codePoint,
                        weightPackage: weightPackage < 3000 ? 3000 : weightPackage,
                        selected: false,
                        declaredStatus: false,
                        openingStatus: false
                    }

                    const order = orders.find(item => {
                        const isSameName = String(item.fio).toLowerCase() == String(rowData.fio).toLowerCase();
                        const isSamePhone = item.phone == rowData.phone;

                        return isSameName || isSamePhone;
                    })

                    if (order) {
                        order.orders.push(rowData);
                    } else {
                        rowData.orders = [JSON.parse(JSON.stringify(rowData))];
                        orders.push(rowData);
                    }
                }
            }

            options.offset = i * 100 + 100;
            if (i !== pages - 1) getCustomerOrder = await ms.GET('entity/customerorder', options);
        }

        orders.sort((a, b) => {
            if (a.fio > b.fio) return 1;
            if (a.fio < b.fio) return -1;
            return 0;
        })

        return orders;
    }
    static async updateStatusByDocumenId(id, type) {
        const stateExit = {
            state: {
                meta: {
                    href: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/dd8bc731-caef-11e8-9109-f8fc0033f16e',
                    metadataHref: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata',
                    type: 'state',
                    mediaType: 'application/json'
                }
            }
        }
        const statePVZ = {
            state: {
                meta: {
                    href: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/0b7aae5a-71e9-11ec-0a80-0838010c44a4',
                    metadataHref: 'https://online.moysklad.ru/api/remap/1.2/entity/customerorder/metadata',
                    type: 'state',
                    mediaType: 'application/json'
                }
            }
        }

        const state = type === 'accept' ? statePVZ : stateExit;

        await ms.PUT(`entity/customerorder/${id}`, state);
    }
    static async getStatusList() {
        const orders = await ms.GET('entity/customerorder/metadata')
        const { states } = orders;

        console.log(states);
    }

    static async createOrderMoveByDocumentId(id, { type='accept' }) {

        const order = await this.getByDocumentId(id);

        const entityOrder = {
            id: order.name,
            idMoysklad: order.id,
            date: order.moment,
            client: {
                id: order.agent.id,
                name: order.agent.name,
                phone: order.agent.phone
            },
            summa: order.payedSum / 100,
            project: {
                id: order?.project?.id,
                name: order?.project?.name
            },
            stock: {
                id: order.store.id,
                name: order.store.name
            },
            status: {
                id: order.state.id,
                name: order.state.name
            },
            type,
            dateMove: new Date()
        }

        const orderMove = new OderMoveModel(entityOrder);

        await orderMove.save();

        return orderMove;
    }
    static async getOrdersMove({ dates, type }={}) {
        const start = new Date(dates[0]);
        start.setHours(0, 0, 0, 0);
        const query = {
            type,
            dateMove: { $gte: start }
        }
        if (dates.length > 1) {
            const end = new Date(dates[1]);
            end.setDate(end.getDate() + 1);
            query.dateMove.$lt = end;
        }

        const orders = await OderMoveModel.find(query).lean();
        return orders;
    }
}

module.exports = OrdersService;
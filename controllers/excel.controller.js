const xlsx = require('xlsx');
const path = require('path');


module.exports.downloadConsigmentExcel = async (req, res, next) => {
    try {
        const workbook = xlsx.utils.book_new();
        let table = [];
        for (let item of req.body?.data) {
            let declaredSum = item.orders.reduce((pre, cur) => {
                return pre += Number(cur.declaredSum);
            }, 0);
            if (declaredSum < 10000) declaredSum = 5;
            
            let newStreing = {
                "Дата посылки (ГГГГММДД)": item.dataPackage,
                "Номер заказа в ИМ": item.numberOrder,
                "Объявленная стоимость": declaredSum,
                "Сумма к оплате": item.paySum,
                "Стоимость доставки": item.deliverySum,
                "Дата передачи ЗП": item.dataPackage,
                "Номер паллеты": '',
                "Номер акта передачи": '',
                "Вид доставки": item.typeTransfer,
                "Код ПВЗ": item.codePWZ,
                "Код пункта поступления": item.departurePointCode,
                "ФИО": item.fio,
                "Номер телефона": item.phone,
                "Доп. номер телефона": '',
                "E-mail для оповещений": '',
                "Наименование организации": '',
                "Адрес": '',
                "ИНН": '',
                "КПП": '',
                "Расчетный счет": '',
                "Наименование банка": '',
                "Кор. счет": '',
                "БИК": '',
                "Вес 1-ого места": item.weightPackage,
                "Вес 2-ого места": '',
                "Вес 3-ого места": '',
                "Вес 4-ого места": '',
                "Вес 5-ого места": '',
                "Индекс": '',
                "Город": '',
                "Адрес получателя": '',
                "Время доставки, от (ЧЧ:ММ)": '',
                "Время доставки, до (ЧЧ:ММ)": '',
                "Дата доставки (ГГГГММДД)": '',
                "Комментарий": '',
                "Баркод 1-го места": '',
                "Баркод 2-го места": '',
                "Баркод 3-го места": '',
                "баркод 4-го места": '',
                "Баркод 5-го места": '',
                "Тип отпраления ПР": '',
                "Хрупкий груз для ПР": '',
                "Оптимизация тарифа ПР": '',
                "Строгий тип отправления ПР": '',
                "Длина, см": '',
                "Ширина, см": '',
                "Высота, см": '',
                "Тип упаковки": '',
                "Запретить изменение упаковки": '',
                "Тип выдачи": '',
            }
            table.push(newStreing);
        }
        const worksheet = xlsx.utils.json_to_sheet(table);
        xlsx.utils.book_append_sheet(workbook, worksheet);
        xlsx.writeFile(workbook, `files/test.xlsx`);
        const pathFile = path.join(__dirname, '../files', 'test.xlsx');
        res.sendFile(pathFile);
    }
    catch (e) {
        next(e);
    }
}
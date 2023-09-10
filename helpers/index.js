module.exports.calcDeclaredSum = (orders, status) => {
    let declaredSum = orders.reduce((pre, cur) => {
        return pre += Number(cur.declaredSum);
    }, 0);

    if (status) return declaredSum;

    return declaredSum < 10000 ? 5 : declaredSum;
}
module.exports.setIssue = (openingStatus) => {
    return openingStatus ? 1 : 0;
}
module.exports.formatPhone = (tel) => {
    const numberTel = tel.replace(/\D/g, '');
    if (numberTel.charAt(0) != 7) {
        return `7${numberTel.substring(1)}`;
    }
    return numberTel;
}
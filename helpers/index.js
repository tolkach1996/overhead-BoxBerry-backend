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
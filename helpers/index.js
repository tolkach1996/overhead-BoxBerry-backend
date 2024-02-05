module.exports.calcDeclaredSum = (orders, status) => {
	let declaredSum = orders.reduce((pre, cur) => {
		return (pre += Number(cur.declaredSum));
	}, 0);

	if (status) return declaredSum;

	return declaredSum < 10000 ? 5 : declaredSum;
};
module.exports.calcWeight = (positions) => {
	let summaryWeight = 0;
	for (let position of positions) {
		const {
			quantity,
			assortment: { weight },
		} = position;
		summaryWeight += (quantity || 0) * (weight || 0);
	}

	return summaryWeight < 3000 ? 3000 : summaryWeight;
};
module.exports.setIssue = (openingStatus) => {
	return openingStatus ? 1 : 0;
};
module.exports.formatPhone = (tel) => {
	const numberTel = tel.replace(/\D/g, "");
	if (numberTel.charAt(0) != 7) {
		return `7${numberTel.substring(1)}`;
	}
	return numberTel;
};

const { getFilterMetadata, getFilterProject } = require('../services/filter.service');

module.exports.getFilterData = async (req, res) => {
    try {
        let metadata = await getFilterMetadata();
        let projects = await getFilterProject();
        res.json({ metadata, projects });
    }
    catch (e) {
        console.error(e);
        res.status(500);
    }
}
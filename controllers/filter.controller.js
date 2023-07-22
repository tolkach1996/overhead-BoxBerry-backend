const { getFilterMetadata, getFilterProject } = require('../services/filter.service');

module.exports.getFilterData = async (req, res, next) => {
    try {
        const metadata = await getFilterMetadata();
        const projects = await getFilterProject();
        res.status(200).json({ metadata, projects });
    }
    catch (e) {
        next(e);
    }
}
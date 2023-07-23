const Moysklad = require('moysklad');
const { fetch } = require('undici');


const msToken = process.env.MOYSKLAD_TOKEN
const ms = Moysklad({ msToken, fetch });


module.exports.getFilterMetadata = async () => {
    const metadata = [];
    const getMetadata = await ms.GET('entity/customerorder/metadata');
    await getMetadata.states.forEach(({ id, name }) => metadata.push({ id, name }));
    return metadata
}

module.exports.getFilterProject = async () => {
    const project = [];
    const getProjects = await ms.GET('entity/project');
    getProjects.rows.forEach(({ id, name }) => project.push({ id, name }));
    return project
}
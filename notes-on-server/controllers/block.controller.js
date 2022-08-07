function controller (pageService, blockService, shortid) {
    async function getBlocks (router, req, res) {
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        var blocks = Object.assign({pageId : router.params.pageId}, req);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title; blocks['locked']=results[0].locked; return blockService.readBlocks(blocks); })
            .then((results) => { res.status(200).json({ message: `Blocks of ${pageInfo} retreived.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function postBlock (router, req, res) {
        var blockInfo = Object.assign({blockId: shortid(), pageId : router.params.pageId, io: req.app.get('socketio')}, req.body.data);
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title; return blockService.createBlock(blockInfo) })
            .then((results) => { res.status(200).json({ message: `Block created on ${pageInfo}.`, data: results[0] }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getBlock (router, req, res) {
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        var blockInfo = Object.assign({pageId : router.params.pageId}, req.params);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title; return blockService.readBlock(blockInfo) })
            .then((results) => { res.status(200).json({ message: `Block retreived from ${pageInfo}.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchBlock (router, req, res) {
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        var blockInfo = Object.assign({pageId : router.params.pageId}, req.params);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title; return blockService.readBlock(blockInfo) })
            .then((results) => { blockInfo = results[0].blockId; return blockService.editBlock(req) })
            .then((results) => { res.status(200).json({ message: `Block ${blockInfo} from ${pageInfo} updated.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchBlockOrder (router, req, res) {
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        var blockInfo = Object.assign({pageId : router.params.pageId, workspaceId : router.params.workspaceId, io: req.app.get('socketio')}, req);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title; return blockService.editBlockOrder(blockInfo) })
            .then((results) => { res.status(200).json({ message: `Blocks Order of ${pageInfo} updated.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function deleteBlock (router, req, res) {
        var pageInfo = {workspaceId : router.params.workspaceId, pageId : router.params.pageId};
        var blockInfo = Object.assign({pageId : router.params.pageId, io: req.app.get('socketio')}, req.params);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results[0].title;  return blockService.deleteBlock(blockInfo) })
            .then((results) => { res.status(200).json({ message: `Block of ${pageInfo} deleted.`,  data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    return {
        getBlocks,
        postBlock,
        getBlock,
        patchBlock,
        patchBlockOrder,
        deleteBlock
    }
}

module.exports = controller;
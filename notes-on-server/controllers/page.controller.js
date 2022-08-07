function controller (pageService, workspaceService, shortid) {
    async function getPages (router, req, res) {
        var workspace = Object.assign({workspaceId : router.params.workspaceId}, req);
        pageService.readPages(workspace)
            .then((results) => { res.status(200).json({ message: 'Pages retreived.', data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function postPage (router, req, res) {
        var pageInfo = Object.assign({pageId : shortid(), workspaceId : router.params.workspaceId}, req.body.data);
        var workspace = router.params.workspaceId;
        workspaceService.readWorkspace(workspace)
            .then((results) => { workspace = results.title; return pageService.createPage(pageInfo) })
            .then((results) => { res.status(200).json({ message: `Page created on ${workspace}.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getPage (router, req, res) {
        var pageInfo = Object.assign({workspaceId : router.params.workspaceId}, req.params);
        pageService.readPage(pageInfo)
            .then((results) => { res.status(200).json({ message: 'Page retrieved.', data: results[0] }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchPage (router, req, res) {
        var pageInfo = Object.assign({workspaceId : router.params.workspaceId}, req.params);
        pageService.readPage(pageInfo)
            .then((results) => { pageInfo = results.title; return pageService.editPage(req); })
            .then((results) => { res.status(200).json({ message: `Page ${pageInfo} updated.`, data: results}) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchPageOrder (router, req, res) {
        var pageInfo = Object.assign({workspaceId : router.params.workspaceId}, req);
        var workspace = router.params.workspaceId;
        workspaceService.readWorkspace(workspace)
            .then((results) => { workspace = results.title; return pageService.editPageOrder(pageInfo); })
            .then((results) => { res.status(200).json({ message: `Pages Order of ${workspace} Updated.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function deletePage (router, req, res) {
        var pageInfo = Object.assign({workspaceId : router.params.workspaceId}, req.params), title;
        pageService.readPage(pageInfo)
            .then((results) => { title = results[0].title; return pageService.deletePage(pageInfo) })
            .then((results) => { res.status(200).json({ message: `Page ${title} deleted.`, data: {pages: results} }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getPublicPage (router, req, res) {
        pageService.readPublicPage(req.params)
            .then((results) => { res.status(200).json({ message: 'Page retrieved.', data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    return {
        getPages,
        postPage,
        getPage,
        patchPage,
        patchPageOrder,
        deletePage,
        getPublicPage
    }
}

module.exports = controller;
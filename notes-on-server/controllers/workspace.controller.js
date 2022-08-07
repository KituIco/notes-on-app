function controller (userService, workspaceService, shortid) {
    async function getWorkspaces (req, res) {
        workspaceService.readWorkspaces(req)
            .then((results) => { res.status(200).json({ message: 'Workspaces retreived.', data: results }) })              
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function postWorkspace (req, res) {
        var user = req.userId; req.body.data.userId = req.userId;
        var workspaceInfo = Object.assign({workspaceId : shortid()}, req.body.data); 
        userService.readUser(user)
            .then((results) => { user = results[0].userName; return workspaceService.createWorkspace(workspaceInfo) })
            .then((results) => { res.status(200).json({ message: `Workspace created by ${user}.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getWorkspace (req, res) {
        workspaceService.readWorkspace(req.params.workspaceId)
            .then((results) => { res.status(200).json({ message: 'Workspace retrieved.', data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchSpaceOrder (req, res) {
        var user = req.params.userId;
        userService.readUser(user)
            .then((results) => { user = results[0].userName; return workspaceService.editSpaceOrder(req); })
            .then((results) => { res.status(200).json({ message: `Workspaces Order of ${user} Updated.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchWorkspace (req, res) {
        var workspace = req.params.workspaceId;
        var user = req.userId;
        userService.readUser(user)
            .then(() => { if(req.body.data) return workspaceService.editSpaceOrder(req); else return})
            .then(() => { return workspaceService.readWorkspace(workspace)})
            .then((results) => { workspace = results.title; return workspaceService.editWorkspace(req); })
            .then((results) => { res.status(200).json({ message: `Workspace ${workspace} updated.`, data: results}) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function deleteWorkspace (req, res) {
        workspaceService.readWorkspace(req.params.workspaceId)
            .then((results) => { return workspaceService.deleteWorkspace(results) })
            .then((results) => { res.status(200).json({ message: 'Workspace deleted.', data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    return {
        getWorkspaces,
        postWorkspace,
        getWorkspace,
        patchWorkspace,
        patchSpaceOrder,
        deleteWorkspace
    }

}

module.exports = controller;




    // async function patchWorkspace (req, res) {
    //     var workspace = req.params.workspaceId;
    //     workspaceService.readWorkspace(workspace)
    //         .then((results) => { workspace = results[0].title; return workspaceService.editWorkspace(req); })
    //         .then((results) => { res.status(200).json({ message: `Workspace ${workspace} updated.`, data: results}) })
    //         .catch((error) => { res.status(400).json({ message: error }) });
    // }
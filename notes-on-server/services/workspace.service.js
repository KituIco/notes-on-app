var workspaceColumns = {
    "userId" : 0,
    "title" : 1, 
    "description" : 2,
    "cover": 3,
    "icon": 4
}

function services (userRepo, workspaceRepo, pageRepo, blockRepo) {
    async function readWorkspaces (req) {
        return new Promise((resolve, reject) => {
            workspaceRepo.selectWorkspaces(req)
                .then((results) => { 
                    if (results == 0){
                        reject('No workspaces found.');
                    } resolve(results);
                }).catch((error) => { reject(error) });
        });
    }

    async function createWorkspace (req) {
        return new Promise((resolve, reject) => {
            userRepo.selectUserTotalSpaces(req.userId)
                .then((results) => { 
                    results = results[0].totalWorkspaces + 1;
                    userRepo.updateUserTotalSpaces([results, req.userId]);
                    return results;
                })
                .then((results) => {
                    req = Object.assign({order : results}, req);
                    workspaceRepo.insertWorkspace(req);
                    resolve(workspaceRepo.selectWorkspace(req.workspaceId));
                })
                .catch((error) => { reject(error) })
        });
    }
    
    async function readWorkspace (req){
        return new Promise((resolve, reject) => {
            workspaceRepo.selectWorkspace(req)
                .then((results) => { 
                    if (results == 0){
                        reject('Workspace not found.');
                    } resolve(results[0]); 
                })
                .catch((error) => { reject(error) });
        });
    }
    
    async function editWorkspace (req) {
        return new Promise((resolve, reject) => {
            var update;
            workspaceRepo.selectWorkspaceEdit(req.params.workspaceId)
                .then((results) => {
                    update = Object.values(results[0]);
                    update[0] = req.userId;
                    if(req.body.data) delete req.body.data["order"];
                    for (var field in req.body.data) {
                        if (workspaceColumns[field] === undefined) {
                            reject(`Cannot update ${field}.`);
                        } update[workspaceColumns[field]] = req.body.data[field];
                    } 

                    if(req.coverPath) update[3] = req.coverPath;
                    if(req.iconPath) update[4] = req.iconPath;

                    update.push(req.params.workspaceId);
                    workspaceRepo.updateWorkspace(update);
                    resolve(workspaceRepo.selectWorkspace(req.params.workspaceId))
                })
                .catch((error) => { reject(error) })
        });
    }

    async function editSpaceOrder (req) {
        return new Promise((resolve, reject) => {
            var ord = req.body.data.order, valid = false, uid = req.userId;
            var wsid = req.params.workspaceId;
            userRepo.selectUser(uid)
                .then((results) => {
                    var limit = results[0].totalWorkspaces
                    valid = ord <= limit && ord > 0;
                    if (valid) return userRepo.selectWorkspaceOrder([uid,wsid]);
                    else reject("Invalid Order.");
                })
                .then((results) => { 
                    if(results == 0) reject("Workspace not found.")
                    else return results[0];
                })
                .then((results) => {
                    userRepo.updateWorkspaceOrder([uid,results.order,0]);
                    if(results.order > ord){
                        for(var i = results.order-1; i>=ord; i=i-1)
                            userRepo.updateWorkspaceOrder([uid,i,i+1]);
                    } else if (results.order < ord) {
                        for(var i = results.order+1; i<=ord; i=i+1)
                            userRepo.updateWorkspaceOrder([uid,i,i-1]);
                    } userRepo.updateWorkspaceOrder([uid,0,ord]);
                    resolve();
                })
                .catch((error) => { reject(error) })
        });
    }

    async function deleteWorkspace (req) {
        return new Promise((resolve, reject) => {
            req = Object.assign({params : {userId: req.userId}}, req);
            const order = req.order
            blockRepo.selectSpaceBlocks(Object.assign({query:[]},req))
                .then((results) => { 
                    for(var i=0; i<results.length; i++) {
                        blockRepo.deleteBlock(results[i].blockId);
                    } return pageRepo.selectPages(Object.assign({query:[]},req));
                })
                .then((results) => { 
                    for(var i=0; i<results.length; i++) {
                        pageRepo.deletePage(results[i].pageId);
                    } 
                    workspaceRepo.deleteWorkspace(req.workspaceId);
                    return userRepo.selectUserTotalSpaces(req.userId);
                })
                .then((results) => { 
                    total = results[0].totalWorkspaces;
                    for(var i=order+1; i<=total; i=i+1) {
                        userRepo.updateWorkspaceOrder([req.userId,i,i-1]);
                    } return userRepo.updateUserTotalSpaces([total-1, req.userId]); 
                })
                .then(() => resolve(workspaceRepo.selectUserSpaces(Object.assign({query:[]},req))) ) 
                .catch((error) => { reject(error) });
        });
    }

    return {
        readWorkspaces,
        createWorkspace,
        readWorkspace,
        editWorkspace,
        editSpaceOrder,
        deleteWorkspace
    }

}

module.exports = services;


// async function editWorkspace (req) {
    //     return new Promise((resolve, reject) => {
    //         var update, prev;
    //         workspaceRepo.selectWorkspaceEdit(req.params.workspaceId)
    //             .then((results) => {
    //                 update = Object.values(results[0]);
    //                 for (var field in req.body.data) {
    //                     if (workspaceColumns[field] === undefined) {
    //                         reject(`Cannot update ${field}.`);
    //                     } update[workspaceColumns[field]] = req.body.data[field];
    //                 } 
    //                 prev = results[0];
    //                 if(update[0] == prev.userId){
    //                     update.push(req.params.workspaceId);
    //                     workspaceRepo.updateWorkspace(update);
    //                     resolve(workspaceRepo.selectWorkspace(req.params.workspaceId))
    //                 } 
    //                 return userRepo.selectUserTotalSpaces(update[0])
    //             })
    //             .then((results) => {
    //                 if(results == 0) reject('Cannot transfer to a non-existing user.')
    //                 total = results[0].totalWorkspaces + 1;
    //                 userRepo.updateUserTotalSpaces([total, update[0]]);
    //                 userRepo.insertWorkspaceOrder([update[0],req.params.workspaceId, total]);
    //                 return userRepo.selectUserTotalSpaces(prev.userId)
    //             })
    //             .then((results) => {
    //                 total = results[0].totalWorkspaces;
    //                 userRepo.updateUserTotalSpaces([total-1, prev.userId]);
    //                 userRepo.deleteWorkspaceOrder([prev.userId,req.params.workspaceId]);
    //                 for(var i=2; i<=total; i=i+1){
    //                     userRepo.updateWorkspaceOrder([prev.userId,i,i-1]);
    //                 }
    //             })
    //             .then(() => {
    //                 update.push(req.params.workspaceId);
    //                 workspaceRepo.updateWorkspace(update);
    //                 resolve(workspaceRepo.selectWorkspace(req.params.workspaceId)); })
    //             .catch((error) => { reject(error) })
    //     });
    // }

    // async function editSpaceOrder (req) {
    //     return new Promise((resolve, reject) => {
    //         var data = req.body.data, valid = false, uid = req.params.userId;;
    //         var wsid = data.workspaceId; delete data["workspaceId"];
    //         userRepo.selectUser(uid)
    //             .then((results) => {
    //                 var limit = results[0].totalWorkspaces, ord = data.order;
    //                 for (var field in data) {
    //                     if (field == "order" && Number.isInteger(ord)) valid = ord <= limit && ord > 0;
    //                     else reject(`Cannot update ${field}. Invalid request.`);
    //                 } 
    //                 if (valid) return userRepo.selectWorkspaceOrder([uid,wsid]);
    //                 else reject("Invalid Order.");
    //             })
    //             .then((results) => { 
    //                 if(results == 0) reject("Workspace not found.")
    //                 else return results[0];
    //             })
    //             .then((results) => {
    //                 userRepo.updateWorkspaceOrder([uid,results.order,0]);
    //                 if(results.order > data.order){
    //                     for(var i = results.order-1; i>=data.order; i=i-1)
    //                         userRepo.updateWorkspaceOrder([uid,i,i+1]);
    //                 } else {
    //                     for(var i = results.order+1; i<=data.order; i=i+1)
    //                         userRepo.updateWorkspaceOrder([uid,i,i-1]);
    //                 } userRepo.updateWorkspaceOrder([uid,0,data.order]);
    //                 resolve(workspaceRepo.selectUserSpaces(req));
    //             })
    //             .catch((error) => { reject(error) })
    //     });
    // }
var pageColumns = {
    "workspaceId" : 0,
    "title" : 1,
    "locked" : 2,
    "banner" : 3,
    "shared" : 4,
    "cover": 5,
    "icon": 6
}

function services (workspaceRepo, pageRepo, blockRepo, redis) {
    async function readPages (req) {
        return new Promise((resolve, reject) => {
            let pages, blocks;
            pageRepo.selectPages(req)
                .then((results) => { 
                    if (results == 0){
                        reject('No Pages found.');
                    }
                    if (!req.query.term) resolve(results);
                    else return pageRepo.selectPagesBlocks(req)
                })
                .then((results) => {
                    results = results.filter(function(pageblock) {
                        if(pageblock.title.toLowerCase().includes(req.query.term.toLowerCase())) return true;
                        if(pageblock.content.toLowerCase().includes(req.query.term.toLowerCase())) return true;
                        return false;
                    })

                    const uniqueIds = new Set();
                    results = results.filter(function(pageblock) {
                        const duplicate = uniqueIds.has(pageblock.pageId);
                        uniqueIds.add(pageblock.pageId);
                        if (!duplicate) return true;
                        else return false
                    })
                    resolve(results)
                })
                .catch((error) => { reject(error) });
        });
    }

    async function createPage (req) {
        return new Promise((resolve, reject) => {
            workspaceRepo.selectSpaceTotalPages(req.workspaceId)
                .then((results) =>{
                    results = results[0].totalPages + 1;
                    workspaceRepo.updateSpaceTotalPages([results, req.workspaceId]);
                    return results;
                })
                .then((results) => {
                    req = Object.assign({order : results}, req);
                    pageRepo.insertPage(req);
                    resolve(pageRepo.selectPage([req.pageId, req.workspaceId]));
                })
                .catch((error) => { reject(error) })
        });
    }
    
    async function readPage (req){
        return new Promise((resolve, reject) => {
            pageRepo.selectPage([req.pageId,req.workspaceId])
                .then((results) => { 
                    if (results == 0){
                        reject('Page not found.');
                    } 
                    resolve(results); 
                })
                .catch((error) => { reject(error) });
        });
    }

    async function editPage (req) {
        return new Promise((resolve, reject) => {
            var update, prev;
            pageRepo.selectPageEdit(req.params.pageId)
                .then((results) => {
                    update = Object.values(results[0]);
                    for (var field in req.body.data) {
                        if (pageColumns[field] === undefined) {
                            reject(`Cannot update ${field}.`);
                        } update[pageColumns[field]] = req.body.data[field];
                    } 
                    if(update[2]) update[2] = 1; 
                    else { 
                        update[2] = 0;
                        redis.del(req.params.pageId)
                    }

                    if(update[3]) update[3] = 1; 
                    else update[3] = 0;

                    if(update[4]) update[4] = 1; 
                    else update[4] = 0;
                    
                    if(req.coverPath) update[5] = req.coverPath;
                    if(req.iconPath) update[6] = req.iconPath;

                    update.push(req.params.pageId);
                    pageRepo.updatePage(update);
                    return pageRepo.selectPage([req.params.pageId,update[0]]);
                })
                .then((results) => {
                    var io = req.app.get('socketio'); 
                    io.to(req.params.pageId).emit("pageChanged", results[0] );
                    resolve(results);
                })
                .catch((error) => { reject(error) })
        });
    }

    async function editPageOrder (req) {
        return new Promise((resolve, reject) => {
            var data = req.body.data, valid = false, wsid = req.workspaceId;;
            var pid = data.pageId; delete data["pageId"];
            workspaceRepo.selectWorkspace(wsid)
                .then((results) => {
                    var limit = results[0].totalPages, ord = data.order;
                    for (var field in data) {
                        if (field == "order" && Number.isInteger(ord)) valid = ord <= limit && ord > 0; 
                        else reject(`Cannot update ${field}. Invalid request.`);
                    } 
                    if (valid) return workspaceRepo.selectPageOrder([wsid,pid]); 
                    else reject("Invalid Order.");
                })
                .then((results) => { 
                    if(results == 0) reject("Page not found.");
                    else return results[0];
                })
                .then((results) => {
                    workspaceRepo.updatePageOrder([wsid,results.order,0]);
                    if(results.order > data.order){
                        for(var i=results.order-1; i>=data.order; i=i-1)
                            workspaceRepo.updatePageOrder([wsid,i,i+1]);
                    } else {
                        for(var i=results.order+1; i<=data.order; i=i+1)
                            workspaceRepo.updatePageOrder([wsid,i,i-1]);
                    } workspaceRepo.updatePageOrder([wsid,0,data.order]);
                    resolve(pageRepo.selectPages(req));
                })
                .catch((error) => { reject(error) })
        });
    }

    async function deletePage (req) {
        return new Promise((resolve, reject) => {
            let total
            blockRepo.selectBlocks(Object.assign({query:[]},req))
                .then((results) => { 
                    for(var i=0; i<results.length; i++) {
                        blockRepo.deleteBlock(results[i].blockId);
                    } 
                    return workspaceRepo.selectSpaceTotalPages(req.workspaceId);
                })
                .then((results) => { 
                    total = results[0].totalPages;
                    return pageRepo.selectPage([req.pageId,req.workspaceId]);
                })
                .then((results) => {
                    pageRepo.deletePage(req.pageId);
                    for(let i=results[0].order+1; i<=total; i=i+1) {
                        workspaceRepo.updatePageOrder([req.workspaceId,i,i-1]);
                    } return workspaceRepo.updateSpaceTotalPages([total-1, req.workspaceId]); 
                })
                .then(() => resolve(pageRepo.selectPages(Object.assign({query:[]},req))) ) 
                .catch((error) => { reject(error) });
        });
    }

    async function readPublicPage (req){
        return new Promise((resolve, reject) => {
            let publicPage;
            pageRepo.selectPublicPage(req.pageId)
                .then((results) => { 
                    if (results == 0) {
                        reject('Page not found.');
                    } 
                    if (!results[0].shared){
                        reject('Page not viewable.');
                    }

                    publicPage = results;
                    return blockRepo.selectBlocks(Object.assign({query:[]},req))
                })
                .then((results) => {
                    publicPage = [...publicPage, ...results]
                    resolve(publicPage);
                })
                .catch((error) => { reject(error) });
        });
    }

    return {
        readPages,
        createPage,
        readPage,
        editPage,
        editPageOrder,
        deletePage,
        readPublicPage
    }

}



module.exports = services;


// async function editPage (req) {
//     return new Promise((resolve, reject) => {
//         var update, prev;
//         pageRepo.selectPageEdit(req.params.pageId)
//             .then((results) => {
//                 update = Object.values(results[0]);
//                 for (var field in req.body.data) {
//                     if (pageColumns[field] === undefined) {
//                         reject(`Cannot update ${field}.`);
//                     } update[pageColumns[field]] = req.body.data[field];
//                 } 
//                 prev = results[0];
//                 if(update[0] == prev.workspaceId){
//                     update.push(req.params.pageId);
//                     pageRepo.updatePage(update);
//                     resolve(pageRepo.selectPage([req.params.pageId,update[0]]));
//                 }
//                 return workspaceRepo.selectSpaceTotalPages(update[0])
//             })
//             .then((results) => {
//                 if(results == 0) reject('Cannot move to a non-exisiting Workspace.')
//                 total = results[0].totalPages + 1;
//                 workspaceRepo.updateSpaceTotalPages([total, update[0]]);
//                 workspaceRepo.insertPageOrder([update[0],req.params.pageId,total]);
//                 return workspaceRepo.selectSpaceTotalPages(prev.workspaceId)
//             })
//             .then((results) => {
//                 total = results[0].totalPages;
//                 workspaceRepo.deletePageOrder([prev.workspaceId,req.params.pageId]);
//                 for(var i=2; i<=total; i=i+1){
//                     workspaceRepo.updatePageOrder([prev.workspaceId,i,i-1]);
//                 } workspaceRepo.updateSpaceTotalPages([total-1, prev.workspaceId]);
//             })
//             .then(() => {
//                 update.push(req.params.pageId);
//                 pageRepo.updatePage(update);
//                 resolve(pageRepo.selectPage([req.params.pageId,update[0]])); })
//             .catch((error) => { reject(error) })
//     });
// }
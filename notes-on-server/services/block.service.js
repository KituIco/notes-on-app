var blockColumns = {
    "type" : 0,
    "content" : 1,
    "size": 2,
}

function services (pageRepo, blockRepo) {
    async function readBlocks (req, locked) {
        return new Promise((resolve, reject) => {
            blockRepo.selectBlocks(req)
                .then((results) => { 
                    if (results == 0){
                        reject('No Blocks found.');
                    } 
                    resolve(results);
                }).catch((error) => { reject(error) });
        });
    }

    async function createBlock (req) {
        return new Promise((resolve, reject) => {
            pageRepo.selectPageTotalBlocks(req.pageId)
                .then((results) => {
                    results = results[0].totalBlocks + 1;
                    if(req.order > results){
                        reject('Invalid Order.')
                    }
                    for(let i=results-1; i>=req.order; i=i-1)
                        pageRepo.updateBlockOrder([req.pageId,i,i+1]);
                    return pageRepo.updatePageTotalBlocks([results, req.pageId]);
                })
                .then(() => {
                    req = Object.assign({order : req.order}, req);
                    blockRepo.insertBlock(req)
                    return blockRepo.selectBlock([req.blockId, req.pageId]);
                })
                .then((results) => {
                    var io = req.io;  
                    io.to(req.pageId).emit("blockAdded", results[0] );
                    resolve(results)
                })
                .catch((error) => { reject(error) })
        });
    }
    
    async function readBlock (req){
        return new Promise((resolve, reject) => {
            blockRepo.selectBlock([req.blockId,req.pageId])
                .then((results) => { 
                    if (results == 0){
                        reject('Block not found.');
                    } 
                    resolve(results); 
                })
                .catch((error) => { reject(error) });
        });
    }
    
    async function editBlock (req) {
        return new Promise((resolve, reject) => {
            var update, pageId;
            blockRepo.selectBlockEdit(req.params.blockId)
                .then((results) => {
                    update = Object.values(results[0]);
                    pageId = update[3];
                    for (var field in req.body.data) {
                        if (blockColumns[field] === undefined) {
                            reject(`Cannot update ${field}.`);
                        } 
                        update[blockColumns[field]] = req.body.data[field];
                    } 
                    if(req.filePath){
                        update[1] = req.filePath;
                    }
                    update[3] = req.params.blockId;
                    return blockRepo.updateBlock(update); 
                })
                .then(() => { return blockRepo.selectBlock([req.params.blockId,pageId]) } )
                .then((results) => {
                    var io = req.app.get('socketio'); 
                    io.to(pageId).emit("blockChanged", results[0] );
                    resolve(results)
                })
                .catch((error) => { reject(error) });
        });
    }

    async function editBlockOrder (req) {
        return new Promise((resolve, reject) => {
            var data = req.body.data, valid = false;
            var bid = data.blockId; delete data["blockId"];
            var pid = req.pageId, wsid = req.workspaceId;
            pageRepo.selectPage([pid, wsid])
                .then((results) => {
                    var limit = results[0].totalBlocks, ord = data.order;
                    for (var field in data) {
                        if (field == "order" && Number.isInteger(ord)) valid = ord <= limit && ord > 0;
                        else reject(`Cannot update ${field}. Invalid request.`);
                    } 
                    if (valid) return pageRepo.selectBlockOrder([pid,bid]); 
                    else reject("Invalid Order.");
                })
                .then((results) => { 
                    if(results == 0){
                        reject("Page not found.")
                    } return results[0];
                })
                .then((results) => {
                    pageRepo.updateBlockOrder([pid,results.order,0]); 
                    if(results.order > data.order){                     
                        for(var i = results.order-1; i>=data.order; i=i-1)
                            pageRepo.updateBlockOrder([pid,i,i+1]);
                    } else {
                        for(var i = results.order+1; i<=data.order; i=i+1)
                            pageRepo.updateBlockOrder([pid,i,i-1]);
                    } pageRepo.updateBlockOrder([pid,0,data.order]);
                    return blockRepo.selectBlocks(req);
                })
                .then((results) => {
                    var io = req.io;
                    io.to(req.pageId).emit("orderChanged", results );
                    resolve(results)
                })
                .catch((error) => { reject(error) })
        });
    }

    async function deleteBlock (req) {
        return new Promise((resolve, reject) => {
            let total;
            pageRepo.selectPageTotalBlocks(req.pageId)
                .then((results) => {
                    total = results[0].totalBlocks;
                    return pageRepo.selectBlockOrder([req.pageId,req.blockId])
                })
                .then((results) => {
                    blockRepo.deleteBlock(req.blockId);
                    for(let i=results[0].order+1; i<=total; i=i+1){
                        pageRepo.updateBlockOrder([req.pageId,i,i-1]);
                    } return pageRepo.updatePageTotalBlocks([total-1, req.pageId]);
                })
                .then(() => { return blockRepo.selectBlocks(Object.assign({query:[]},req)) } ) 
                .then((results) => {
                    var io = req.io;
                    io.to(req.pageId).emit("orderChanged", results );
                    resolve(results)
                })
                .catch((error) => { reject(error) });
        });
    }

    return {
        readBlocks,
        createBlock,
        readBlock,
        editBlock,
        editBlockOrder,
        deleteBlock
    }
}

module.exports = services;
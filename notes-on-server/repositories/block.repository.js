const e = require("express");

var types = ["header1", "header2", "header3", "body", "image", "pagelink"];

function repo (notesdb, redis) {
    async function selectBlocks (req) {
        return new Promise((resolve, reject) => {
            var limit = 1000, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            
            redis.get(req.pageId, (error, blocks) => {
                if(error) reject(error.message)
                if(blocks != null){
                    console.log("Cache Hit")
                    resolve(JSON.parse(blocks));
                } else {
                    var selectQuery = `CALL selectBlocks(${skip},${limit},'${req.pageId}')`;
                    notesdb.query(selectQuery, (error, results) => {
                        if (error) {
                            reject(error.sqlMessage);
                        } else {
                            console.log("Cache Miss");
                            resolve(results[0]);
                            if (req.locked)
                                redis.setex(req.pageId, 10800, JSON.stringify(results[0]));
                        }
                    })
                }
            })
            
        });
    }

    async function insertBlock (req) {
        return new Promise((resolve, reject) => {
            if (!types.includes(req.type)){
                reject("Invalid Type.")
            } else {
                var insertQuery = `CALL insertBlock('${req.blockId}','${req.pageId}','${req.type}','${req.order}')`;
                notesdb.query(insertQuery, (error, results) => {
                    if (error) {
                        reject(error.sqlMessage)
                    } else {
                        resolve();
                    }
                })
            }
        });
    }

    async function selectBlock (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectBlock('${req[0]}','${req[1]}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectBlockEdit (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectBlockEdit('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateBlock (req) {
        return new Promise((resolve, reject) => {
            if (!types.includes(req[0])) {
                reject("Invalid Type.");
            } else {
                req[1] = req[1].replace(/'/g,"\\'");
                var updateQuery = `CALL updateBlock('${req[0]}','${req[1]}','${req[2]}', '${req[3]}')`;
                notesdb.query(updateQuery, (error, results) => {
                    if (error) {
                        reject(error.sqlMessage)
                    } else {
                        resolve();
                    }
                })
            }
        });
    }

    async function deleteBlock (req) {
        return new Promise((resolve, reject) => {
            var deleteQuery = `CALL deleteBlock('${req}')`;
            notesdb.query(deleteQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectSpaceBlocks (req) {
        return new Promise((resolve, reject) => {
            var limit = 1000, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectSpaceBlocks(${skip},${limit},'${req.workspaceId}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    return {
        selectBlocks,
        insertBlock,
        selectBlock,
        selectBlockEdit,
        updateBlock,
        deleteBlock,
        selectSpaceBlocks
    }

}

module.exports = repo;
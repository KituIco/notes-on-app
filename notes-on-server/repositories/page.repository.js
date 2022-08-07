
function repo (notesdb) {
    async function selectPages (req) {
        return new Promise((resolve, reject) => {
            var limit = 1000, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectPages(${skip},${limit},'${req.workspaceId}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectPagesBlocks (req) {
        return new Promise((resolve, reject) => {
            var limit = 1000, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectPagesBlocks(${skip},${limit},'${req.workspaceId}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function insertPage (req) {
        return new Promise((resolve, reject) => {
            if (req.title == "") req.title = "New Page";
            var insertQuery = `CALL insertPage('${req.pageId}','${req.workspaceId}','${req.title}','${req.order}')`;
            notesdb.query(insertQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectPage (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectPage('${req[0]}','${req[1]}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectPageEdit (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectPageEdit('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updatePage (req) {
        if (req[1] == "") req[1] = "New Page";
        return new Promise((resolve, reject) => {
            req[1] = req[1].replace(/'/g,"\\'");
            var updateQuery = `CALL updatePage('${req[0]}','${req[1]}','${req[2]}','${req[3]}','${req[4]}','${req[5]}','${req[6]}','${req[7]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectPageTotalBlocks (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectPageTotalBlocks('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updatePageTotalBlocks (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updatePageTotalBlocks('${req[0]}','${req[1]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function insertBlockOrder (req) {
        return new Promise((resolve, reject) => {
            var insertQuery = `CALL insertBlockOrder('${req[0]}','${req[1]}','${req[2]}')`;
            notesdb.query(insertQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectBlockOrder (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectBlockOrder('${req[0]}','${req[1]}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateBlockOrder (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updateBlockOrder('${req[0]}',${req[1]},${req[2]})`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }
    

    async function deletePage (req) {
        return new Promise((resolve, reject) => {
            var deleteQuery = `CALL deletePage('${req}')`;
            notesdb.query(deleteQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectPublicPage (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectPublicPage('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    return {
        selectPages,
        selectPagesBlocks,
        insertPage,
        selectPage,
        selectPageEdit,
        updatePage,
        selectPageTotalBlocks,
        updatePageTotalBlocks,
        insertBlockOrder,
        selectBlockOrder,
        updateBlockOrder,
        deletePage,
        selectPublicPage
    }
}

module.exports = repo;
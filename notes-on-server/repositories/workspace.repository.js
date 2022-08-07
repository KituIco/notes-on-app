
function repo (notesdb) {
    async function selectWorkspaces (req) {
        return new Promise((resolve, reject) => {
            var limit = 100, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectWorkspaces(${skip},${limit})`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function insertWorkspace (req) {
        return new Promise((resolve, reject) => {
            if (req.title == "") req.title = "New Workspace";
            var insertQuery = `CALL insertWorkspace('${req.workspaceId}','${req.userId}','${req.title}','${req.description}','${req.order}')`;
            notesdb.query(insertQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectUserSpaces (req) {
        return new Promise((resolve, reject) => {
            var limit = 10, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectUserSpaces(${skip},${limit},'${req.params.userId}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectWorkspace (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectWorkspace('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectWorkspaceEdit (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectWorkspaceEdit('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateWorkspace (req) {
        return new Promise((resolve, reject) => {
            if (req[1] == "") req[1] = "New Workspace";
            var updateQuery = `CALL updateWorkspace('${req[0]}','${req[1]}','${req[2]}','${req[3]}','${req[4]}','${req[5]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectSpaceTotalPages (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectSpaceTotalPages('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateSpaceTotalPages (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updateSpaceTotalPages('${req[0]}','${req[1]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function insertPageOrder (req) {
        return new Promise((resolve, reject) => {
            var insertQuery = `CALL insertPageOrder('${req[0]}','${req[1]}','${req[2]}')`;
            notesdb.query(insertQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectPageOrder (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectPageOrder('${req[0]}','${req[1]}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updatePageOrder (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updatePageOrder('${req[0]}',${req[1]},${req[2]})`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function deleteWorkspace (req) {
        return new Promise((resolve, reject) => {
            var deleteQuery = `CALL deleteWorkspace('${req}')`;
            notesdb.query(deleteQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    return {
        selectWorkspaces,
        insertWorkspace,
        selectUserSpaces,
        selectWorkspace,
        selectWorkspaceEdit,
        updateWorkspace,
        selectSpaceTotalPages,
        updateSpaceTotalPages,
        insertPageOrder,
        selectPageOrder,
        updatePageOrder,
        deleteWorkspace
    }
}

module.exports = repo;
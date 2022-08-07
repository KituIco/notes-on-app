
function repo (notesdb) {
    async function selectUsers (req) {
        return new Promise((resolve, reject) => {
            var limit = 10, skip = 0;
            if(req.query.limit) limit = req.query.limit;
            if(req.query.skip) skip = req.query.skip;
            var selectQuery = `CALL selectUsers(${skip},${limit})`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage);
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function insertUser (req) {
        return new Promise((resolve, reject) => {
            var mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!req.email.match(mailformat)) {
                reject("Invalid email format.")
            } else {
                var insertQuery = `CALL insertUser('${req.userId}','${req.userName}','${req.firstName}','${req.lastName}','${req.email}','${req.password}')`;
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

    async function selectUser (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectUser('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function selectUserEdit (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectUserEdit('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateUser (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updateUser('${req[0]}','${req[1]}','${req[2]}','${req[3]}', '${req[4]}', '${req[5]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectUserMail (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectUserMail('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }
    
    async function selectUserTotalSpaces (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectUserTotalSpaces('${req}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateUserTotalSpaces (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updateUserTotalSpaces('${req[0]}','${req[1]}')`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function insertWorkspaceOrder (req) {
        return new Promise((resolve, reject) => {
            var insertQuery = `CALL insertWorkspaceOrder('${req[0]}','${req[1]}','${req[2]}')`;
            notesdb.query(insertQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    async function selectWorkspaceOrder (req) {
        return new Promise((resolve, reject) => {
            var selectQuery = `CALL selectWorkspaceOrder('${req[0]}','${req[1]}')`;
            notesdb.query(selectQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve(results[0]);
                }
            })
        });
    }

    async function updateWorkspaceOrder (req) {
        return new Promise((resolve, reject) => {
            var updateQuery = `CALL updateWorkspaceOrder('${req[0]}',${req[1]},${req[2]})`;
            notesdb.query(updateQuery, (error, results) => {
                if (error) {
                    reject(error.sqlMessage)
                } else {
                    resolve();
                }
            })
        });
    }

    return {
        selectUsers,
        insertUser,
        selectUser,
        selectUserEdit,
        updateUser,
        selectUserMail,
        selectUserTotalSpaces,
        updateUserTotalSpaces,
        insertWorkspaceOrder,
        selectWorkspaceOrder,
        updateWorkspaceOrder
    }

}

module.exports = repo;
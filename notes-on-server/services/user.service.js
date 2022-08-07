var userColumns = {
    "userName" : 0,
    "firstName" : 1, 
    "lastName" : 2, 
    "password" : 3,
    "icon" : 4
}

function services (userRepo, workspaceRepo, bcrypt, jwt) {
    async function readUsers (req) {
        return new Promise((resolve, reject) => {
            userRepo.selectUsers(req)
                .then((results) => { 
                    if (results == 0){
                        reject('No users found.');
                    } resolve(results);
                }).catch((error) => { reject(error) });
        });
    }

    async function createUser (req) {
        req.password = await bcrypt.hash(req.password, 12);
        return new Promise((resolve, reject) => {
            if(!Object.values(req).every((val) => val !== "")){
                reject("Invalid Input.");
            }
            else userRepo.insertUser(req)
                .then(() => { return userRepo.selectUser(req.userId); })
                .then((results) => { resolve(results); })
                .catch((error) => { reject(error) });
        });
    }

    async function readUser (req){
        return new Promise((resolve, reject) => {
            userRepo.selectUser(req)
                .then((results) => { 
                    if (results == 0){
                        reject('User not found.');
                    } resolve(results); 
                })
                .catch((error) => { reject(error) });
        });
    }

    async function editUser (req) {
        if(req.body.data) {
            req.equal = await bcrypt.compare(req.body.data.oldpassword, req.password);
            if(req.body.data.password) req.body.data.password = await bcrypt.hash(req.body.data.password, 12);
        }
        return new Promise((resolve, reject) => {
            if(req.body.data && !Object.values(req.body.data).every((val) => val !== "")){
                reject("Invalid Input.");
            }
            userRepo.selectUserEdit(req.params.userId)
                .then((results) => {
                    var update = Object.values(results[0]);
                    if(req.body.data) {
                        delete req.body.data["oldpassword"];
                        for (var field in req.body.data) {
                            if (userColumns[field] === undefined) {
                                reject(`Cannot update ${field}.`);
                            } update[userColumns[field]] = req.body.data[field];
                        } 
                    }
                    if(req.iconPath) update[4] = req.iconPath;
                    update.push(req.params.userId);

                    if(req.body.data && req.body.data.password && !req.equal) {
                        reject("Invalid Old Password.");
                    } else {
                        return userRepo.updateUser(update);
                    }
                })
                .then(() => { resolve(userRepo.selectUser(req.params.userId)); })
                .catch((error) => { reject(error) })
        });
    }

    async function readUserSpaces (req) {
        return new Promise((resolve, reject) => {
            workspaceRepo.selectUserSpaces(req)
                .then((results) => { 
                    if (results == 0){
                        reject('No workspaces found.');
                    } resolve(results);
                })
                .catch((error) => { reject(error) });
        });
    }

    async function readUserMail (req){
        return new Promise((resolve, reject) => {
            userRepo.selectUserMail(req)
                .then((results) => { 
                    if (results == 0){
                        reject('User not found.');
                    } resolve(results); 
                })
                .catch((error) => { reject(error) });
        });
    }

    async function requestUserToken (req){
        const isEqual = await bcrypt.compare(req[0], req[1].password);
        return new Promise((resolve, reject) => {
            if(!isEqual) {
                reject('Wrong password!');
            } 
            else {
                const token = jwt.sign({email: req[1].email, userId: req[1].userId,},
                    'notesOnSignature', { expiresIn: '24h'});
                resolve({token: token, userId: req[1].userId});
            }
        });
    }

    return {
        readUsers,
        createUser,
        readUser,
        editUser,
        readUserSpaces,
        readUserMail,
        requestUserToken,
    }
}

module.exports = services;
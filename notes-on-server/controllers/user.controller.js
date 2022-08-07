function controller (userService, shortid) {
    async function getUsers (req, res) {
        userService.readUsers(req)
            .then((results) => { res.status(200).json({ message: 'Users retreived.', data: {users: results} }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function postUser (req, res) {
        var userInfo = Object.assign({userId : shortid()}, req.body.data);
        userService.createUser(userInfo)
            .then((results) => { res.status(200).json({ message: 'User created.', data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getUser (req, res) {
        var userId = req.params.userId
        userService.readUser(userId)
            .then((results) => { res.status(200).json({ message: 'User retrieved.', data: results[0] }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function patchUser (req, res) {
        var user = req.params.userId
        userService.readUser(user)
            .then((results) => { user = results[0].userName; return userService.readUserMail(results[0].email); })
            .then((results) => { var userInfo = Object.assign({password : results[0].password}, req); return userService.editUser(userInfo); })
            .then((results) => { res.status(200).json({ message: `User ${user} updated.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getUserSpaces (req, res) {
        var user = req.params.userId
        userService.readUser(user)
            .then((results) => { user = results[0].userName; return userService.readUserSpaces(req); })
            .then((results) => { res.status(200).json({ message: `Workspaces of ${user} Retrieved.`, data: results }) })
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    async function getUserLogin (req, res) {
        var user = req.body.data.email
        userService.readUserMail(user)
            .then((results) => { return userService.requestUserToken([req.body.data.password,results[0]]); })
            .then((results) => { res.status(200).json({ message: `User logged in.`, data: results }) }) 
            .catch((error) => { res.status(400).json({ message: error }) });
    }

    return {
        getUsers,
        postUser,
        getUser,
        patchUser,
        getUserSpaces,
        getUserLogin,
    }
}

module.exports = controller;
function authenticate (jwt) {
    async function auth (req, res, next) {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            res.status(401).json({ message: 'Not authenticated!' }) 
        } else {
            const token = authHeader.split(' ')[1];
            let decodedToken;
            try {
                decodedToken = jwt.verify(token, 'notesOnSignature');
            } catch (err) {
                res.status(500).json({ message: err }) 
            } 
            
            if (decodedToken) {
                req.isLoggedIn = true;
                req.userId = decodedToken.userId;
                req.email = decodedToken.email;
                next();
            }
        }    
    }
    
    
    return {
        auth,
    }
}


module.exports = authenticate;
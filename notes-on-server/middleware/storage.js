
function storage (multer) {
    const diskStorage = multer.diskStorage({
        destination: (req, file, callback) => {
            callback(null, './public');
        },
        filename: (req, file, callback) => {
            const mimeType = file.mimetype.split('/');
            const fileType = mimeType[1];
            const milliseconds = new Date().getTime()
            const fileName = file.originalname + "_" + milliseconds.toString() + '.' + fileType 
            callback(null, fileName);

            if(fileName.includes("cover")) req.coverPath = `http://localhost:3000/static/${fileName}`;
            else if (fileName.includes("icon")) req.iconPath = `http://localhost:3000/static/${fileName}`;
            else req.filePath = `http://localhost:3000/static/${fileName}`;
        },
    });
      
    const fileFilter = (req, file, callback) => {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', "image/webp"];
        allowedMimeTypes.includes(file.mimetype) ? callback(null, true) : callback(null, false);
    };

    const imgStore = multer({ storage: diskStorage, fileFilter: fileFilter }).single('image');
    
    return {
        imgStore,
    }
}

module.exports = storage;
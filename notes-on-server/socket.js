function onConnection (socket) {
    let previousRoomId;

    socket.on("joinPage", async (payload) => {
        const pageId = payload.pageId;

        if(previousRoomId) {
            socket.leave(previousRoomId);
        }
        socket.join(pageId);
        previousRoomId = pageId;
    })
    
    socket.on("pageChanges", async (payload) => {
        const pageId = payload.pageId;
        socket.to(pageId).emit("onChanged");
    })
    
}

module.exports = onConnection;
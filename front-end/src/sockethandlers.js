const exports = (module.exports = {});
exports.chatMessages = function(messages) {
    this.updateChatlogs(messages);
};

exports.rooms = function(rooms) {
    const roomObj = JSON.parse(rooms);
    this.setState({
        rooms: roomObj.rooms,
        currentRoom: roomObj.currentRoom
    });
};

exports.error = function(error) {
    console.log(`Error: ${error}`);
    window.localStorage.clear();
    console.log(this);
    // this.close();
    return this.setState({ loggedIn: false });
};

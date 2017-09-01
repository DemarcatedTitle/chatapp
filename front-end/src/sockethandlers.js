/* eslint-disable no-console */
const exports = (module.exports = {});
exports.chatMessages = function(messages) {
    this.updateChatlogs(messages);
};

exports.rooms = function(rooms) {
    console.log("rooms");
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

exports.users = function(users) {
    const userObj = JSON.parse(users);
    if (userObj.currentUser !== undefined && userObj.users !== undefined) {
        return this.setState({
            users: userObj.users,
            currentUser: userObj.currentUser
        });
    } else {
        console.log(`userobj has some undefined ${JSON.stringify(userObj)}`);
        console.log(typeof userObj);
        // return this.setState({ users: userObj.users });
    }
};

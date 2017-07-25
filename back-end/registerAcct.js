const bcrypt = require("bcrypt");
module.exports = {
    hashPass: function(plainTextPass, callback) {
        bcrypt.hash(plainTextPass, 10, function(err, hash) {
            if (callback) {
                callback(hash);
            }
            return hash;
        });
    }
};

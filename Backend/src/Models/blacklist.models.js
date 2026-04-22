const mongoose = require('mongoose');
const blackListTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "token is required at blacklist"]
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    }
});
const BlackListToken = mongoose.model('BlackListToken', blackListTokenSchema);
module.exports = BlackListToken;
const mongoose = require('mongoose');

const userSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const User=mongoose.model('User',userSchema);

module.exports = User;


const mongoose = require('mongoose');

const adminSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const Admin=mongoose.model('Admin',adminSchema);

module.exports = Admin;


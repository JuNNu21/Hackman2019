const mongoose = require('mongoose');

const registerSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const Register=mongoose.model('Register',registerSchema);

module.exports = Register;


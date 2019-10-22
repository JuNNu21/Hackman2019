const mongoose = require('mongoose');

const configSchema=new mongoose.Schema(mongoose.Schema.Types.Mixed, {strict: false});

const Config=mongoose.model('Config',configSchema);

module.exports = Config ;
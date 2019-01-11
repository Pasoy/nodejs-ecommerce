var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {
        type: String,
        es_type: 'text',
        unique: true,
        lowercase: true
    }
});

module.exports = mongoose.model('Category', CategorySchema);

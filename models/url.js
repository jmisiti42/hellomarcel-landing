const mongoose = require('mongoose');

var UrlSchema = new mongoose.Schema({
	url: {type: String, required: true},
	created_at: {type: Date, default: Date.now() },
	name: {type: String, required: true, unique: true}
});

module.exports = mongoose.model('Url', UrlSchema);

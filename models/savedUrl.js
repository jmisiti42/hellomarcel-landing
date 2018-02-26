const mongoose = require('mongoose');

var SavedUrlSchema = new mongoose.Schema({
	name: { type: String, required: true },
	from: { type: String, default: "other" },
	timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedUrl', SavedUrlSchema);

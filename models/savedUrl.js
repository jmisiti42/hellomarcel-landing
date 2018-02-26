const mongoose = require('mongoose');

var SavedUrlSchema = new mongoose.Schema({
	name: { type: String, required: true },
	from: { type: String, default: "other" },
	timestamp: { type: Date, default: Date.now }
});

SavedUrlSchema.create = (datas) => {
	this.name = datas.name;
	this.from = datas.from ? datas.from : "other";
	return this;
};

module.exports = mongoose.model('SavedUrl', SavedUrlSchema);

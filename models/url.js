const mongoose = require('mongoose');

var UrlSchema = new mongoose.Schema({
	url: {type: String, required: true},
	name: {type: String, required: true}
});

const hash = (pwd) => {
	return hasha(pwd, {algorithm: 'whirlpool'});
}

UrlSchema.create = (datas) => {
	this.password = hash(datas.password);
	this.mail = datas.mail;
	this.childs = datas.childs ? datas.childs : null;
	return this;
};

module.exports = mongoose.model('Url', UrlSchema);

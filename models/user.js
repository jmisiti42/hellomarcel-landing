/**
 * Created by hfisselier on 11/04/2017.
 */
'use strict'

const mongoose = require('mongoose');
const BASE = "0000"; // Base for userId

var UserSchema = new mongoose.Schema({
    internalId: {type: String},
    pageId: {type: Number},
    pageUserId: {type: Number},
    imageUrl: {type: String},
    lastStep: {type: String}, // Stringified last step
    currentStep: {type: String}, // Stringified current step
    variables: [new mongoose.Schema({
        name: {type: String, required: true},
        value: {type: String},// , validate: /\S*/ ?
        conditionModel: {type: String},
        conditionValue: {type: String},
        conditionBranch: {type: String},
        timestamp: {type: Date, required: true}
    }, {_id: false})],
    stepsCount: [{
        stepId: {type: String},
        count: {type: Number}
    }],
    currentUserInteraction: {type: Date},
    lastUserInteraction: {type: Date},
    lastBotInteraction: {type: Date},
    favorites: {
        restaurants: [mongoose.Schema.ObjectId],
        places: [mongoose.Schema.ObjectId],
        anniversaries: [mongoose.Schema.ObjectId],
        gifts: [mongoose.Schema.ObjectId],
        challenge: [mongoose.Schema.ObjectId]
    },
    active: {type: Boolean, default: true},
    created_at: {type: Date},
	fromCustomer: {type: Boolean, default: false},
	blocked: {type: Boolean, default: false}
});


UserSchema.statics.backType = {
    active: "active",
    firstVisit: "firstVisit",
    day: "day",
    yesterday: "yesterday",
    week: "week",
    month: "month",
    year: "year"
}

UserSchema.statics.lastBackType = {
    active: "active",
    firstVisit: "firstVisit",
    day: "day",
    yesterday: "yesterday",
    week: "week",
    month: "month",
    year: "year"
}



module.exports = mongoose.model('User', UserSchema);

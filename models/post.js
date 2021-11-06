const mongoose = require('mongoose')
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

let postSchema = new Schema({
    title:{type:String, required:true},
    text:{type:String, required:true},
    published:{type:Boolean, default: false},
    date:{type:Date, default:Date.now()},
})

postSchema
.virtual('date_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Post', postSchema)
const mongoose = require('mongoose')
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

let commentSchema = new Schema({
    name:{type:String, required:true},
    text:{type:String, required:true},
    post:{type:Schema.Types.ObjectId, ref:'Post', required:true},
    date:{type:Date, default:Date.now()}
})

commentSchema.set('toJSON', { virtuals: true })

commentSchema
.virtual('date_formatted')
.get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Comment', commentSchema);
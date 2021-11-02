const mongoose = require('mongoose')

const Schema = mongoose.Schema;

let commentSchema = new Schema({
    name:{type:String, required:true},
    text:{type:String, required:true},
    post:{type:Schema.Types.ObjectId, ref:'Post', required:true},
    date:{type:Date, default:Date.now()}
})

module.exports = mongoose.model('Comment', commentSchema);
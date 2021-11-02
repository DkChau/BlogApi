const mongoose = require('mongoose')

const Schema = mongoose.Schema;

let postSchema = new Schema({
    title:{type:String, required:true},
    text:{type:String, required:true},
    published:{type:Boolean, default: false},
    date:{type:Date, default:Date.now()},
})

module.exports = mongoose.model('Post', postSchema)
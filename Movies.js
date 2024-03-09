var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.DB);

// Movie schema
var MovieSchema = new Schema({
    "title": String,
    "releaseDate": String,
    "Actors": [{"actorName":String, "characterName":String}]
});

// return the model
module.exports = mongoose.model('Movie', MovieSchema);
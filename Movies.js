var mongoose = require('mongoose');
var Schema = mongoose.Schema;

try {
    mongoose.connect(String(process.env.DB), {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected"));
}catch (error) {
    console.log(error)
    console.log("could not connect");
}

// Movie schema
var MovieSchema = new Schema({
    "title": String,
    "releaseDate": String,
    "Actors": [{"actorName":String, "characterName":String}]
});


// return the model
module.exports = mongoose.model('Movie', MovieSchema);
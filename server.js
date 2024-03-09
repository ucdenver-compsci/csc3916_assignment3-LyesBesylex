/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }

            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
.get((req, res) => {
    Movie.find({}, function (err, movies) {
        if (err) {
            // Handle error if any
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            // If no error, send the retrieved movies
            res.json([{ success: true, movies: movies}]);
        }
    });
    })
    .post((req, res) => {
        if (!req.body.title || !req.body.actors || !req.body.genre|| !req.body.releaseDate) {
            res.json({success: false, msg: 'Please include all information about movie (Title, actors, genre, releaseDate)'})
        } 
        else if (!Array.isArray(req.body.actors) || req.body.actors.length < 3) {
            res.json({ success: false, msg: 'Please provide at least three actor for the movie.' });
        }
        else {
            var movie = new Movie();
            movie.title = req.body.title;
            movie.actors = req.body.actors;
            movie.genre = req.body.genre;
            movie.releaseDate= req.body.releaseDate;
    
            movie.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'That movie already exists'});
                    else
                        return res.json(err);
                }
    
                res.json({success: true, msg: 'Successfully created new movie.'})
            });
        }
    })
    .put(authJwtController.isAuthenticated, (req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    })
    .delete(authController.isAuthenticated, (req, res) => {
        res.status(405).send({ message: 'HTTP method not supported.' });
    })
    .all((req, res) => {
        // Any other HTTP Method
        // Returns a message stating that the HTTP method is unsupported.
        res.status(405).send({ message: 'HTTP method not supported.' });
    });

router.route('/movies/:MovieId')
    .get((req, res) => {
        const MovieId = req.params.MovieId;
        Movie.findOne({title: MovieId}, function (err, movie) {
            if (err) {
                // Handle error if any
                res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else {
                // If no error, send the retrieved movie
                res.json({ success: true, movies: movie });
            }
        });
        })//Working
    .post((req, res) => {
            res.status(405).send({ message: 'HTTP method not supported.' });
        }) //Working
    .put(authJwtController.isAuthenticated, (req, res) => {
            const MovieId = req.params.MovieId;
            var newvalues = { $set: req.body};

            Movie.updateOne({title: MovieId}, newvalues, function (err, movie) {
                if (err) {
                    // Handle error if any
                    res.status(500).send({ message: "Error in update Movies/:movieid" });
                } else {
                    // send back the updated movie information
                    res.json({ success: true, movies: movie });
                }
            });

        })//Working
    .delete(authController.isAuthenticated, (req, res) => {
            const MovieId = req.params.MovieId;

            Movie.deleteOne({title: MovieId}, function (err, movie) {
                if (err) {
                    // Handle error if any
                    res.status(500).send({ message: "Error in delete Movies/:movieid" });
                } else {
                    // If no error, send the retrieved movie
                    res.status(404).send({ message: "Successfully Deleted" });
                }
            });

        }) //Working
        .all((req, res) => {
            // Any other HTTP Method
            // Returns a message stating that the HTTP method is unsupported.
            res.status(405).send({ message: 'HTTP method not supported.' });
        });
    


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only



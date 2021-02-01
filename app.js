const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const request = require('request');
const { json, query } = require('express');
const querystring = require('querystring');
const { stat } = require('fs');
const { post, get } = require('request');;
const bodyParser = require('body-parser');
const { spotifyGenres } = require('./weatherAudio/weatherGenre');

require('dotenv').config();

const app = express();

const client_id = process.env.CLIENT_ID; 
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI
});

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/login', function(req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email',
        redirect_uri: redirect_uri,
        state: 'state'
    }));
});

app.get('/callback', function(req, res) {
    const code = req.query.code ||null 
    const state = req.query.state || null
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
            state: state
        },
        headers: {
            'Authorization' : `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`,
            'Content-type': 'application/x-www-form-urlencoded'
        },
        json: true
    }
    request.post(authOptions, function(error, response, body) {
        const token = body.access_token;
        const expireToken = body.expires_in;
        const uri = 'http://localhost:8888';
        res.redirect(`${uri}?access_token=${token}`);
        //User access token info
        //Changes upon login
        console.log(`Logged in. Access token expires in ${expireToken} seconds (1 hour)`);

        //Stores access token in tokenObj for later use
        var tokenObj = {}
        tokenObj['access_token'] = token;
        console.log(tokenObj);

        module.exports = {token, code, state, spotifyApi}
    });
});

//Will implement Heroku server hosting
const port = 8888;
app.listen(port, () => console.log(`Listening on ${port}.`))
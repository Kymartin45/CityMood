const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const stateKey = 'spotify_auth_state';
const app = express();
const fetch = require('node-fetch');
const ejs = require('ejs');
const path = require('path');

const SpotifyWebApi = require('spotify-web-api-node');
const { get } = require('request');
const { json } = require('body-parser');
require('dotenv').config();

app.use(express.static(__dirname = './public'))
    .use(cors())
    .use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

app.get('/', function(err, res) {
    if (!error) {
        res.render('index', {});
    } else {
        console.log(err);
    }
});

app.get('/login', function(req, res) {
    api.clientCredentialsGrant().then(function(data) {
        res.redirect(api.createAuthorizeURL(scopes));
        console.log('Access token expires in ' + data.body['expires_in'] + 's');
        // console.log('Access token: ' + data.body['access_token']);

        //Save access token for future calls 
        api.setAccessToken(data.body['access_token']);

    }, function(err) {
        console.log('Error retrieving access token', err)
    });
});

app.get('/callback', function(req, res) {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;

    if(error) {
        console.error('Callback error:', error);
        res.send(`Callback error: ${error}`);
        return;
    }

    api.authorizationCodeGrant(code).then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        api.setAccessToken(access_token);
        api.setRefreshToken(refresh_token);

        res.sendFile('index.html', { root: __dirname });

        //Display logged in user server-side
        api.getMe().then(function(data) {
            const user_name = data.body['display_name'];
            console.log(`${user_name} logged in`);

        }, function(err) {
            console.error('Error getting user', err);
        });

        //Returns user playlists
        //Will be editing 
        api.getUserPlaylists(data.body['display_name']).then(function(data) {
            const albumImage = '';
            for (var i = 0; i < data.body.items[i].images[1].url.length; i++) {
                albumImage += console.log(data.body.items[i].images[1].url)   
            }
            return albumImage; 
        }, function(err) {
            console.log('error retrieving user playlists', err);
        });
    })
    .catch(error => {
        console.error('Error getting token:', error);
        res.send(`Error getting token: ${error}`);
    });
});

//Refresh token 
app.get('/refresh', function(req, res) {
    res.redirect(api.createAuthorizeURL(scopes));
    api.refreshAccessToken().then(function(data) {
        console.log('Access token refreshed.');

        api.setAccessToken(data.body['access_token']);
    }, function(err) {
        console.log('Could not refresh access token', err)
    });
});


//Will implement Heroku server hosting
const port = 8888;
app.listen(port,() => console.log(`Listening on http://localhost:${port}/`));
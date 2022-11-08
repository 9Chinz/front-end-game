const express = require('express');
const app = express();
const PORT = 3001

const path = require('path');

const axios = require('axios');

const jwt = require('jsonwebtoken');
const jwtExtractor = require('passport-jwt').ExtractJwt;
const jwtStrategy = require('passport-jwt').Strategy;
const passport = require('passport');
const exp = require('constants');

const config =  require('./config.js');
const SECRET_KEY = config.TOKEN_SECRET;
const GAME_ID = config.GAME_ID;

const jwtOption = {
    jwtFromRequest: jwtExtractor.fromUrlQueryParameter("accessToken"),
    secretOrKey: SECRET_KEY
};

const jwtAuth = new jwtStrategy(jwtOption, (payload, done) => {    
    // check statue ment to open game
    if (payload.game_id !== GAME_ID){
        return done(null, false);
    }else{
        return done(null, true);
    }
});

passport.use(jwtAuth);

const middlewareGame = passport.authenticate("jwt", {session: false});

app.use(express.json());



app.get('/', middlewareGame, (req, res) => {
    res.sendFile(path.join(__dirname+'/dist/index.html'))
});

app.use("/", express.static(__dirname+'/dist'))

const postOption = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-client-id': config.X_CLIENT_ID_MCARD,
        'x-client-secret': config.X_CLIENT_SECRET_MCARD,
        'x-app-id': config.X_APP_ID
    }
}

app.post('/sendUpdate', async (req, res) => {
    const { accessToken, point, newReference } = req.body;
    const {reference, game_id, configuration, iat, exp} = jwt.decode(accessToken);
    
    let sendRef = reference

    if (newReference){
        sendRef = newReference
    }
    
    const jsonData = {
        "reference": sendRef,
        "game_id" : game_id,
        "point" : point
    }

    try {
        let result = await axios.post(`${config.API_ENDPOINT_MCARD}/api/gamification/v1/update-result`, jsonData, postOption);
        res.status(200).json(result.data);
    } catch (err) {
        res.send(err.response.data);
    }
    
});

app.listen(PORT, () => { console.log(`listening on port: http://localhost:${PORT} | env ${config.NODE_ENV}`) });

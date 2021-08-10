const express = require('express');
const fs = require('fs');
const crypto = require('crypto');

//const mongoose = require('mongoose');

function tokengen(num=5)
{
    let randBytes = crypto.randomBytes(num);
    let hash = crypto.createHash('sha512');
    hash.update(randBytes);
    return hash.digest('base64').replace("/","%2f").replace("@","%40");
}

const app = express();
const db = require('./db');
const PORT = process.env.PORT || 8000;
const keylen = 5;
const MAX_FIELDS = 8;
const MAX_CHANNELS = 8;

const User = db.User;
const fieldObj =  db.CreateFieldObject;


app.get('/',(req,res,next) => {
    res.send('OK');
    next();
});

app.get('/CreateUser/email/:email/passcode/:passcode', (req,res,next) => {
    let params = req.params;
    let email = params.email;
    let passcode = params.passcode;
    let user;
    let exists = false;

    User.exists({email : email },(err,state) => {
        if(err) console.error(err);
        exists = state;
    });
    
    if(!exists){
        user = new User({
            email : email,
            passcode : passcode,
            api_key : tokengen(keylen)
        });

        user.save((err,user) => {
            if(err) console.error(err);
            console.log("New User created Successfully with ObjectId "+String(user._id));
        });
        res.send('OK');
    }
    else {
        res.send("User already exists");
    }

    next();
});

app.get('FromUser/email/:email',(req,res,next) => {
    let email = req.params.email;
    let userObj = 0;
    User.find({email : email },(err,user) => {
        if(err) console.error(err);
        console.log(user);
        userObj = user;
    });
    next();
});

app.get('/DeleteUser/email/:email/passcode/:passcode', (req,res,next) => {
    let email = req.params.email;
    let passcode = req.params.passcode;
    let exists =  false;
    
    setTimeout(() => {
        User.exists({email : email,passcode : passcode},(err,state) => {
            if(err) console.error(err);
            exists = state;
        });
    },2000);

    if(exists)
        User.deleteOne({email : email, passcode : passcode}, (err,user) => {
            if(err) console.error(err);
            console.log(`User ${user._id} deleted`);
        });
    
    //console.log(`Cannot delete user with email ${email}: User does not exist`);
    //res.status(404).send("User does not exist");
    next();

});


app.get('AddField/api_key/:key/channel_id/:channel/fields/:fields',(req,res,next) => {
    let key     = req.params.key;
    let channel = req.params.channel;
    let fields  = req.params.fields;
    let exists  = false;
    let errmsg  = "OK";
    let fieldValues = fields.split("&");
    let obj = {};
    
    fieldValues.forEach((element) => {
        let str = element.split("=");
        let value = str[1];
        let nameTypePair = str[1].split(':');
        switch(nameTypePair[1])
        {
            case 'int':
                value = parseInt(number);
                break;
            case 'float':
                value = parseFloat(number);
                break;
            default:
                break;
        }
        obj = fieldObj(nameStr=nameTypePair[0],typeStr=nameTypePair[1],precison_num=3);
    });

    User.exists({ api_key : key },(err,state) => {
        if(err) console.error(err);
        exists = state;
    });

    User.findOne({ api_key : key },(err,user) => {
        if(err) console.error(err);
        if(exists)
        {
            (user.channels[channel] === undefined) ? user.channels[channel] = [] : undefined;
            (channel > MAX_CHANNELS) ? errmsg = "Channel limit reached" : 
            (user.channels[channel].length > MAX_FIELDS) ? errmsg = "Field limits exceed" : 
            user.channels[channel].push(obj);
        }
        else 
            errmsg = `User with api_key ${key} does not exist`;
    });
    /*res.send(errmsg);*/
    next();
});

app.get("*",(req,res) => {
    res.status(404).send(`Url ${req.url} does not exist`);
});

app.listen(PORT,(err) => {
    if(err) console.error(err);
    console.log(`Server running on http://localhost:${PORT}`);
});


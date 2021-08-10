const mongoose = require('mongoose');
const dburl = 'mongodb://localhost:27017/test';
const MAX_FIELDS = 8;

function CreateFieldObject(nameStr="",typeStr="",valueStr=undefined,precision_num=undefined)
{
    let field = {
        name : nameStr,
        type : typeStr,
        value : valueStr,
        precison : precision_num,
        timeStamp : new Date()
    }
    return field;
}

console.log(CreateFieldObject("temperature",typeof(0),100.0,2));



mongoose.connect(dburl,{useNewUrlParser : true, useUnifiedTopology  : true});
const db = mongoose.connection;
db.on('error',console.error.bind(console,'connection: error'));
db.once('open',() => {
    console.log('Connection to database made successfully');
});


/*
Url format:
    http://kandathings.io/post/:api_key/:channelId/name1:type=val1&val2&val3...val8
*/

const userSchema = new mongoose.Schema({
    email : String,
    passcode : String,
    api_key : String,
    channels : new Array(8)
});

userSchema.methods.createChannel = (channel=0,fieldObject=undefined) => {
    let already_created = (this.channels[channel].length > 0) ? true : false;
    (fieldObject == undefined && already_created) ? this.channels.push([]) : this.channels.push([fieldObject]);
}

userSchema.methods.addField = (channel,fieldObject) => {
    
    return (this.channels.length > 8) ? `Max Allowable fields for user is ${MAX_FIELDS}` : this.channels[channel].push(fieldObject);
}

const User = mongoose.model('User',userSchema);

// const abdul =  new User({
//     email : 'abdulhameedotade@gmail.com',
//     passcode : 'quan3tum1ttr',
//     api_key : 'xjdl4khr3o4ukr39o4'
// });

// abdul.save((err,abdul) => {
//     if(err) return console.error(err);
// });

//abdul.addField();

//console.log(abdul.channels.push(CreateFieldObject('humidity','float',23.4,3)));

module.exports = {
    User,
    CreateFieldObject
}


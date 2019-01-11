var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

/* The user schema attributes / characteristics / fields */
var UserSchema = new Schema({

    email: {
        type: String,
        es_type: 'text',
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        es_type: 'text'
    },

    profile: {
        name: {
            type: String,
            es_type: 'text',
            default: ''
        },
        picture: {
            type: String,
            es_type: 'text',
            default: ''
        }
    },

    address: {
        type: String,
        es_type: 'text'
    },
    history: [{
        paid: {
            type: Number,
            es_type: 'long',
            default: 0
        },
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    }]
});

/*  Hash the password before we even save it to the database */
UserSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(15, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/* compare password in the database and the one that the user type in */
UserSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function (size) {
    if (!this.size) size = 200;
    if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
    var md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}


module.exports = mongoose.model('User', UserSchema);

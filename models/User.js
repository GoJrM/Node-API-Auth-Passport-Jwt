const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({  
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    refreshToken: {
        type: String
    }
});

//using the pre() hook before any save
UserSchema.pre('save', function (next){  
    const user = this;
    if (this.isModified('password') || this.isNew){
        bcrypt.genSalt(10, function(err, salt){
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    } else {
      return next();
    }
});

UserSchema.methods.comparePassword = async function (password) { 
    const user = this; 
    const compare = await bcrypt.compare(password, user.password);
    return compare;
};
module.exports = mongoose.model('User', UserSchema);

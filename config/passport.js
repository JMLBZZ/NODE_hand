const LocalStrategy = require("passport-local").Strategy

const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

// chargement du modèle utilisateur
const User = mongoose.model("users");

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
        //console.log(password);//pour tester si le mdp fonctionne
        //correspondance de l'utilisateur :
        User.findOne({ email: email })
            .then(user => {
                if (!user) {//si l'utilisateur n'existe pas...
                    return done(null, false, { message: "Utilisateur non reconnu" });// ... alors, retourne la méthode "done" avec 3 paramètres : error, utilisateur(booleen), et une option (de vérification)
                }
                //correspondance ou non, du mot de pass (via bcrypt) par rapport au mdp stocké dnas la bdd :
                bcrypt.compare(password, user.password, (err, isMatch) => {//isMatch est un booléen
                    if (err) throw err;
                    if (isMatch) {//si isMatch est true...
                        return done(null, user)//...alors, récupère l'utilisateur...
                    } else {
                        return done(null, false, { message: "Le mot de passe est incorrect!" })//... sinon, affiche le message d'erreur
                    }
                });
            });
        })
    );

    // sérialisation :
    passport.serializeUser(function(user,done){
        done(null, user.id)
    });

    // désérialisation :
    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err,user)
        })
    });


};












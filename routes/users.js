const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require('bcryptjs');
const passport = require('passport');

const router = express.Router();

// chargement de la modélisation :
require("../models/Users");
const User = mongoose.model("users");

//user login route
router.get("/login", (req, res)=>{
    res.render("users/login")
});

//user register route
router.get("/register", (req, res)=>{
    res.render("users/register")
});

// login formulaire POST
router.post("/login", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect:"/ideas",
        failureRedirect:"/users/login",
        failureFlash:true
    })(req,res,next)
});

// user register formulaire POST
router.post("/register", (req, res)=>{
    //pour tester
    //console.log(req.body)
    //res.send("profil enregistré")

    let errors = [];//tableau vide qui sera remplis s'il y a des erreurs
    if(req.body.password !== req.body.password2){//si les deux champs sont différents, alors...
        errors.push({text:"Les deux mots de passes doivent être identiques"})//... affiche le message :
    }
    if(req.body.password.length <4){
        errors.push({text:"le mot de passe doit contenir au moins 4 caractères"})
    }
    if(errors.length > 0){
        res.render("users/register",{
            errors: errors,
            name:req.body.nom,
            email:req.body.email,
            password:req.body.password,
            password2:req.body.password2,
        })
    }else{
        User.findOne({email:req.body.email})
            .then(user=>{
                if(user){
                    req.flash("error_msg", "L'adresse email existe déjà");
                    res.redirect("/users/register");
                }else{
                    const newUser = new User({
                        name:req.body.nom,
                        email:req.body.email,
                        password:req.body.password,
                    });

                    bcrypt.genSalt(10, function(err, salt) {
                        bcrypt.hash(newUser.password, salt, function(err, hash) {
                            if(err) throw err;
                            newUser.password = hash;
                            newUser.save()
                                .then(user =>{
                                    req.flash("success_msg", "Votre profil de connexion est enregistré. Vous pouvez vous connecter.");
                                    res.redirect("/users/login");
                                })
                                .catch(err => {
                                    console.log(err);
                                    return;
                                })
                        });
                    });
                }
            })        
    }

});

// route de Logout utilisateur
router.get("/logout", (req, res, next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success_msg", "Vous êtes déconnecté");
        res.redirect("/users/login");
    });

})


module.exports = router;
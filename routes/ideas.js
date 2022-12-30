const mongoose = require("mongoose");
const express = require("express");
const {ensureAuthenticated} = require("../helpers/auth");

const router = express.Router();



// chargement de la modélisation :
require("../models/Ideas");
const Idea = mongoose.model("ideas");



// route pour ideas/add :
router.get("/add", ensureAuthenticated, (req, res) => {
    res.render("ideas/add");
});

//récupération des données de la BDD et les afficher (dans view/ideas/index):
router.get("/", ensureAuthenticated, (req, res) => {
    Idea.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then((ideas) => {
    res.render("ideas/index", {
        ideas: ideas,
    });
    });
});

// accès à tous les ideas
router.get("/allideas", ensureAuthenticated, (req, res) => {
    Idea.find({})
        .sort({ date: "desc" })
        .then((ideas) => {
        res.render("ideas/allideas", {
            ideas: ideas,
            user: req.user,
        });
    });
});

// traitement du formulaire :
router.post("/", ensureAuthenticated, (req, res) => {
    console.log(req.body);
    //validation du formulaire coté back:
    //res.send("Validé");

    // validation des infos du formulaire coté front
    let errors = [];
        //condition pour renseigner tous les champs
    if(!req.body.title){//on test : si le titre est vide...
        errors.push({text: "Merci d'ajouter un titre"});//alors met cette valeur dans le tableau "let errors = [];"
    }
    if(!req.body.details){//on test : si le détail est vide...
        errors.push({text: "Merci d'ajouter un détail"});//alors met cette valeur dans le tableau "let errors = [];"
    }
    if(errors.length){//si la taille du tableau est sup à 0...
        res.render("ideas/add",{//... alors affiche le formulaire et passe lui le paramètre des erreurs dans le template
            errors:errors,
            title:req.body.title,
            details:req.body.details
        });
    }else{
        //res.send("Le formulaire est validé")
        const newUser ={
            title:req.body.title,
            details:req.body.details,
            user:req.user.id
        };

        new Idea(newUser)
            .save()
            .then(idea => {
                req.flash("success_msg","Idée de vidéo ajoutée")
                res.redirect("/ideas")
            });
    }
});

// route récupèration du formulaire pour modification
router.get("/edit/:id",ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id:req.params.id//l'élément "_id" vient de la BDD
    })
    .then(idea => {
        if(idea.user != req.user.id){//si l'user est différent de l'id...
            req.flash("error_msg","Accès non autorisé");//...alors affiche le message
            res.redirect("/ideas");
        }else{
            res.render("ideas/edit", {
                idea:idea
            });
        }
    });
});

router.put("/:id", ensureAuthenticated, (req, res) => {
    Idea.findOne({_id:req.params.id})
        .then(idea => {
            //nouvelle valeur : 
            idea.title = req.body.title;
            idea.details = req.body.details;
            // sauvegarder :
            idea.save()
                .then(idea=>{
                    req.flash("success_msg","Idée de vidéo modifiée")
                    res.redirect("/ideas");
                })
        })
});


//suppression des données
router.delete("/:id", ensureAuthenticated, (req, res) => {
    Idea.remove({_id:req.params.id})
    .then(()=>{
        req.flash("success_msg","Idée de vidéo supprimée")
        res.redirect("/ideas")
    })
});

module.exports = router;
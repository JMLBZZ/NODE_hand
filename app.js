const express = require("express");
const mongoose = require("mongoose");

const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')

const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash');
const path = require('path');
const passport = require('passport');

//chargement des routes
const ideas = require("./routes/ideas");
const users = require("./routes/users");

//implémenter le passport config
require("./config/passport")(passport);



const app = express();
const port = 5000;

//connexion mongodb
mongoose.Promise = global.Promise;
mongoose.connect ("mongodb://localhost/TokyoHandDb",{
    useNewUrlParser: true
    })
    .then(()=>console.log("MongoDb est connecté"))
    .catch((err)=>console.log(err));

const hbs = expressHandlebars.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers : {
        ifeq: function(arg1, arg2, options){
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
        }
    }
    });

//express-handlebars middleware :
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//express body parser middleware :
app.use(express.urlencoded({ extended:false}));
app.use(express.json());

//methode override middleware :
app.use(methodOverride('_method'))

//express-session middleware :
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))

//connect-flash middleware :
app.use(flash());

//passport middleware :
app.use(passport.initialize());
app.use(passport.session());







//dossier static
app.use(express.static(path.join(__dirname, "public")));

//variable globale
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
})


//utilisation des routes
app.use("/ideas", ideas);//toutes les routes qui commencent par /ideas renvoie ver le fichier ideas
app.use("/users", users);














app.get("/", (req, res) => {
    const title ="Bienvenue";
    res.render("index",{title:title});
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(port,() => {
    console.log(`Serveur sur le port ${port}`);
});


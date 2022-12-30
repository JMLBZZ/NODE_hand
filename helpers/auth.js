module.exports = {
    ensureAuthenticated: function(req,res,next){
        if(req.isAuthenticated()){//Si on est authentifié...
            return next();//...alors passe à la prochaine instruction
        }
        req.flash('error_msg',"Accès non autorisé");
        res.redirect("/users/login");
    }

};










exports.validId = function(req,res,next){
    if(!(req.params.id.match(/^[0-9a-fA-F]{24}$/))){
       res.status(404).json({errors: 'INVALID OBJECT ID'})
    }
    else{
        next();
    }
}
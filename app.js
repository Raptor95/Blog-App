var express          = require('express'),
    methodOverride   = require('method-override');
    expressSanitizer = require('express-sanitizer');
    app              = express(),
    mongoose         = require('mongoose'),
    bodyParser       = require('body-parser');

var port = process.env.PORT || 3000;
var url = process.env.MONGOLAB_URI;

//APP Config
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(express.static("public"));

//Mongoose/Model Config
//mongoose.connect("mongodb://localhost/blog_app");
mongoose.connect(url);
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

//Routes
app.get("/",function(req,res){
    res.redirect("/blogs");
});

//Find Route
app.get("/blogs",function(req,res)
{
    Blog.find({},function(err,blog){
        if(err)
            console.log("Error");
        else
            res.render("index",{blogs:blog});
    });
});

//New Route
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//Create Route
app.post("/blogs",function(req,res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog,function(err,newBlog){
        if(err)
            res.redirect("/blogs/new");
        else
            res.redirect("/blogs");
    });
});

//Show Route
app.get("/blogs/:id",function(req,res)
{
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.render("show",{blog:foundBlog});
    });
});

//Edit Route
app.get("/blogs/:id/edit",function(req,res)
{
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err)
            res.redirect("/blogs/:id");
        else
            res.render("edit",{blog:foundBlog});
    });
});

//Update route
app.put("/blogs/:id",function(req,res)
{
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs/"+req.params.id);
    });
});

//Delete Route
app.delete("/blogs/:id",function(req,res)
{
    Blog.findByIdAndDelete(req.params.id,function(err,deleteBlog){
        if(err)
            res.redirect("/blogs/:id");
        else
            res.redirect("/blogs");
    });
});

app.listen(port, function(){
    console.log(`Listening on port ${port}`);
})

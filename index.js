// creating a normal server using node
// when we are not using export default and we are using normal export then we need to import it with the same nome 
//however when we are using export default we can import it with some other name as well.
// const http = require("http");   this is used when we are using require
// import http from "http";// this is done when we change to type module in package.json file we use default export and import after than 
// import fs from "fs";
// import path from "path";

//now we are doing the same work we are doing down using a sync function 
// in the same we are going to do the write operation as well

// const home = fs.readFileSync("./index.html");

// some path function are 
// console.log(path.dirname("/home/index.js"));
// console.log(path.extname("/home.index.js"));

//creating a server without using express
// const server = http.createServer((req,res)=>{
//     if(req.url==="/about"){
//         res.end("<h1>About Page</h1>");
//     }
    // else if(req.url==="/"){
    //     res.end("<h1>Home Page</h1>");
    // }
    // else if(req.url==='/'){
        //here we are reading the file and then printing the file in async way
    //     fs.readFile("./index.html",(err,home)=>{
    //         res.end(home);
    //     })
    // }
//     else if(req.url==='/'){
//         // now returning the file that we read above 
//         res.end(home);
//     }
//     else if(req.url==='/contact'){
//         res.end("<h1>Contact Page</h1>");
//     }
//     else{
//         res.end("<h1>Page Not Found</h1>");
//     }
// });



// now we would be creating data using express 
// import express from "express";
// const app = express();
// import path from "path";
//other methods like get,post,put,delete can also be used
// app.get("/",(req,res)=>{
    //json is products of products 
    // res.json({
    //     success:true,
    //     products:[],
    // });
    // res.status(200);
    // res.send("hi");
    // res.status(200).json({
    //     success:true,
    //     products:[],
    // })
    // const pathlocation = path.resolve();
    // res.sendFile(path.join(pathlocation,"./index.html"));
// });

//setting up view engine
// app.set("view engine","ejs");
// app.get("/",(req,res)=>{
//     res.render('index.ejs',{name:"Adi"});
// })


// this is a middleware
// for using middleware we will do "use" along with app
// app.use(express.static(path.join(path.resolve(), 'public')));
// app.get("/",(req,res)=>{
    //directly linking to the static files in the public folder
//     res.sendFile("index");
// })



//generating a form and reading its data 

import express from "express";
import path from "path";
// import { generateLovePercent } from "./features.js";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend",
}).then(()=>console.log("database connected")).catch((error)=>{
    console.log(error);
})


const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const User = mongoose.model("users",userSchema);


const app = express();


// const users = [];

//using middleware
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(path.resolve(),"public")));

//setting up view engine
app.set('view engine', 'ejs')

// async and await are just ways that make promises easier to write
// async makes a function return a promise 
// and await makes a function wait for the promise 


const isAuthenticated = async(req,res,next) => {
    const {token} = req.cookies;
    if(token){
        const decode = jwt.verify(token,"adityaislearningnode");
        req.user = await User.findById(decode._id);
        next();
    }
    else{
        res.redirect("/login");
    }
};

app.get("/",isAuthenticated,(req,res)=>{
    res.render("logout",{name:req.user.name});
});

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/register",async(req,res)=>{
    res.render("register");
})

app.post("/register",async(req,res)=>{
    const {name,email,password} = req.body;
    let user = await User.findOne({email});
    if(user){
        return res.redirect("/login");
    }
    const hashed_password = await bcrypt.hash(password,10);

    user = await User.create({
        name,
        email,
        password:hashed_password,
    });

    const token = jwt.sign({_id:user._id},"adityaislearningnode");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
})

app.post("/login", async(req,res)=>{
    // users.push({username:req.body.email,email:req.body.password});
    // const user = ({email:req.body.email,password:req.body.password});
    const {email,password} = req.body;
    let user = await User.findOne({email});
    if(!user){
        return res.redirect("/register");
    }
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.render("login",{email,message:"Incorrect Password"});
    }

    const token = jwt.sign({_id:user._id},"adityaislearningnode");

    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
    });
res.redirect("/");
});

//redirect is used to tell the browser to issue a new request
//render is used to create the content

// app.get("/success",(req,res)=>{
//     res.render("success");
// })

// app.get("/users",(req,res)=>{
//     res.json({
//         users:users,
//     })
// })
// app.get('/logout',(req,res)=>{
//     res.cookie("token",null,{
//         httpOnly:true,
//         expires:new Date(Date.now()),
//     });
//     res.redirect("/");
// })




app.listen(5000,()=>{
    console.log("Server is working");
});


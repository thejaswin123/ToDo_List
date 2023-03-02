const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require('dotenv').config()

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs"); 
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin-thejaswin:"+process.env.MONGODB_PASSWD+"@cluster0.houzjiq.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
    name:String
};
const Item = mongoose.model("Item",itemsSchema);

const defaultItems=[{
    name:"eat food"
},{
    name:"do work"
},{
    name:"sleep"
}];

// var items=[];
// var workItems = [];

const listSchema={
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    // var today = new Date();
    // var options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // var day =  today.toLocaleDateString("en-US", options);

    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err)
                console.log(err);
                else
                console.log("Inserted the data");
            });
        }
        
        res.render("list",{
            listTitle:"Today",
            newListItems:foundItems
        });
    })
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
        if(!foundList){
            const list = new List({
                name: customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+customListName);
        }
        else{
            res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
        }
    });
});

app.post("/",function(req,res){
    
    // var item=req.body.newItem;
    // if(req.body.list === "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }

    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
        name:itemName
    });

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndDelete(checkedItemId,function(err){});
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name:listName},{
            $pull:{items:{_id:checkedItemId}}
        },function(err,foundList){
            res.redirect("/"+listName);
        });
    }
});

// app.get("/work",function(req,res){
//     res.render("list",{
//         listTitle: "Work",
//         newListItems: workItems
//     });
// });


app.listen(process.env.PORT||3000,function(){
    console.log("server is running on port 3000")
});

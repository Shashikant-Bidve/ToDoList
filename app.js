//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shashi:test123@cluster0.5srgoxi.mongodb.net/todolistDB");
// use('todolistDB');

const itemsSchema = {
  name : String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name : "Welcome to toDoList"
});

const item2 = new Item({
  name : "Hit + button to add items"
});

const item3 = new Item({
  name : "<-- Hit button to delete items"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List",listSchema);


async function getItems(){
  const Items = await Item.find({});
  return Items;
}

app.get("/", function(req, res) {

  getItems().then(function(foundItems){
    if(foundItems.length === 0){
        Item.insertMany(defaultItems).then(function(){
          console.log("Successfully added items");
        }).catch(function(err){
          console.log(err);
        });
        res.redirect("/");
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const ListName = req.body.list;

  const New = new Item({
    name : itemName
  });
  if(ListName === "Today"){
  New.save();
  res.redirect("/");}
  else{
    List.findOne({name: ListName}).then(function(foundList){
      foundList.items.push(New);
      foundList.save();
      res.redirect("/"+ ListName);
    })
  }
  
});

app.post("/delete",function(req,res){

    const checkedItemID = req.body.checkbox;
    const ListName = req.body.listName;

    if(ListName === "Today"){
      Item.findByIdAndRemove(checkedItemID).then(function(){
        console.log("Success");
      }).catch(function(err){
        console.log(err);
      });
      res.redirect("/");
    }else{
      List.findOneAndUpdate({name : ListName},{$pull: {items: {_id:checkedItemID}}}).then(function(foundList){
          res.redirect("/"+ListName);
      }).catch(function(err){
          console.log(err);
      });
      
    }
    
})

app.get("/:customRoute",function(req,res){
  const customListName =  _.capitalize(req.params.customRoute);

  List.findOne({name: customListName}).then(function(foundList){
    
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+ customListName);
      }
    else{
      res.render("list",{listTitle: foundList.name , newListItems:foundList.items})
    }
  }).catch(function(err){
    console.log(err);
  });
  


})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

var express = require("express");
var cors = require("cors");
var MongoClient = require("mongodb").MongoClient;
var url = require("url");
const { get } = require("https");
var app = express();
var url_mongo = "mongodb://localhost:27017/";

app.use(cors());


function search(database, query){
    var pr_id = [];
    for (let i = 0; i < database.length; i++){
        if ((database[i].title.toLowerCase()).includes(query.toLowerCase()) || database[i].type.toLowerCase() == query.toLowerCase()){
            pr_id.push(database[i]);
        }
    }
    return pr_id;
}


function get_info(url, database){
    if (url.req_type == "search"){
        return search(database, url.query);
    }
}
app.get("/", function(req, res){
    MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true,},
        function (err, client){
            var myurl = url.parse(req.url, true);
            //console.log(myurl.query);
            const db = client.db("project");
            function update_cart_data(user_id, given_cart){
                db.collection("users").updateOne(
                    {user_id: myurl.query.user_id},
                    [{
                        $set :{
                            cart : given_cart
                        }
                    }]
                )
            };
            if (myurl.query.req_type == "mainpage"){
            db.collection("mainpage").find({}).toArray(
                function(err, docs){
                    if (err) throw err;
                    res.send(docs);
                    //console.log(docs);
                }
            )
            }
            else if (myurl.query.req_type == "product_details"){
                console.log("product_details__________________________")
                db.collection("products").find({product_id: myurl.query.product_id}).toArray(
                    function (err, docs){
                        if (err) throw err;
                        res.send(docs);
                        console.log(docs);
                    }
                );
            }
            else if (myurl.query.req_type == "search"){
                db.collection("products").find({}).toArray(
                    function(err, docs){
                        if (err) throw err;
                        var result = search(docs, myurl.query.string);
                        console.log(myurl.query.string)
                        console.log(result);
                        res.send(result);
                    }
                )
            }
            else if (myurl.query.req_type == "send_cart"){
                console.log("cart -", myurl.query.user_id);
                db.collection("users").find({user_id: myurl.query.user_id}).toArray(
                    
                    function(err, docs){
                        if (err) throw err;
                        if (docs.length < 1) res.send([]);
                        else{
                        var cartitems = docs[0].cart;
                        res.send(cartitems);
                        }
                    }
                )
            }
            
            else if (myurl.query.req_type == "update_cart"){
                console.log("update_cart")
                console.log("userid:", myurl.query.user_id)
                db.collection("users").find({user_id: myurl.query.user_id}).toArray(
                    function(err, docs){
                        final_array = [];
                        var user_cart = docs[0].cart;
                        for(let vall = 0; vall < user_cart.length; vall++){
                            if (user_cart[vall].product_id == myurl.query.product_id && myurl.query.qty > 0){
                    
                                final_array.push({product_id: user_cart[vall].product_id, qty: myurl.query.qty});
                            }
                            else if (myurl.query.qty == 0 && user_cart[vall].product_id == myurl.query.product_id){
                                
                            }
                            else{
                                final_array.push(user_cart[vall]);
                            }
                        }
                        //[{product_id: "01", qty: "1"}, {product_id: "02", qty: "1"}]
                        update_cart_data(myurl.query.user_id, final_array);
                    }
                )
            }
            else if(myurl.query.req_type == "append_cart"){
                console.log("adding new item to cart");
                db.collection("users").find({user_id: myurl.query.user_id}).toArray(
                    function(err, docs){
                        final_array = [];
                        console.log(docs);
                        var user_cart = docs[0].cart;
                        var IsUpdate = true;
                        for (let val = 0; val < user_cart.length; val++){
                            if (user_cart[val].product_id == myurl.query.product_id) {
                                IsUpdate = false;
                                console.log("tried to add product but product already exists in cart.")
                            }
                        }
                        if (IsUpdate == true) user_cart.push({product_id: myurl.query.product_id, qty: myurl.query.qty})
                        //[{product_id: "01", qty: "1"}, {product_id: "02", qty: "1"}]
                        update_cart_data(myurl.query.user_id, user_cart);
                    }
                )
            }
            /*
            else{
                db.collection("test").find({}).toArray(
                    function (err, docs){
                        if (err) throw err;
                        res.send(get_info(myurl, docs));
                    }
                );
            }
            */
            
        }
    );
})
app.listen(6969)

app.get("/", function(req, res){
    MongoClient.connect("mongodb://localhost:27017", {useUnifiedTopology: true,},
        function (err, client){
            
        }
    );
})
app.listen(6969)
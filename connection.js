var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "password",
  database:"mydb",
});

connection.connect(function (err) {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("MYSQL connected");
});

module.exports=connection;
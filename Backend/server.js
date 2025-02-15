require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const sequelize = require("./dbConnection/db");


app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post("/create", (req, res) => {
       res.json({
         message: "Account created successfully"
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
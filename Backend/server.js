require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const pool = require("./dbConnection/db");
const router = require("./routes/userRoutes");
const redisClient = require("./redisClient");
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to Redis
redisClient.connect();

// Routes to handle user
app.use('/users', router);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
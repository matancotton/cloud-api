const express = require("express");
const cors = require("cors");
require("./db/mongoose");
const userRouter = require("./routers/userRouter");
const fileRouter = require("./routers/fileRouter");
const port = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(fileRouter);

app.use("/", (req, res) => {
    res.send("ok");
});

app.listen(port, () => console.log("The server is running on port", port));

const express = require("express");
const morgan = require("morgan")
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

//internal imports
const userRoutes = require('./modules/user/user.routes')
const { notFoundHandler, errorHandler } = require("./middlewares/errorMiddleware");

//load environment variables
dotenv.config();

const app = express();

//used this to see result in terminal
app.use(morgan("dev"))

connectDB()

//built in middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//middleware to handle cookies and CORS
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    //our Next.js client URL
    credentials: true,
  }),
);

//routing
app.use('/api/user', userRoutes)

//error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});

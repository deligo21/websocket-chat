import dotenv from "dotenv";
dotenv.config({path:'./.env'});
import Servidor from "./models/server.js";

const server = new Servidor();

server.listen();
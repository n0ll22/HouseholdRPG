//Websocket elérési pontja
import { io } from "socket.io-client";
import { apiUrl } from "../Tools/types";
const socket = io(apiUrl);
export default socket;

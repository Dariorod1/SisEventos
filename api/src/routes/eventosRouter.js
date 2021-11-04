const server = require("express").Router();
const upload = require("./../libs/storage");
const {
    getAllEventos,
    getEventoByName,
    createEvento,
    restaEntrada,
    getEventoById
} = require("../controllers/eventoController");
/////////////////////////////////////////////////////////

server.post("/create", upload.single("imagen"), createEvento);
//server.get("/imagen/:name", getImageEmpresa);
//server.patch('/:id', upload.single("imagen"), updateEmpresa)


//////////////////////////////////////////////////////////////////////
server.get("/:id", getEventoById)
server.put("/resta/:id", restaEntrada)
server.get("/", getAllEventos)
server.get("/nombreEmpresa", getEventoByName);


module.exports = server;
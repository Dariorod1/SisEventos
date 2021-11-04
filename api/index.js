const server = require('./src/app.js');
const { conn } = require('./src/db.js');
require("dotenv").config();
const port = process.env.PORT || 3001
    // Syncing all the models at once.
conn.sync({ force: false }).then(() => { //cada vez que esta en false, se borra mi BD y se regenera. Cuando no tengo que cambiarlo más, PONERLO EN FALSE.
    server.listen(port, () => {
        console.log('%s Servidor escuchando en el puerto 3001'); // eslint-disable-line no-console
    });
});
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define("evento", {
        nombre: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fecha: {
            type: DataTypes.DATE,
        },
        hora: {
            type: DataTypes.STRING,
        },
        lugar: {
            type: DataTypes.STRING,
        },
        precioEntrada: {
            type: DataTypes.DECIMAL,
        },
        entradasDisponibles: {
            type: DataTypes.INTEGER,
        }
    });
};
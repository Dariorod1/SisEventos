//'use strict';
const { DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
    const User = sequelize.define("user", {
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "El email tiene que ser un correo valido",
                },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [6, 255],
                    msg: "La contraseña tiene que tener minimamente 6 caracteres",
                },
            },
        },
        profile_pic: {
            type: DataTypes.STRING,
        },
        mp_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        //link de pago
        payment_link: {
            type: DataTypes.STRING,
            validate: {
                isUrl: true,
            },
            allowNull: true,
        },
        //fecha de pago
        order_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        //estado del pago
        order_status: {
            type: DataTypes.ENUM("cancelled", "completed", "processing"),
            allowNull: false,
            defaultValue: "processing",
        },
        reset_code: {
            type: DataTypes.STRING,
            set(value) {
                if (value) {
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(value, salt);
                    this.setDataValue("reset_code", hash);
                }
            },
        },
    });

    User.prototype.compare = function(password, isReset) {
        //compares resetcode when isReset is true
        if (this.password || this.reset_code)
            return bcrypt.compareSync(
                password.toString(),
                isReset ? this.reset_code : this.password
            );
        else return false;
    };
    return User;
};
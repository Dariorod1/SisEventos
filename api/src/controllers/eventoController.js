const { Evento } = require("../db");
const { Op } = require("sequelize");
const path = require("path");
const fs = require("fs");
const mercadopago = require("mercadopago");
const { response } = require("../app");
const { mailPaymentCompleted, mailPaymentInProcess } = require("../mails/mensaje");

mercadopago.configure({
    access_token: "TEST-5296059951015167-110320-c329bb579f48cf40f21c4e5a418aa5f8-232468002",
});
//Funcion para obtener las empresas buscadas por el nombre

const getEventoByName = async(req, res, next) => {
    const nombreEvento = req.query.name.toLocaleLowerCase();
    try {
        let eventoOk = await Evento.findAll({
            where: {
                nombre: {
                    [Op.iLike]: `%${nombreEvento}%`,
                },
            },
        });
        if (!eventoOk) {
            res.send("empresa no encontrada");
        }
        return res.json(eventoOk);
    } catch (err) {
        console.log(err);
        res.status(500).send(next);
    }
};
const getAllEventos = async(req, res, next) => {
    try {
        const eventos = await Evento.findAll();
        res.json(eventos)
    } catch (error) {
        console.log(error);
        res.json({
            data: {},
            message: 'Algo anda mal :('
        });
    }
};
const getEventoById = async(req, res, next) => {
    const { id } = req.params;
    try {
        const eventos = await Evento.findAll({
            where: {
                id: id
            }
        });
        res.json(eventos)
    } catch (error) {
        console.log(error);
        res.json({
            data: {},
            message: 'Algo anda mal :('
        });
    }
};

const createEvento = async(req, res, next) => {
    const { nombre, fecha, hora, lugar, precioEntrada, entradasDisponibles } = req.body;
    if (req.file) {
        var eventos = req.file.filename;
    }
    try {
        let evento = await Evento.create({
            nombre,
            fecha,
            hora,
            lugar,
            precioEntrada,
            entradasDisponibles
        });
        return res.json({ evento: evento, msg: "Evento creado con exito" });
    } catch (error) {
        console.log(error);
        res.status(500).send(next);
    }
};
const restaEntrada = async(req, res, next) => {
    const { cantidad } = req.body;
    const { id } = req.params;
    console.log("id: ", id)
    try {
        let preference = {
            items: [],
            back_urls: {
                success: `http://localhost:3000/eventos/home`,
                failure: `http://localhost:3001/eventos/`,
                pending: `http://localhost:3001/eventos/`,
            },
            auto_return: "approved",
            //notification_url: `${BACK}/premium/mercadoPagoNotifications`,
        };
        let evento = await Evento.findOne({
            where: {
                id: id
            }
        })
        let entradasDisponibles = evento.entradasDisponibles - cantidad

        const eventoUpdate = await Evento.findAll({
            where: {
                id
            }
        })

        if (eventoUpdate.length > 0) {
            preference.items.push({
                title: eventoUpdate[0].dataValues.nombre,
                quantity: parseInt(cantidad),
                unit_price: parseInt(eventoUpdate[0].dataValues.precioEntrada),
            })

            console.log(preference.items)
            eventoUpdate.map(async(evento, cantidad) => {
                await evento.update({
                    entradasDisponibles
                });

            });
            /*return res.json({
                message: "Evento updated",
                data: eventoUpdate
            })*/
            const response = await mercadopago.preferences.create(preference);
            const preferenceId = response.body.id;
            const link = response.body.init_point;
            res.json({ data: eventoUpdate, preferenceId: preferenceId, link: link })
        }

    } catch (error) {
        console.log(error)
    }
}
const mercadoPagoNotifications = async(req, res) => {
    res.sendStatus(200);
    try {
        if (req.query.type === "payment") {
            const payment = await mercadopago.payment.get(req.query["data.id"]);
            switch (payment.body.status) {
                /**************************CASO REJECTED*******************************/
                case "rejected":
                    {
                        const merchant = await mercadopago.merchant_orders.get(
                            payment.body.order.id
                        );
                        const user = await User.findOne({
                            where: { mp_id: merchant.body["preference_id"] },
                        });
                        //cancelled
                        const updatedUser = await user.update({
                            order_status: "cancelled",
                            payment_link: null,
                        });

                        return console.log(
                            "ORDER ACTUALIZADA A CANCELADA-->",
                            JSON.stringify(updatedUser, undefined, 4)
                        );
                    }

                    /**************************CASO APPROVED*******************************/
                case "approved":
                    {
                        const merchant = await mercadopago.merchant_orders.get(
                            payment.body.order.id
                        );
                        const user = await User.findOne({
                            where: { mp_id: merchant.body["preference_id"] },
                        });
                        //con otro medio de pago y es aceptado
                        const updatedUser = await user.update({
                            order_status: "completed",
                            payment_link: null,
                            isPremium: true,
                        });
                        return console.log(
                            "ORDER ACTUALIZADA A COMPLETADA-->",
                            JSON.stringify(updatedUser, undefined, 4),
                            /**AQUI VA ENVIO DE CORREO */
                            mailPaymentCompleted(user)
                        );
                    }
                    /**************************CASO FAILURE*******************************/
                case "failure":
                    {
                        const merchant = await mercadopago.merchant_orders.get(
                            payment.body.order.id
                        );
                        const user = await User.findOne({
                            where: { mp_id: merchant.body["preference_id"] },
                        });
                        const updatedUser = await user.update({
                            order_status: "cancelled",
                            payment_link: null,
                            isPremium: false,
                        });
                        return console.log(
                            "ORDER ACTUALIZADA A CANCELLED-->",
                            JSON.stringify(updatedUser, undefined, 4)
                        );
                    }
                    /**************************CASO PENDING*******************************/
                case "pending":
                    {
                        //este caso es pendiente de pago
                        const merchant = await mercadopago.merchant_orders.get(
                            payment.body.order.id
                        );
                        const user = await User.findOne({
                            where: { mp_id: merchant.body["preference_id"] },
                        });
                        const updatedUser = await user.update({
                            order_status: "processing",
                            isPremium: false,
                        });
                        return console.log(
                            "ORDER ACTUALIZADA A PROCESSING-->",
                            JSON.stringify(updatedUser, undefined, 4),
                            mailPaymentInProcess(user)
                        );
                    }
                case "in_process":
                    {
                        //este caso es pendiente de pago
                        const merchant = await mercadopago.merchant_orders.get(
                            payment.body.order.id
                        );
                        const user = await User.findOne({
                            where: { mp_id: merchant.body["preference_id"] },
                        });
                        const updatedUser = await user.update({
                            order_status: "processing",
                            isPremium: false,
                        });
                        return console.log(
                            "ORDER ACTUALIZADA A PROCESSING-->",
                            JSON.stringify(updatedUser, undefined, 4),
                            mailPaymentInProcess(user)
                        );
                    }
            }
        }
    } catch (err) {
        console.log("error ", err);
    }
};



module.exports = {
    getAllEventos,
    getEventoByName,
    createEvento,
    restaEntrada,
    getEventoById,
    mercadoPagoNotifications
};
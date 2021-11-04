import React, {useEffect, useState} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
const Eventos = () => {
    const [eventos, setEventos] = useState([])
    const getEventos = async() => {
        const events = await axios.get("http://localhost:3001/eventos/")
        const data = events.data
        console.log("la data",data)
        setEventos(data)
        console.log("el eventos", eventos)
    }
    useEffect(() => {
        getEventos()
    },[])
    
    return (
        <div>
            {
                eventos && eventos.map ((e) => (
                   <div>
                    <h1>{e.nombre}</h1>
                    <h2>{e.fecha.slice(0,10)}</h2>
                    <h3>{e.hora}</h3>
                    <h3>{e.lugar}</h3>
                    <h3>${e.precioEntrada}</h3>
                    <Link to = {`/evento/${e.id}`}>
                        <button>Comprar</button>
                    </Link>
                   </div>
                ))
            }
            
        </div>
    )
}

export default Eventos

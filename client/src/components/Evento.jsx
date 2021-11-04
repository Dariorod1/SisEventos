import axios from 'axios'
import React, {useEffect,useState} from 'react'
const FORM_ID = 'payment-form';
const Evento = (props) => {
    console.log("aaa",props.id)
    const [evento,setEvento] = useState([])
    const [cantidad,setCantidad] = useState("")
    const [preferenceId, setPreferenceId] = useState(null);
  const [linkMp, setLinkMp] = useState(null);

    const getEvento = async(id) => {
        const response = await axios.get(`http://localhost:3001/eventos/${props.id}`)
        setEvento(response.data)
        console.log("eee",evento)
    }
    const onChange = (e) => {
        setCantidad(e.target.value)
        console.log("ca",cantidad)
    }
    const onSubmit = async() => {
        const response = await axios.put(`http://localhost:3001/eventos/resta/${props.id}`,{cantidad})
        console.log(response)
        setPreferenceId(response.data.preferenceId)
        setLinkMp(response.data.link)
        console.log("prefid",preferenceId)
        getEvento()
    }
    useEffect(async () =>{
        getEvento()
    },[])


    useEffect(() => {
    if (preferenceId) {
      // con el preferenceId en mano, inyectamos el script de mercadoPago
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://www.mercadopago.cl/integrations/v1/web-payment-checkout.js';
      script.setAttribute('data-preference-id', preferenceId);
    }
  }, [preferenceId]);

    return (
        <div>
            <h1>{evento && evento.map(e => (
                <div>
                    <h1>{e.nombre}</h1>
                    <h2>Precio: ${e.precioEntrada}</h2>
                    <h3>Entradas Disponibles: {e.entradasDisponibles}</h3>
                    <h2>Cantidad a comprar</h2>
                    <input type="text" onChange = {e => onChange(e)} />
                    <button onClick={onSubmit}>Confirmar</button>
                    <a href={linkMp}>
                        <button onClick={onSubmit}>Pagar</button>
                    </a>
                </div>
            ))}</h1>
        </div>
    )
}

export default Evento

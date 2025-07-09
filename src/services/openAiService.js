import OpenAI from "openai";
import config from "../config/env.js";

const client = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

// Servicio de respuesta de ChatGPT optimizado
const openAiService = async (message) => {
    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',  // Modelo más costo-eficiente
            messages: [
                { role: 'system', content: 'Eres un asesor de ventas de la Empresa Grupo Testek Ubicada en Venezuela (https://www.testekndt.net) especialista en productos de ensayos no destructivos (END), análisis de materiales e inspección industrial. Tu tarea es crear propuestas comerciales personalizadas, responder consultas técnicas de clientes industriales y recomendar la solución más adecuada según las necesidades de inspección, calidad y normativas aplicables. Debes redactar tus respuestas con un tono profesional, claro y cercano, explicando siempre los beneficios técnicos y comerciales de cada producto (por ejemplo: ultrasonido industrial, radiografía digital, líquidos penetrantes, análisis metalográfico). Incluye información sobre certificaciones, normativas o estándares si el cliente lo solicita. Ofrece la posibilidad de coordinar una demostración o asesoría técnica. Cuando sea necesario, pide detalles como tipo de pieza, material, volumen de inspección y presupuesto estimado.' },
                { role: 'user', content: message }
            ],
            temperature: 0.5,  
            max_tokens: 250,  
            frequency_penalty: 0.2,  
            presence_penalty: 0.1,  
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error en OpenAIService:', error);
        return "Lo siento, ocurrió un error procesando tu solicitud.";
    }
};


// NO OPTIMIZADO
// const openAiService = async (message) =>{
//     try{
//         const response = await client.chat.completions.create({
//             messages: [{ role: 'system', content: 'Eres un asesor de ventas especialista en productos de ensayos no destructivos (END), análisis de materiales e inspección industrial. Tu tarea es crear propuestas comerciales personalizadas, responder consultas técnicas de clientes industriales y recomendar la solución más adecuada según las necesidades de inspección, calidad y normativas aplicables. Debes redactar tus respuestas con un tono profesional, claro y cercano, explicando siempre los beneficios técnicos y comerciales de cada producto (por ejemplo: ultrasonido industrial, radiografía digital, líquidos penetrantes, análisis metalográfico). Incluye información sobre certificaciones, normativas o estándares si el cliente lo solicita. Ofrece la posibilidad de coordinar una demostración o asesoría técnica. Cuando sea necesario, pide detalles como tipo de pieza, material, volumen de inspección y presupuesto estimado.' }, 
//                     { role: 'user', content: message }],
//             model: 'gpt-4o-mini'
//         });
//         return response.choices[0].message.content;
//     }catch(error){
//         console.error(error);
//     }
// }

export default openAiService;
import whatsappService from './whatsappService.js';
import appendToSheets from './googleSheetsService.js';
import openAiService from './openAiService.js';
import pool from '../config/db.js';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

//import geminiAiService from './geminiAiService.js';

class MessageHandler {

  constructor(){
    this.appointmentState = {};
    this.assistandState = {};
    this.infoState = {};
    this.conversationState = {}; // ⬅️ Aquí guardaremos la última vez que interactuó
  }

  async handleIncomingMessage(message, senderInfo) {
    const now = Date.now();
    const session = this.conversationState[message.from];
    const expiration = 10 * 60 * 1000; // 10 minutos

    if (!session || now - session.lastInteraction > expiration) {
      // Si había sesión activa, cancelamos su timeout y la cerramos
      if (session && session.timeoutId) {
        clearTimeout(session.timeoutId);
        await this.endSession(session.sessionId);
      }

      // Guardar cliente
      await this.saveClient(senderInfo, message.from);

      // Iniciar nueva sesión
      const sessionId = await this.startSession(message.from);

      // Programar cierre automático
      const timeoutId = setTimeout(async () => {
        await this.closeSession(message.from, sessionId);
      }, expiration);

      // Registrar estado en memoria
      this.conversationState[message.from] = {
        lastInteraction: now,
        sessionId,
        timeoutId
      };

      console.log(`Nueva conversación iniciada para ${message.from}`);
      await whatsappService.sendMessage(
        message.from,
        '👋 ¡Hola! Hemos iniciado una nueva conversación. ¿Cómo puedo ayudarte?'
      );
    } else {
      // Sesión activa, actualizamos tiempo y reprogramamos timeout
      clearTimeout(session.timeoutId);
      const timeoutId = setTimeout(async () => {
        await this.closeSession(message.from, session.sessionId);
      }, expiration);

      this.conversationState[message.from] = {
        ...session,
        lastInteraction: now,
        timeoutId
      };
    }


//INICIO DE CONVERSSACION
    if (message?.type === 'text') {
      const incomingMessage = message.text.body.toLowerCase().trim(); // Ultimas dos funciones para colocar en minuscula y quitar espacio

      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } 
      // USAR CON EL SWITCH CASE DE MEDIA
      else if(this.isMediaType(incomingMessage)){
        await this.sendMedia(message.from, incomingMessage);
      // else if(incomingMessage === 'media') {
      //   await this.sendMedia(message.from);
      } else if (this.appointmentState[message.from]) {
        await this.handleAppointmentFlow(message.from, incomingMessage);
      } else if (this.assistandState[message.from]) {
        await this.handleAssistandFlow(message.from, incomingMessage);
      }else if (this.infoState[message.from]) {
        await this.handleInfoFlow(message.from, incomingMessage);
      } else {
        await this.handleMenuOption(message.from, incomingMessage);
      }
      await whatsappService.markAsRead(message.id);
    } else if(message?.type === 'interactive'){
      const option = message?.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

//Guardar la sesión en base de datos
async startSession(to) {
  // Buscar el ID_Cliente por el teléfono
  const [clients] = await pool.query(
    'SELECT ID_Cliente FROM clientes WHERE Telefono = ?',
    [to]
  );

  if (clients.length === 0) {
    console.log('No se encontró el cliente para iniciar sesión.');
    return;
  }

  const idCliente = clients[0].ID_Cliente;

  // Insertar la sesión
  const [result] = await pool.query(
    `INSERT INTO sesiones_chat (ID_Cliente) VALUES (?)`,
    [idCliente]
  );

  console.log(`Sesión iniciada para cliente ${idCliente}`);
  return result.insertId; // Devuelve el ID de la sesión
}
//Este marcará el cierre de la sesión
async endSession(sessionId) {
  // Obtener el teléfono si quieres enviar mensaje
  const [rows] = await pool.query(`
    SELECT c.Telefono
    FROM sesiones_chat s
    JOIN clientes c ON s.ID_Cliente = c.ID_Cliente
    WHERE s.ID_Sesion = ?
  `, [sessionId]);

  await pool.query(
    `UPDATE sesiones_chat SET Fecha_Fin = NOW() WHERE ID_Sesion = ?`,
    [sessionId]
  );

  if (rows.length > 0) {
    const telefono = rows[0].Telefono;
    await whatsappService.sendMessage(
      telefono,
      '✅ La conversación se ha cerrado por inactividad. Cuando gustes, vuelve a escribir.'
    );
  }

  console.log(`Sesión ${sessionId} finalizada.`);
}
async closeSession(phone, sessionId) {
  // Actualizar la sesión en BD
  await this.endSession(sessionId);


  // Eliminar de memoria
  delete this.conversationState[phone];

  console.log(`Sesión cerrada automáticamente por inactividad: ${phone}`);
}




//Obtener y guardar nombre, email, telefono, pais, fecha
  async saveClient(senderInfo, from) {
    const nombre = senderInfo.profile?.name || '';
    const telefono = from; // Número en formato internacional
    const email = null; // Si no tienes email aún
    const pais = this.getCountryFromPhone(from);  // Puedes parsear el prefijo si quieres
    const fecha = new Date();

    // Insertar en la tabla clientes
    try {
      await pool.query(
        `INSERT INTO clientes (Nombre, Email, Telefono, Pais, Fecha_Solicitud)
        VALUES (?, ?, ?, ?, ?)`,
        [nombre, email, telefono, pais, fecha]
      );
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('Cliente ya existe.');
      } else {
        console.error('Error al insertar cliente:', error);
      }
    }
  }

//Obtneer pais
  getCountryFromPhone(phone) {
  try {
    const phoneNumber = parsePhoneNumberFromString (`+${phone}`);
    return phoneNumber.country || 'Desconocido';
  } catch (e) {
    return 'Desconocido';
  }
}


  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes", "buenas", "buenos dias", "que tal", "buenas noches"];
    return greetings.includes(message);
  }

  isMediaType(message){
    const greetings = ['audio', 'image', 'video', 'document'];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    return senderInfo.profile?.name || senderInfo.wa_id;
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const firstName = name.split(' ')[0];   // Extraer primer nombre
    const formatName = firstName.replace(/[^a-zA-Z\s]/g, ''); // Fomatear nombre sin emojis
    const welcomeMessage = `${formatName}, bienvenido a InspectBOT. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

//MENU
  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: { id: 'agendar', title: 'Agendar con asesor' }
      },
      {
        type: 'reply', reply: { id: 'consultar', title: 'Hablar con AI'}
      },
      {
        type: 'reply', reply: { id: 'info', title: 'Consultar producto'}
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

//ACCIONES DEL MENU
  async handleMenuOption(to, option){
    let response;
    switch (option){
      case 'agendar':
        this.appointmentState[to] = { step : 'product'}
        response = "¿En qué producto o servicio estas interesado?";
        break;

      case 'consultar':
        this.assistandState[to] = { step: 'question' };
        response = "Realiza tu consulta";
        break;

      case 'info':
        // Marcar que el usuario va a consultar un producto
        this.infoState[to] = { step: 'awaitingProduct' };
        response = "Por favor, escribe el nombre del producto que deseas consultar.";
        break;
      default:
        response = 'Lo siento, no entendí tu selección, por favor elige una de las opciones del menu.'

    }
    await whatsappService.sendMessage(to, response);
  }

//ACCION al seleccionar - case 'info': buscar producto
  async handleInfoFlow(to, message) {
    const searchTerm = message;

    const products = await this.getProductByName(searchTerm);

    if (products.length > 0) {
      let response = 'Encontré estos productos:\n\n';
      products.forEach((p) => {
        response += `• ${p.Nombre} (${p.Categoria}) - $${p.Precio}\n`;
      });
      await whatsappService.sendMessage(to, response);
       // Registrar la interacción
        await this.saveInterest(to, searchTerm);
    } else {
      await whatsappService.sendMessage(
        to,
        'No encontré productos con ese nombre.'
      );
    }

    // Eliminar estado después de responder
    delete this.infoState[to];
  }

//BUSCAR PRODUCTO EN LA BASE DE DATOS
  async getProductByName(productName) {
    try {
      const [rows] = await pool.query(
        `SELECT p.Nombre, p.Precio, c.Nombre AS Categoria
        FROM productos p
        LEFT JOIN categoria c ON p.ID_Categoria = c.ID_Categoria
        WHERE p.Nombre LIKE ?`,
        [`%${productName}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error al consultar producto:', error);
      return [];
    }
  }


  // CASE para seleccionar el tipo de MEDIA a enviar
  async sendMedia (to, type) {
    try{
      let mediaUrl;      
      let caption;       
      switch(type) {
        case 'audio':          
          mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-audio.aac";          
          caption = "Esto es un audio";          
          break;
        case 'video':          
          mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-video.mp4";          
          caption = "Esto es un video";          
          break;
        case 'document':          
          mediaUrl = "https://academiatestek.net/wp-content/uploads/2025/07/ni_aisi_9021_petroleumrefining.pdf";          
          caption = "Esto es un documento";          
          break;
        case 'image':          
          mediaUrl = "https://s3.amazonaws.com/gndx.dev/medpet-imagen.png";          
          caption = "Esto es una imagen";          
      }
      await whatsappService.sendMediaMessage(to, type, mediaUrl, caption)  
    }catch(e){      
      console.error("Error in SendMedia: ", e)    
    }
  }
//   async sendMedia (to){
//     const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
//     const caption = 'Bienvenida';
//     const type = 'audio';

//     const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
//     const caption = ¡Esto es una Imagen!';
//     const type = 'image';

//     const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
//     const caption = '¡Esto es una video!';
//     const type = 'video';

//     const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
//     const caption = '¡Esto es un PDF!';
//     const type = 'document';
//   }

completeAppointment(to){
  const appointment = this.appointmentState[to];
  delete this.appointmentState[to];

  const userData = [
    to,
    appointment.product,
    appointment.sectorInd,
    appointment.email,
    new Date().toISOString()
  ]

  //Anadir reservas en GoogleSheets
  //appendToSheets(userData);

  // 🟢 Guardar en la base de datos
  this.saveAppointment(to, appointment);

  return `Gracias por agendar con nosotros.
  Resumen de tu solicitud:

  Producto o servicio: ${appointment.product}
  Sector industrial: ${appointment.sectorInd}
  Correo: ${appointment.email}

  Nos pondremos en contacto muy pronto.`
}

  async handleAppointmentFlow(to, message) { // AGENDAR REUNION
    const state = this.appointmentState[to];
    let response;

    switch (state.step){
      case 'product':
        state.product = message;
        state.step = 'sectorInd';
        response = 'Gracias. ¿Me podrías indicar el área industrial en donde trabajas?'
        break;

      case 'sectorInd':
        state.sectorInd = message;
        state.step = 'email';
        response = 'Indícanos tu correo electrónico'
        break;

      case 'email':
        state.email = message;
        response = this.completeAppointment(to);
        break;
    }
     await whatsappService.sendMessage(to, response);
  }

//Guardar en BD - tabla "Reunion"
  async saveAppointment(to, appointment) {
    try {
      // Buscar el cliente por su teléfono
      const [clients] = await pool.query(
        'SELECT ID_Cliente FROM clientes WHERE Telefono = ?',
        [to]
      );

      if (clients.length === 0) {
        console.log('Cliente no encontrado, no se puede guardar la reunión.');
        return;
      }

      const idCliente = clients[0].ID_Cliente;

      // Insertar la reunión
      await pool.query(
        `INSERT INTO reunion 
          (ID_Cliente, Producto, Sector_Industrial, Correo)
        VALUES (?, ?, ?, ?)`,
        [
          idCliente,
          appointment.product,
          appointment.sectorInd,
          appointment.email
        ]
      );

      console.log(`Reunión registrada para el cliente ${idCliente}`);
    } catch (error) {
      console.error('Error al guardar la reunión:', error);
    }
  }

//Guardar info de cliente en "intereses_clientes" cuando pregunté por un producto
  async saveInterest(to, productName) {
    try {
      // Buscar ID_Cliente
      const [clients] = await pool.query(
        'SELECT ID_Cliente FROM clientes WHERE Telefono = ?',
        [to]
      );

      if (clients.length === 0) {
        console.log('Cliente no encontrado.');
        return;
      }

      const idCliente = clients[0].ID_Cliente;

      // Buscar ID_Producto
      const [products] = await pool.query(
        'SELECT ID_Producto FROM productos WHERE Nombre LIKE ? LIMIT 1',
        [`%${productName}%`]
      );

      if (products.length === 0) {
        console.log('Producto no encontrado.');
        return;
      }

      const idProducto = products[0].ID_Producto;

      // Insertar interacción
      await pool.query(
        `INSERT INTO intereses_clientes (ID_Cliente, ID_Producto)
        VALUES (?, ?)`,
        [idCliente, idProducto]
      );

      console.log(`Interacción registrada: Cliente ${idCliente}, Producto ${idProducto}`);
    } catch (error) {
      console.error('Error al registrar interés:', error);
    }
  }

  //Consultar con ChatGPT
  async handleAssistandFlow(to, message) {
    const state = this.assistandState[to];
    let response;

    const menuMessage = "La respuesta fue de tu ayuda?"
    const buttons = [
      { type: 'reply', reply: { id: 'option_4', title: "Si, gracias" } },
      { type: 'reply', reply: { id: 'consultar', title: 'Hacer otra pregunta'}}
    ];

    if (state.step === 'question') {
      response = await openAiService(message);
      //response = await geminiAiService(message);
    }

    delete this.assistandState[to];
    await whatsappService.sendMessage(to, response);
    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

  //Enviar tarjeta de contacto a cliente, seleccionado en el primer menu
  async sendContact(to){
    const contact = {
      addresses: [
        {
          street: "Calle La Escuela, Qta. 944-A, urbanización La Trinidad, Baruta..",
          city: "Caracas.",
          state: "Caracas",
          zip: "1080",
          country: "Venezuela",
          country_code: "VE",
          type: "WORK"
        }
      ],
      emails: [
        {
          email: "kathy.lopez@testekndt.net",
          type: "WORK"
        }
      ],
      name: {
        formatted_name: "Asesor de Ventas VE",
        first_name: "Asesor",
        last_name: "Ventas",
        middle_name: "",
        suffix: "",
        prefix: ""
      },
      org: {
        company: "Servicios de Inspección Testek, C.A",
        department: "Atención al Cliente",
        title: "Representante"
      },
      phones: [
        {
          phone: "+582129443671",
          wa_id: "582129443671",
          type: "WORK"
        }
      ],
      urls: [
        {
          url: "https://www.testekndt.net",
          type: "WORK"
        }
      ]
    };

    await whatsappService.sendContactMessage(to, contact);
  
  }

//CONTADOR mensajes
async incrementMessageCount(phone) {
  const [clients] = await pool.query(
    'SELECT ID_Cliente FROM clientes WHERE Telefono = ?',
    [phone]
  );

  if (clients.length === 0) {
    console.log('Cliente no encontrado.');
    return;
  }

  const idCliente = clients[0].ID_Cliente;

  await pool.query(
    `UPDATE clientes 
     SET Cantidad_Mensajes = Cantidad_Mensajes + 1
     WHERE ID_Cliente = ?`,
    [idCliente]
  );

  console.log(`Mensajes incrementados para cliente ${idCliente}`);
}


}

export default new MessageHandler();
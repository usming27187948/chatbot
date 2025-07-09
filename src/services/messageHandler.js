import whatsappService from './whatsappService.js';
import appendToSheets from './googleSheetsService.js';
import openAiService from './openAiService.js';
//import geminiAiService from './geminiAiService.js';

class MessageHandler {

  constructor(){
    this.appointmentState = {};
    this.assistandState = {};
  }


  async handleIncomingMessage(message, senderInfo) {
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

  isGreeting(message) {
    const greetings = ["hola", "hello", "hi", "buenas tardes"];
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
    const welcomeMessage = `Hola ${formatName}, Bienvenido a InspectBOT. ¿En qué puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una Opción"
    const buttons = [
      {
        type: 'reply', reply: { id: 'agendar', title: 'Agendar con asesor' }
      },
      {
        type: 'reply', reply: { id: 'consultar', title: 'Consultar'}
      },
      {
        type: 'reply', reply: { id: 'info', title: 'Más información'}
      }
    ];

    await whatsappService.sendInteractiveButtons(to, menuMessage, buttons);
  }

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
        response = "Si necesitas informacion detallada, te invitamos a llamar a nuestra linea de atención";
        await this.sendContact(to);
        break
      default:
        response = 'Lo siento, no entendí tu selección, por favor elige una de las opciones del menu.'

    }
    await whatsappService.sendMessage(to, response);
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
    appointment.contactType,
    new Date().toISOString()
  ]

  appendToSheets(userData);

  return `Gracias por agendar tu cita.
  Resumen de tu cita:

  Producto o servicio: ${appointment.product}
  Sector industrial: ${appointment.sectorInd}
  Medio de contacto: ${appointment.contactType}

  Nos pondremos en contacto muy pronto.`
}

  async handleAppointmentFlow(to, message) { // AGENDAR CITA
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
        state.step = 'contactType';
        response = '¿Por cuál medio deseas que te contactemos?'
        break;

      case 'contactType':
        state.contactType = message;
        response = this.completeAppointment(to);
        break;
    }
     await whatsappService.sendMessage(to, response);
  }

  //Consultar con ChatGPT
  async handleAssistandFlow(to, message) {
    const state = this.assistandState[to];
    let response;

    const menuMessage = "La respuesta fue de tu ayuda?"
    const buttons = [
      { type: 'reply', reply: { id: 'option_4', title: "Si, Gracias" } },
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

}

export default new MessageHandler();
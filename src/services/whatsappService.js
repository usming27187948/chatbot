import sendToWhatsApp from "../services/httpRequest/sendToWhatsApp.js";

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      text: { body },
    }
    await sendToWhatsApp(data);
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }
    await sendToWhatsApp(data);
  }

  async sendInteractiveButtons(to, BodyText, buttons) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: BodyText },
        action: {
          buttons: buttons,
        },
      },
    };

    await sendToWhatsApp(data);
  }

  async sendMediaMessage(to, type, mediaUrl, caption){
    try{
      const mediaObject = {};

      switch (type){
        case 'image':
          mediaObject.image = { link: mediaUrl, caption: caption}
          break;
        case 'audio':
          mediaObject.audio = { link: mediaUrl}
          break;
        case 'video':
          mediaObject.video = { link: mediaUrl, caption: caption}
          break;
        case 'document':
          mediaObject.image = { link: mediaUrl, caption: caption, filename: 'documento.pdf'}
          break;
        
        default:
          throw new Error('Not Supported Media Type')
      }

      await axios({
        method: 'POST',
        url: `https://graph.facebook.com/${config.API_VERSION}/${config.BUSINESS_PHONE}/messages`,
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`,
        },
        data: {
          messaging_product: 'whatsapp',
          to,
          type: type,
          ...mediaObject
        },
      });
    } catch (error){
      console.error('Error sending Media Type', error);
    }
  }

  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: 'whatsapp',
      to,
      type: 'contacts',
      contacts: [contact],
    };

    await sendToWhatsApp(data);
  }

}

export default new WhatsAppService();
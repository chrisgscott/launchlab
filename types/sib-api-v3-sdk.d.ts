declare module 'sib-api-v3-sdk' {
  interface Authentication {
    apiKey: string;
  }

  interface ApiClient {
    instance: {
      authentications: {
        'api-key': Authentication;
      };
    };
  }

  interface Contact {
    email: string;
    name?: string;
  }

  interface SendSmtpEmail {
    to: Contact[];
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    sender: Contact;
    templateId?: number;
    params?: Record<string, any>;
    replyTo?: Contact;
  }

  interface TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }

  export const ApiClient: {
    instance: ApiClient['instance'];
  };

  export class TransactionalEmailsApi {
    constructor();
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
  }

  export class SendSmtpEmail {
    constructor();
    to: Contact[];
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    sender: Contact;
    templateId?: number;
    params?: Record<string, any>;
    replyTo?: Contact;
  }
}

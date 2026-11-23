/**
 * Email delivery is behind an interface so a real provider (SES, Postmark, etc.)
 * can replace the console sender without touching auth code.
 */
export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.info(`[email:dev] to=${message.to} subject="${message.subject}"\n${message.text}`);
  }
}

let sender: EmailSender = new ConsoleEmailSender();

export function getEmailSender(): EmailSender {
  return sender;
}

export function setEmailSender(next: EmailSender): void {
  sender = next;
}

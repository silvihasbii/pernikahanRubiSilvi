import { Response } from 'express';

interface Client {
  id: string;
  res: Response;
}

class RealtimeHub {
  private clients: Client[] = [];

  public addClient(id: string, res: Response) {
    this.clients.push({ id, res });

    // Send initial ping
    res.write(`event: connected\ndata: ${JSON.stringify({ time: Date.now(), totalConnected: this.clients.length })}\n\n`);

    res.on('close', () => {
      this.clients = this.clients.filter(c => c.id !== id);
    });
  }

  public broadcast(eventType: string, data: any) {
    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.error(`Failed to send SSE to client ${client.id}:`, err);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.clients.length;
  }
}

export const realtimeHub = new RealtimeHub();

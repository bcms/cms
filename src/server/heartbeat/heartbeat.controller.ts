import { Controller, Get } from 'purple-cheetah';
import { Request } from 'express';

@Controller('/heartbeat')
export class Heartbeat {
  @Get()
  async heartbeat(request: Request): Promise<{ status: string }> {
    return {
      status: 'ONLINE',
    };
  }
}

import { Request } from 'express';
import { Template } from '../template/models/template.model';
import { Entry } from '../entry/models/entry.model';

export enum EventListenerMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export enum EventListenerType {
  TEMPLATE = 'TEMPLATE',
  ENTRY = 'ENTRY',
}

export interface EventListener {
  type: EventListenerType;
  method: EventListenerMethod;
  name?: string;
  handler: (request: Request, data: Template | Entry) => Promise<void>;
}

export class EventManager {
  private static listeners: EventListener[] = [];

  public static addListener(listener: EventListener) {
    EventManager.listeners.push(listener);
  }

  public static getListener(
    type: EventListenerType,
    method: EventListenerMethod,
    name?: string,
  ): EventListener | undefined {
    if (typeof name !== 'undefined') {
      return EventManager.listeners.find(
        e => e.type === type && e.method === method && e.name === name,
      );
    } else {
      return EventManager.listeners.find(
        e => e.type === type && e.method === method,
      );
    }
  }
}

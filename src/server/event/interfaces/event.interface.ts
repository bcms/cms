import { Request } from 'express';
import { Template } from '../../template';
import { Entry } from '../../entry';

/**
 * What will be the source of the event.
 */
export enum EventSource {
  /** Specified Entry method will generate the Event */
  ENTRY = 'ENTRY',
  /** Specified Template method will generate the Event */
  TEMPLATE = 'TEMPLATE',
}

/**
 * On which method will be Event triggered.
 */
export enum EventType {
  GET = 'GET',
  GET_ALL = 'GET_ALL',
  ADD = 'POST',
  UPDATE = 'PUT',
  REMOVE = 'DELETE',
}

export interface EventConfig {
  source: EventSource;
  type: EventType;
  entryId?: string;
  templateId?: string;
}

export interface EventOutputPipe {
  functionName: string;
}

export interface EventOutput {
  payload?: any;
  pipe?: EventOutputPipe;
}

export interface Event {
  name: string;
  config: EventConfig;
  handler: (
    request: Request,
    data: Template | Template[] | Entry | Entry[],
  ) => Promise<EventOutput>;
}

import type { Ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { Observable } from 'lib0/observable';
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import type { Doc } from 'yjs';
import * as decoding from 'lib0/decoding';
import * as encoding from 'lib0/encoding';
import * as syncProtocol from 'y-protocols/sync';
import type { BCMSEntrySync } from '../../types';
import type { JSONContent } from '@tiptap/core';
import {
  BCMSSocketEventName,
  type BCMSSocketSyncChangeEvent,
  BCMSSocketSyncChangeType,
} from '@becomes/cms-sdk/types';

export class BCMSContentProvider extends Observable<string> {
  awareness: Awareness;
  filterBcConns = true;
  shouldConnect = false;
  signalingUrls: string[] = [];
  signalingConns = [];
  maxConns = 1;
  peerOpts = {};
  key = 'test';
  room = null;
  editor?: Ref<Editor | undefined> = undefined;
  unsubs: Array<() => void> = [];

  constructor(
    public channel: string,
    public doc: Doc,
    entrySync: BCMSEntrySync
  ) {
    super();
    this.awareness = new Awareness(doc);
    const handleAwareness = ({ added, updated, removed }: any) => {
      const changedClients = added.concat(updated).concat(removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, 1);
      encoding.writeVarUint8Array(
        encoder,
        encodeAwarenessUpdate(this.awareness, changedClients)
      );
      entrySync.emit.cursorUpdate({
        propPath: this.channel,
        languageCode: '',
        languageIndex: 0,
        data: encoding.toUint8Array(encoder),
      });
    };
    this.awareness.on('update', ({ added, updated, removed }: any) => {
      handleAwareness({ added, updated, removed });
    });
    this.doc = doc;
  }

  async sync(nodes: JSONContent[]): Promise<void> {
    this.unsubs.push(
      window.bcms.sdk.socket.subscribe('YSQ', async (data: any) => {
        if (data.channel === this.channel) {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0);
          syncProtocol.writeSyncStep2(encoder, this.doc);
          const payload = encoding.toUint8Array(encoder);
          window.bcms.sdk.socket.emit('YSS', {
            p: data.p,
            channel: data.channel,
            connId: data.connId,
            data: payload,
          });
        }
      })
    );
    this.unsubs.push(
      window.bcms.sdk.socket.subscribe('YSS', async (data: any) => {
        if (
          data.p === window.location.pathname &&
          data.channel === this.channel
        ) {
          const buffer = new Uint8Array(data.data);
          const decoder = decoding.createDecoder(buffer);
          const encoder = encoding.createEncoder();
          const messageType = decoding.readVarUint(decoder);
          encoding.writeVarUint(encoder, messageType);
          syncProtocol.readSyncMessage(decoder, encoder, this.doc, this);
        }
      })
    );
    this.unsubs.push(
      window.bcms.sdk.socket.subscribe(
        BCMSSocketEventName.SYNC_CHANGE_FSERV,
        async (_event) => {
          const event = _event as BCMSSocketSyncChangeEvent;
          const data = event.data as any;
          if (
            event.p === window.location.pathname &&
            data &&
            data.p === this.channel
          ) {
            if (event.sct === BCMSSocketSyncChangeType.CURSOR) {
              const buffer = new Uint8Array(data.cursor);
              const decoder = decoding.createDecoder(buffer);
              // const encoder = encoding.createEncoder();
              decoding.readVarUint(decoder);
              applyAwarenessUpdate(
                this.awareness,
                decoding.readVarUint8Array(decoder),
                this
              );
            }
          }
        }
      )
    );
    window.bcms.util.throwable(
      async () => {
        return window.bcms.sdk.socket.sync.connections(
          window.location.pathname
        );
      },
      async (cons) => {
        if (cons.length === 1) {
          if (nodes.length > 0) {
            this.editor?.value?.commands.setContent({
              type: 'doc',
              content: nodes,
            });
          }
        } else {
          window.bcms.sdk.socket.emit('YSQ', {
            p: window.location.pathname,
            channel: this.channel,
          });
        }
      }
    );
  }

  destroy(): void {
    this.unsubs.forEach((e) => e());
  }
}

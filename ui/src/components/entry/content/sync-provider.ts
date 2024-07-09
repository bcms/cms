import { applyUpdate, Doc } from 'yjs';
import { ObservableV2 } from 'lib0/observable';
import {
    Awareness,
    encodeAwarenessUpdate,
    applyAwarenessUpdate,
} from 'y-protocols/awareness';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import type { Editor } from '@tiptap/vue-3';
import type { Ref } from 'vue';
import type { EntrySync } from '@thebcms/selfhosted-ui/services/entry-sync';
import type { EntryContentNode } from '@thebcms/selfhosted-backend/entry/models/content';

export class EntryContentSyncProvider extends ObservableV2<string> {
    private unsub: Array<() => void> = [];

    /**
     * Used for cursor updates in prosemirror.
     */
    awareness: Awareness;

    constructor(
        public propPath: string,
        public doc: Doc,
        public editor: () => Ref<Editor | undefined>,
        public entrySync: EntrySync,
    ) {
        super();
        this.awareness = new Awareness(this.doc);
        this.awareness.on('update', ({ added, updated, removed }: any) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, 1);
            encoding.writeVarUint8Array(
                encoder,
                encodeAwarenessUpdate(this.awareness, changedClients),
            );
            const bytes = encoding.toUint8Array(encoder);
            entrySync.emitProseCursorUpdate(this.propPath, Array.from(bytes));
        });
        this.unsub.push(
            this.entrySync.onProseCursorUpdate(this.propPath, async (data) => {
                const buffer = new Uint8Array(data.updates);
                const decoder = decoding.createDecoder(buffer);
                // const encoder = encoding.createEncoder();
                decoding.readVarUint(decoder);
                applyAwarenessUpdate(
                    this.awareness,
                    decoding.readVarUint8Array(decoder),
                    this,
                );
            }),
            this.entrySync.onProseContentUpdate(this.propPath, async (data) => {
                applyUpdate(this.doc, Uint8Array.from(data.updates));
            }),
            this.entrySync.onYSyncRequest(this.propPath, async (data) => {
                const encoder = encoding.createEncoder();
                encoding.writeVarUint(encoder, 0);
                syncProtocol.writeSyncStep2(encoder, this.doc);
                const updates = encoding.toUint8Array(encoder);
                this.entrySync.emitYSyncResponse(
                    this.propPath,
                    data.sourceConnId,
                    true,
                    Array.from(updates),
                );
            }),
        );
        this.doc.on('update', (updates) => {
            this.entrySync.emitProseContentUpdate(
                this.propPath,
                Array.from(updates),
            );
        });
    }

    async sync(nodes: EntryContentNode[]) {
        /**
         * Get YDoc information from the oldest client session if available
         */
        await window.bcms.throwable(async () => {
            await new Promise<void>((resolve, reject) => {
                /**
                 * Listen for the sync response
                 */
                const ySyncResUnsub = this.entrySync.onYSyncResponse(
                    this.propPath,
                    async (data) => {
                        clearTimeout(timeout);
                        if (data.shouldSync) {
                            const buffer = new Uint8Array(data.updates);
                            const decoder = decoding.createDecoder(buffer);
                            const encoder = encoding.createEncoder();
                            const messageType = decoding.readVarUint(decoder);
                            encoding.writeVarUint(encoder, messageType);
                            syncProtocol.readSyncMessage(
                                decoder,
                                encoder,
                                this.doc,
                                this,
                            );
                        } else {
                            this.editor().value?.commands.setContent({
                                type: 'doc',
                                content: nodes,
                            });
                        }
                        ySyncResUnsub();
                        resolve();
                    },
                );
                /**
                 * Prevent infinite waiting
                 */
                const timeout = setTimeout(() => {
                    ySyncResUnsub();
                    reject(
                        Error(
                            this.propPath +
                                ' -> Timeout while waiting for sync' +
                                ' signal',
                        ),
                    );
                }, 2000);
                /**
                 * Request sync data
                 */
                this.entrySync.emitYSyncRequest(this.propPath);
            });
        });
    }

    destroy() {
        this.awareness.destroy();
        super.destroy();
        this.unsub.forEach((e) => e());
        this.unsub = [];
    }
}

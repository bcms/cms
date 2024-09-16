import { SocketManager as _SocketManager } from '@thebcms/selfhosted-backend/_server/modules/socket';
import type {
    SocketEventName,
    SocketEventNamesAndTypes,
} from '@thebcms/selfhosted-backend/socket/events/main';

export class SocketManager {
    static channelEmit<Name extends SocketEventName>(
        channels: string[],
        eventName: Name,
        eventData: SocketEventNamesAndTypes[Name],
        excludeChannels?: string[],
    ) {
        if (!excludeChannels) {
            excludeChannels = [];
        }
        for (const connId in _SocketManager.conns) {
            for (
                let i = 0;
                i < _SocketManager.conns[connId].channels.length;
                i++
            ) {
                const channel = _SocketManager.conns[connId].channels[i];
                if (
                    !excludeChannels.includes(channel) &&
                    channels.includes(channel)
                ) {
                    _SocketManager.conns[connId].emit(eventName, eventData);
                }
            }
        }
    }
}

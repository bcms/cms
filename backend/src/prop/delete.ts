import {
    type Prop,
    PropType,
} from '@bcms/selfhosted-backend/prop/models/main';
import { Repo } from '@bcms/selfhosted-backend/repo';
import { SocketManager } from '@bcms/selfhosted-backend/socket/manager';
import { EventManager } from '@bcms/selfhosted-backend/event/manager';

function filterGroupPointer(groupId: string, props: Prop[]) {
    return props.filter(
        (prop) =>
            !(
                prop.type === PropType.GROUP_POINTER &&
                prop.data.propGroupPointer &&
                prop.data.propGroupPointer._id === groupId
            ),
    );
}

function filterEntryPointer(templateId: string, props: Prop[]) {
    return props.filter(
        (prop) =>
            prop.type === PropType.ENTRY_POINTER &&
            prop.data.propEntryPointer &&
            prop.data.propEntryPointer.find((e) => e.templateId === templateId),
    );
}

export async function removeGroupPointerProps(groupId: string) {
    const groupsToUpdate = await Repo.group.methods.findAllByPropGroupPointer(
        groupId,
    );
    for (let i = 0; i < groupsToUpdate.length; i++) {
        const group = groupsToUpdate[i];
        group.props = filterGroupPointer(groupId, group.props);
        await Repo.group.update(group);
        SocketManager.channelEmit(['global'], 'group', {
            type: 'update',
            groupId: group._id,
        });
        EventManager.trigger('update', 'group', group).catch((err) =>
            console.error(err),
        );
    }
    const widgetsToUpdate = await Repo.widget.methods.findAllByPropGroupPointer(
        groupId,
    );
    for (let i = 0; i < widgetsToUpdate.length; i++) {
        const widget = widgetsToUpdate[i];
        widget.props = filterGroupPointer(groupId, widget.props);
        await Repo.widget.update(widget);
        SocketManager.channelEmit(['global'], 'widget', {
            type: 'update',
            widgetId: widget._id,
        });
        EventManager.trigger('update', 'widgets', widget).catch((err) =>
            console.error(err),
        );
    }
    const templatesToUpdate =
        await Repo.template.methods.findAllByPropGroupPointer(groupId);
    for (let i = 0; i < templatesToUpdate.length; i++) {
        const template = templatesToUpdate[i];
        template.props = filterGroupPointer(groupId, template.props);
        await Repo.template.update(template);
        SocketManager.channelEmit(['global'], 'template', {
            type: 'update',
            templateId: template._id,
        });
        EventManager.trigger('update', 'template', template).catch((err) =>
            console.error(err),
        );
    }
}

export async function removeEntryPointerProps(templateId: string) {
    const groupsToUpdate = await Repo.group.methods.findAllByPropEntryPointer(
        templateId,
    );
    for (let i = 0; i < groupsToUpdate.length; i++) {
        const group = groupsToUpdate[i];
        group.props = filterEntryPointer(templateId, group.props);
        await Repo.group.update(group);
        SocketManager.channelEmit(['global'], 'group', {
            type: 'update',
            groupId: group._id,
        });
        EventManager.trigger('update', 'group', group).catch((err) =>
            console.error(err),
        );
    }
    const widgetsToUpdate = await Repo.widget.methods.findAllByPropEntryPointer(
        templateId,
    );
    for (let i = 0; i < widgetsToUpdate.length; i++) {
        const widget = widgetsToUpdate[i];
        widget.props = filterEntryPointer(templateId, widget.props);
        await Repo.widget.update(widget);
        SocketManager.channelEmit(['global'], 'widget', {
            type: 'update',
            widgetId: widget._id,
        });
        EventManager.trigger('update', 'widgets', widget).catch((err) =>
            console.error(err),
        );
    }
    const templatesToUpdate =
        await Repo.template.methods.findAllByPropEntryPointer(templateId);
    for (let i = 0; i < templatesToUpdate.length; i++) {
        const template = templatesToUpdate[i];
        template.props = filterEntryPointer(templateId, template.props);
        await Repo.template.update(template);
        SocketManager.channelEmit(['global'], 'template', {
            type: 'update',
            templateId: template._id,
        });
        EventManager.trigger('update', 'template', template).catch((err) =>
            console.error(err),
        );
    }
}

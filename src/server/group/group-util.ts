import { Group } from './models/group.modal';
import {
  Prop,
  PropType,
  PropGroupPointer,
  PropGroupPointerArray,
} from '../prop/interfaces/prop.interface';
import { EntryService } from '../entry';
import { Logger } from 'purple-cheetah';
import { PropChanges } from '../prop/interfaces/prop-changes.interface';

export class GroupUtil {
  public static updateGroupPointer(
    props: Prop[],
    group: Group,
  ): {
    changes: boolean;
    props: Prop[];
  } {
    let changes: boolean = false;
    for (const i in props) {
      const prop = props[i];
      if (prop.type === PropType.GROUP_POINTER) {
        prop.value = prop.value as PropGroupPointer;
        if (prop.value._id === group._id.toHexString()) {
          prop.value.props = group.props;
          changes = true;
        } else {
          const result = GroupUtil.updateGroupPointer(prop.value.props, group);
          if (result.changes === true) {
            prop.value.props = result.props;
            changes = true;
          }
        }
      } else if (prop.type === PropType.GROUP_POINTER_ARRAY) {
        prop.value = prop.value as PropGroupPointerArray;
        for (const j in prop.value) {
          if (prop.value[j]._id === group._id.toHexString()) {
            prop.value[j].props = group.props;
            changes = true;
          } else {
            const result = GroupUtil.updateGroupPointer(
              prop.value[j].props,
              group,
            );
            if (result.changes === true) {
              prop.value[j].props = result.props;
              changes = true;
            }
          }
        }
      }
    }
    return {
      changes,
      props,
    };
  }

  public static nameEncode(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
  }

  public static async updateEntriesWithNewGroupData(
    service: EntryService,
    logger: Logger,
    changes: PropChanges[],
    groupId: string,
  ) {
    const recursive = (props: Prop[]) => {
      let forUpdate: boolean = false;
      props.forEach(prop => {
        if (prop.type === PropType.GROUP_POINTER) {
          prop.value = prop.value as PropGroupPointer;
          if (prop.value._id === groupId) {
            changes.forEach(change => {
              prop.value = prop.value as PropGroupPointer;
              if (change.remove === true) {
                prop.value.props = prop.value.props.filter(
                  p => p.name !== change.name.old,
                );
              } else {
                prop.value.props.forEach(p => {
                  if (p.name === change.name.old) {
                    p.name = change.name.new;
                    p.required = change.required;
                    forUpdate = true;
                  }
                });
              }
            });
          } else {
            forUpdate = recursive(prop.value.props);
          }
        }
      });
      return forUpdate;
    };
    const entries = await service.findAll();
    entries.forEach(async entry => {
      entry.content.forEach(async content => {
        const forUpdate = recursive(content.props);
        if (forUpdate === true) {
          const updateEntryResult = await service.update(entry);
          if (updateEntryResult === false) {
            logger.error('updateEntriesWithNewGroupData', {
              msg: `Failed to update Entry '${entry._id.toHexString()}' with Group change.`,
              changes,
            });
          }
        }
      });
    });
  }
}

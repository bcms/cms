import { Group } from './models/group.modal';
import {
  Prop,
  PropType,
  PropGroupPointer,
} from '../prop/interfaces/prop.interface';

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
        prop.value = prop.value as PropGroupPointer[];
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
}

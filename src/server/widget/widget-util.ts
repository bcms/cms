import { Entry, EntryService } from '../entry';
import { Logger } from 'purple-cheetah';
import {
  PropType,
  PropQuill,
  PropQuillContentType,
  PropQuillContentValueWidget,
} from '../prop';
import { PropChanges } from '../prop/interfaces/prop-changes.interface';
import { CacheControl } from '../cache-control';

export class WidgetUtil {
  public static nameEncode(name: string): string {
    return name
      .toLowerCase()
      .replace(/ /g, '_')
      .replace(/-/g, '_')
      .replace(/[^0-9a-z_-_]+/g, '');
  }

  public static async updateEntriesWithNewWidgetData(
    service: EntryService,
    logger: Logger,
    oldName: string,
    newName?: string,
    changes?: PropChanges[],
  ) {
    if (!oldName && !newName && !changes) {
      return;
    }
    const entries = await service.findAll();
    entries.forEach(async (entry) => {
      entry.content.forEach(async (content) => {
        content.props.forEach(async (prop) => {
          if (prop.type === PropType.QUILL) {
            prop.value = prop.value as PropQuill;
            prop.value.content.forEach(async (cont) => {
              if (cont.type === PropQuillContentType.WIDGET) {
                cont.value = cont.value as PropQuillContentValueWidget;
                if (cont.value.name === oldName) {
                  if (changes) {
                    changes.forEach(async (change) => {
                      cont.value = cont.value as PropQuillContentValueWidget;
                      if (change.remove === true) {
                        cont.value.props = cont.value.props.filter(
                          (e) => e.name !== change.name.old,
                        );
                        const updateEntryResult = await service.update(entry);
                        if (updateEntryResult === false) {
                          logger.error('updateEntriesWithNewWidgetData', {
                            msg: `Failed to update Entry '${entry._id.toHexString()}' with Widget change.`,
                            change,
                          });
                        }
                      } else {
                        cont.value.props.forEach(async (p) => {
                          if (p.name === change.name.old) {
                            p.name = change.name.new;
                            p.required = change.required;
                            const updateEntryResult = await service.update(
                              entry,
                            );
                            if (updateEntryResult === false) {
                              logger.error('updateEntriesWithNewWidgetData', {
                                msg: `Failed to update Entry '${entry._id.toHexString()}' with Widget change.`,
                                change,
                              });
                            }
                          }
                        });
                      }
                    });
                  } else {
                    cont.value.name = newName;
                    const updateEntryResult = await service.update(entry);
                    if (updateEntryResult === false) {
                      logger.error(
                        'updateEntriesWithNewWidgetData',
                        `Failed to update Entry '${entry._id.toHexString()}' with new Widget name '${newName}'.`,
                      );
                    }
                  }
                }
              }
            });
          }
        });
      });
    });
  }

  public static async addNewPropsToWidgetInEntries(
    entryService: EntryService,
    logger: Logger,
    change: PropChanges,
    widgetId: string,
  ) {
    // const entries = await entryService.findAll();
    const entries = await CacheControl.Entry.findAll();
    entries.forEach(async (entry) => {
      entry.content.forEach(async (content) => {
        content.props.forEach(async (prop) => {
          if (prop.type === PropType.QUILL) {
            prop.value = prop.value as PropQuill;
            prop.value.content.forEach(async (cont) => {
              if (cont.type === PropQuillContentType.WIDGET) {
                logger.info('', 'H1');
                cont.value = cont.value as PropQuillContentValueWidget;
                if (cont.value._id === widgetId) {
                  logger.info('', 'H2');
                  cont.value.props.push(change.add);
                  // const updateEntryResult = await entryService.update(
                  //   entry,
                  // );
                  const updateEntryResult = await CacheControl.Entry.update(
                    entry,
                  );
                  if (updateEntryResult === false) {
                    logger.error('updateEntriesWithNewWidgetData', {
                      msg: `Failed to update Entry '${entry._id.toHexString()}' with new Widget prop.`,
                      change,
                    });
                  }
                }
              }
            });
          }
        });
      });
    });
  }
}

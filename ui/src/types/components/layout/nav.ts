export interface BCMSNavItemType {
  id?: string;
  parentId?: string;
  type: 'parent' | 'child';
  draggableType?: 'template' | 'organizer';
  name: string;
  visible: boolean;
  selected: boolean;
  ignoreSelected?: boolean;
  icon?: string;
  href?: string;
  onClick?: string | ((event?: Event) => void);
  children?: BCMSNavItemType[];
}

export interface BCMSNavItemMergeEvent {
  src: BCMSNavItemType;
  targetId: string;
}

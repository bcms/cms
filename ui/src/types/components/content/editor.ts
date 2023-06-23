import type { BCMSMedia } from '@becomes/cms-sdk/types';
import type { CommandProps, Range } from '@tiptap/core';

export interface SlashCommandData {
  editor: CommandProps;
  range: Range;
}

export interface SlashCommandItem {
  id: string;
  title: string;
  widget?: boolean;
  icon: string;
  image?: BCMSMedia;
  type?: 'primary';
  command: (data: SlashCommandData) => void;
}

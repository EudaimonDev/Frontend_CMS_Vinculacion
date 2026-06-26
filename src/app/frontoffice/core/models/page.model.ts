import { Block } from './block.model';

export interface Page {
  id: string;
  slug: string;
  title: string;
  blocks: Block[];
}

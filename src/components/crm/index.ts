/**
 * The product component kit — lifted from the CRM reference's canonical
 * People/Deals surfaces. Every logged-in page composes from these; see
 * design.md.
 */

export { CrmPageHeader } from './page-header';
export {
  StatStrip,
  StatCell,
  Stat,
  StatEmpty,
  StatMeta,
  StatStripSkeleton,
} from './stat-strip';
export { SectionHead } from './section-head';
export { TabStrip } from './tab-strip';
export type { TabItem } from './tab-strip';
export { Toolbar, ToolbarSearch, ToolbarActions, FilterSelect } from './toolbar';
export {
  RecordList,
  RecordRow,
  RowAction,
  RowPill,
  RecordListSkeleton,
  RowSelect,
  ROW_CONTROL,
} from './record-list';

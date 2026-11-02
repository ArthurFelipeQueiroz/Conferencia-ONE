import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';
export function planRoster(items: any[], existing: any[], previousMapping?: any[]): any;
export function snapshotDatabase(db: D1Database): Promise<any>;
export function loadSnapshot(db: D1Database, id: string): Promise<any>;
export function exportSnapshot(db: D1Database, id: string): Promise<string>;
export function reconciliationStatements(db: D1Database, plan: any, snapshot: any, locked: boolean, runId: string, actorId: number): D1PreparedStatement[];

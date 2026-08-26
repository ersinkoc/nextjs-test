import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle,
  Trash2,
  Edit3,
  Table as TableIcon,
  Layers,
  Database,
  Play,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Terminal,
  FileCode,
  ShieldAlert,
  GitFork,
  HelpCircle,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  Sliders,
  FolderEdit,
  X
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';
import { DbFullSchema, TableSchemaDetail, ColumnInfo } from '../types';

interface SqliteSchemaModifierProps {
  onNavigateToQuery?: (sql: string) => void;
  onNavigateToTables?: (tableName: string) => void;
  onNavigateToEr?: (tableName?: string) => void;
  onRefreshStatus?: () => void;
}

type OperationType =
  | 'add-column'
  | 'drop-column'
  | 'rename-column'
  | 'rename-table'
  | 'create-table'
  | 'drop-table';

const DATA_TYPES = [
  { value: 'TEXT', label: 'TEXT (String, JSON, UUID, ISO Dates)', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { value: 'INTEGER', label: 'INTEGER (Numbers, Booleans 0/1, Unix TS)', color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30' },
  { value: 'REAL', label: 'REAL (Floating Point, Latency, Decimals)', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  { value: 'BLOB', label: 'BLOB (Binary Data, Buffers, Hashes)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { value: 'BOOLEAN', label: 'BOOLEAN (Treated as INTEGER 0/1)', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  { value: 'DATETIME', label: 'DATETIME (ISO8601 String)', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30' },
  { value: 'NUMERIC', label: 'NUMERIC (Dynamic / Flexible affinity)', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
];

const DEFAULT_VALUE_PRESETS = [
  { label: '0', value: '0' },
  { label: '1', value: '1' },
  { label: "'active'", value: "'active'" },
  { label: "'pending'", value: "'pending'" },
  { label: "CURRENT_TIMESTAMP", value: "CURRENT_TIMESTAMP" },
  { label: "'{}' (JSON)", value: "'{}'" },
  { label: "'' (Empty)", value: "''" },
  { label: "NULL", value: "NULL" },
];

export const SqliteSchemaModifier: React.FC<SqliteSchemaModifierProps> = ({
  onNavigateToQuery,
  onNavigateToTables,
  onNavigateToEr,
  onRefreshStatus,
}) => {
  const { t } = useI18n();

  // Schema state
  const [schema, setSchema] = useState<DbFullSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTableName, setSelectedTableName] = useState<string>('arena_test_runs');
  const [activeOp, setActiveOp] = useState<OperationType>('add-column');

  // Form State: Add Column
  const [newColName, setNewColName] = useState<string>('');
  const [newColType, setNewColType] = useState<string>('TEXT');
  const [newColNotNull, setNewColNotNull] = useState<boolean>(false);
  const [newColDefault, setNewColDefault] = useState<string>('');

  // Form State: Drop Column
  const [dropColName, setDropColName] = useState<string>('');
  const [dropColConfirmed, setDropColConfirmed] = useState<boolean>(false);

  // Form State: Rename Column
  const [renameColOld, setRenameColOld] = useState<string>('');
  const [renameColNew, setRenameColNew] = useState<string>('');

  // Form State: Rename Table
  const [renameTableNew, setRenameTableNew] = useState<string>('');

  // Form State: Create Table
  const [createTableName, setCreateTableName] = useState<string>('');
  const [createTableCols, setCreateTableCols] = useState<
    Array<{ name: string; type: string; pk: boolean; notNull: boolean; defaultValue: string }>
  >([
    { name: 'id', type: 'TEXT', pk: true, notNull: true, defaultValue: '' },
    { name: 'name', type: 'TEXT', pk: false, notNull: true, defaultValue: '' },
    { name: 'created_at', type: 'TEXT', pk: false, notNull: true, defaultValue: 'CURRENT_TIMESTAMP' },
  ]);

  // Form State: Drop Table
  const [dropTableConfirmed, setDropTableConfirmed] = useState<boolean>(false);

  // Execution & Action Feedback
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error';
    message: string;
    sql?: string;
    executionTimeMs?: number;
  } | null>(null);

  // Fetch full schema details
  const fetchSchema = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sqlite/schema');
      if (res.ok) {
        const data: DbFullSchema = await res.json();
        setSchema(data);
        if (data.tables.length > 0) {
          // If current selected table is not in list, pick first
          if (!data.tables.some((t) => t.name === selectedTableName)) {
            setSelectedTableName(data.tables[0].name);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load schema for modifier:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

  // Selected table detail object
  const currentTable = useMemo(() => {
    if (!schema) return null;
    return schema.tables.find((t) => t.name === selectedTableName) || schema.tables[0] || null;
  }, [schema, selectedTableName]);

  // Update default dropdown options when selected table changes
  useEffect(() => {
    if (currentTable && currentTable.columns.length > 0) {
      // Pick first non-PK column for drop default if available, or first col
      const nonPk = currentTable.columns.find((c) => !c.pk);
      const colToSelect = nonPk ? nonPk.name : currentTable.columns[0].name;
      setDropColName(colToSelect);
      setRenameColOld(colToSelect);
      setRenameColNew(`${colToSelect}_renamed`);
    }
    setDropColConfirmed(false);
    setDropTableConfirmed(false);
  }, [selectedTableName, currentTable]);

  // Generate dynamic SQL based on current operation
  const generatedSql = useMemo(() => {
    if (!selectedTableName && activeOp !== 'create-table') return '-- Select a table to proceed';

    switch (activeOp) {
      case 'add-column': {
        const col = newColName.trim() || 'new_column_name';
        let sql = `ALTER TABLE "${selectedTableName}" ADD COLUMN "${col}" ${newColType}`;
        if (newColNotNull) sql += ' NOT NULL';
        if (newColDefault.trim()) {
          const dflt = newColDefault.trim();
          sql += ` DEFAULT ${dflt}`;
        }
        return sql + ';';
      }

      case 'drop-column': {
        const col = dropColName || (currentTable?.columns[0]?.name ?? 'column_to_drop');
        return `ALTER TABLE "${selectedTableName}" DROP COLUMN "${col}";`;
      }

      case 'rename-column': {
        const oldCol = renameColOld || (currentTable?.columns[0]?.name ?? 'old_column');
        const newCol = renameColNew.trim() || 'new_column';
        return `ALTER TABLE "${selectedTableName}" RENAME COLUMN "${oldCol}" TO "${newCol}";`;
      }

      case 'rename-table': {
        const newTbl = renameTableNew.trim() || `${selectedTableName}_renamed`;
        return `ALTER TABLE "${selectedTableName}" RENAME TO "${newTbl}";`;
      }

      case 'create-table': {
        const tbl = createTableName.trim() || 'new_custom_table';
        const colsSql = createTableCols
          .map((col) => {
            let line = `  "${col.name.trim() || 'col'}" ${col.type}`;
            if (col.pk) line += ' PRIMARY KEY';
            if (col.notNull && !col.pk) line += ' NOT NULL';
            if (col.defaultValue.trim()) line += ` DEFAULT ${col.defaultValue.trim()}`;
            return line;
          })
          .join(',\n');
        return `CREATE TABLE IF NOT EXISTS "${tbl}" (\n${colsSql}\n);`;
      }

      case 'drop-table': {
        return `DROP TABLE IF EXISTS "${selectedTableName}";`;
      }

      default:
        return '-- Select an operation';
    }
  }, [
    activeOp,
    selectedTableName,
    newColName,
    newColType,
    newColNotNull,
    newColDefault,
    dropColName,
    renameColOld,
    renameColNew,
    renameTableNew,
    createTableName,
    createTableCols,
    currentTable,
  ]);

  // Execute Schema Modification DDL
  const handleExecute = async () => {
    if (!generatedSql || generatedSql.startsWith('--')) return;

    setIsExecuting(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/sqlite/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: generatedSql }),
      });

      const data = await res.json();

      if (data.success) {
        setActionNotice({
          type: 'success',
          message: t('sqlite.modifierSuccess'),
          sql: generatedSql,
          executionTimeMs: data.executionTimeMs,
        });

        // Reset form inputs
        if (activeOp === 'add-column') {
          setNewColName('');
          setNewColDefault('');
          setNewColNotNull(false);
        } else if (activeOp === 'rename-table' && renameTableNew.trim()) {
          setSelectedTableName(renameTableNew.trim());
          setRenameTableNew('');
        } else if (activeOp === 'create-table' && createTableName.trim()) {
          setSelectedTableName(createTableName.trim());
          setCreateTableName('');
        }

        // Refresh full schema & global status
        await fetchSchema();
        if (onRefreshStatus) onRefreshStatus();
      } else {
        setActionNotice({
          type: 'error',
          message: data.error || 'Failed to execute schema modification.',
          sql: generatedSql,
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Network error executing schema modification.',
        sql: generatedSql,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Copy Generated SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(generatedSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Quick Preset Helper for Add Column
  const handleApplyPreset = (preset: { name: string; type: string; notNull: boolean; dflt: string }) => {
    setActiveOp('add-column');
    setNewColName(preset.name);
    setNewColType(preset.type);
    setNewColNotNull(preset.notNull);
    setNewColDefault(preset.dflt);
  };

  // Check if drop column is a Primary Key
  const isDropColPk = useMemo(() => {
    if (!currentTable || !dropColName) return false;
    return currentTable.columns.some((c) => c.name === dropColName && c.pk);
  }, [currentTable, dropColName]);

  // Check if drop column is used in Foreign Keys
  const isDropColFk = useMemo(() => {
    if (!currentTable || !dropColName) return false;
    return currentTable.foreignKeys.some((fk) => fk.fromColumn === dropColName);
  }, [currentTable, dropColName]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-black text-emerald-400 border border-zinc-800 flex items-center justify-center shadow-xs">
                <Sliders size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t('sqlite.modifierTitle')}
              </h2>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Sparkles size={12} />
                {t('sqlite.modifierBadge')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                SQLite 3.35+ Native Engine
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
              {t('sqlite.modifierDesc')}
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="modifier-refresh-btn"
              onClick={fetchSchema}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-semibold transition-all border border-zinc-200 dark:border-neutral-700 cursor-pointer"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin text-emerald-500' : 'text-emerald-500'} />
              <span>{isLoading ? 'Loading...' : t('sqlite.refreshSchema')}</span>
            </button>

            {onNavigateToEr && (
              <button
                onClick={() => onNavigateToEr(selectedTableName)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                <GitFork size={14} />
                <span>{t('sqlite.viewInEr')}</span>
              </button>
            )}

            {onNavigateToTables && (
              <button
                onClick={() => onNavigateToTables(selectedTableName)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
              >
                <TableIcon size={14} />
                <span>{t('sqlite.viewInBrowser')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Notice Toast */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-5 p-4 rounded-2xl flex items-start justify-between gap-3 text-xs font-mono ${
                actionNotice.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/30'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {actionNotice.type === 'success' ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">{actionNotice.message}</div>
                  {actionNotice.sql && (
                    <div className="text-[11px] opacity-85 font-mono break-all">{actionNotice.sql}</div>
                  )}
                  {actionNotice.executionTimeMs !== undefined && (
                    <div className="text-[10px] opacity-75">
                      Executed in <strong>{actionNotice.executionTimeMs}ms</strong>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActionNotice(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main 2-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Operation Tabs & Interactive Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Operation Selector Pill Bar */}
          <div className="p-2 rounded-2xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            <button
              id="modifier-op-add-col"
              onClick={() => setActiveOp('add-column')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'add-column'
                  ? 'bg-emerald-500 text-black shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <PlusCircle size={14} />
              <span>{t('sqlite.opAddColumn')}</span>
            </button>

            <button
              id="modifier-op-drop-col"
              onClick={() => setActiveOp('drop-column')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'drop-column'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Trash2 size={14} />
              <span>{t('sqlite.opDropColumn')}</span>
            </button>

            <button
              id="modifier-op-rename-col"
              onClick={() => setActiveOp('rename-column')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'rename-column'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Edit3 size={14} />
              <span>{t('sqlite.opRenameColumn')}</span>
            </button>

            <button
              id="modifier-op-rename-tbl"
              onClick={() => setActiveOp('rename-table')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'rename-table'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <FolderEdit size={14} />
              <span>{t('sqlite.opRenameTable')}</span>
            </button>

            <button
              id="modifier-op-create-tbl"
              onClick={() => setActiveOp('create-table')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'create-table'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Layers size={14} />
              <span>{t('sqlite.opCreateTable')}</span>
            </button>

            <button
              id="modifier-op-drop-tbl"
              onClick={() => setActiveOp('drop-table')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeOp === 'drop-table'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-neutral-400 hover:bg-zinc-100 dark:hover:bg-neutral-800'
              }`}
            >
              <AlertTriangle size={14} />
              <span>{t('sqlite.opDropTable')}</span>
            </button>
          </div>

          {/* Form Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-5">
            {/* Table Selection Dropdown (For all ops except create-table) */}
            {activeOp !== 'create-table' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300 flex items-center justify-between">
                  <span>{t('sqlite.targetTable')}</span>
                  <span className="text-[11px] text-zinc-400 font-normal">
                    {currentTable?.columns.length || 0} {t('sqlite.columnsCount')}, {currentTable?.rowCount || 0} rows
                  </span>
                </label>
                <div className="relative">
                  <select
                    id="modifier-target-table-select"
                    value={selectedTableName}
                    onChange={(e) => setSelectedTableName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {schema?.tables.map((t) => (
                      <option key={t.name} value={t.name}>
                        {t.name} ({t.columns.length} cols, {t.rowCount} rows)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* OP 1: ADD COLUMN FORM */}
            {activeOp === 'add-column' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      {t('sqlite.columnName')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="modifier-add-col-name"
                      value={newColName}
                      onChange={(e) => setNewColName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="e.g. is_archived, priority, rating"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] font-mono text-zinc-400">Letters, numbers, underscores only</span>
                  </div>

                  {/* Column Data Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      {t('sqlite.columnType')}
                    </label>
                    <select
                      id="modifier-add-col-type"
                      value={newColType}
                      onChange={(e) => setNewColType(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {DATA_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Default Value & NOT NULL Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      {t('sqlite.columnDefault')}
                    </label>
                    <input
                      type="text"
                      id="modifier-add-col-default"
                      value={newColDefault}
                      onChange={(e) => setNewColDefault(e.target.value)}
                      placeholder="e.g. 0, 'active', CURRENT_TIMESTAMP"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />

                    {/* Quick Default Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {DEFAULT_VALUE_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setNewColDefault(p.value)}
                          className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-neutral-800 hover:bg-emerald-500/20 text-[10px] font-mono text-zinc-600 dark:text-neutral-400 hover:text-emerald-500 transition-colors cursor-pointer"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2 text-xs font-mono font-semibold text-zinc-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newColNotNull}
                        onChange={(e) => setNewColNotNull(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                      />
                      <span>{t('sqlite.columnNotNull')}</span>
                    </label>
                    <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
                      Note: SQLite requires a DEFAULT value when adding a NOT NULL column to a table with existing records.
                    </p>
                  </div>
                </div>

                {/* Quick Column Presets */}
                <div className="pt-2 border-t border-zinc-200/80 dark:border-neutral-800 space-y-2">
                  <span className="text-xs font-mono font-bold text-zinc-600 dark:text-neutral-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>{t('sqlite.presetsQuickAdd')}</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'is_deleted',
                          type: 'INTEGER',
                          notNull: true,
                          dflt: '0',
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-neutral-800 text-left text-xs font-mono text-zinc-700 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('sqlite.presetSoftDelete')}</span>
                      <ChevronRight size={13} className="text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'updated_at',
                          type: 'TEXT',
                          notNull: true,
                          dflt: 'CURRENT_TIMESTAMP',
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-neutral-800 text-left text-xs font-mono text-zinc-700 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('sqlite.presetUpdatedAt')}</span>
                      <ChevronRight size={13} className="text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'status',
                          type: 'TEXT',
                          notNull: true,
                          dflt: "'active'",
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-neutral-800 text-left text-xs font-mono text-zinc-700 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('sqlite.presetStatus')}</span>
                      <ChevronRight size={13} className="text-zinc-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPreset({
                          name: 'metadata_json',
                          type: 'TEXT',
                          notNull: false,
                          dflt: "'{}'",
                        })
                      }
                      className="p-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 hover:bg-zinc-100 dark:hover:bg-neutral-800 text-left text-xs font-mono text-zinc-700 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-800 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{t('sqlite.presetMetadata')}</span>
                      <ChevronRight size={13} className="text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OP 2: DROP COLUMN FORM */}
            {activeOp === 'drop-column' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                    {t('sqlite.selectColumnToDrop')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="modifier-drop-col-select"
                    value={dropColName}
                    onChange={(e) => setDropColName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {currentTable?.columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.type}) {c.pk ? '🔑 PRIMARY KEY' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Key / FK Warning */}
                {isDropColPk && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-mono space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldAlert size={15} />
                      <span>Primary Key Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Column <strong>"{dropColName}"</strong> is marked as a PRIMARY KEY. SQLite might reject dropping primary key columns directly without recreating the table.
                    </p>
                  </div>
                )}

                {isDropColFk && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle size={15} />
                      <span>Foreign Key Constraint Warning</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Column <strong>"{dropColName}"</strong> is part of a Foreign Key relationship.
                    </p>
                  </div>
                )}

                {/* Safety Warning Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-start gap-2 text-xs font-mono text-zinc-600 dark:text-neutral-400">
                    <Info size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{t('sqlite.dropColumnWarning')}</span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      id="modifier-drop-col-confirm"
                      checked={dropColConfirmed}
                      onChange={(e) => setDropColConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>{t('sqlite.dropColumnConfirm')}</span>
                  </label>
                </div>
              </div>
            )}

            {/* OP 3: RENAME COLUMN FORM */}
            {activeOp === 'rename-column' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      {t('sqlite.selectColumnToRename')}
                    </label>
                    <select
                      value={renameColOld}
                      onChange={(e) => {
                        setRenameColOld(e.target.value);
                        setRenameColNew(`${e.target.value}_new`);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      {currentTable?.columns.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      {t('sqlite.newColumnName')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={renameColNew}
                      onChange={(e) => setRenameColNew(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                      placeholder="e.g. updated_column_name"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OP 4: RENAME TABLE FORM */}
            {activeOp === 'rename-table' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                    {t('sqlite.newTableName')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={renameTableNew}
                    onChange={(e) => setRenameTableNew(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder={`e.g. ${selectedTableName}_v2`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] font-mono text-zinc-400">
                    All existing table records and indexes will be preserved under the new name.
                  </span>
                </div>
              </div>
            )}

            {/* OP 5: CREATE TABLE FORM */}
            {activeOp === 'create-table' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                    Table Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createTableName}
                    onChange={(e) => setCreateTableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="e.g. audit_logs, user_preferences, analytics"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Column Builder List */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-700 dark:text-neutral-300">
                      Table Schema Columns ({createTableCols.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCreateTableCols((prev) => [
                          ...prev,
                          { name: `col_${prev.length + 1}`, type: 'TEXT', pk: false, notNull: false, defaultValue: '' },
                        ])
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[11px] font-mono font-bold transition-colors cursor-pointer"
                    >
                      <PlusCircle size={12} />
                      <span>Add Column Field</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {createTableCols.map((col, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 grid grid-cols-12 gap-2 items-center text-xs font-mono"
                      >
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                              setCreateTableCols((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, name: val } : c))
                              );
                            }}
                            placeholder="col_name"
                            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-700 text-xs font-mono"
                          />
                        </div>

                        <div className="col-span-3">
                          <select
                            value={col.type}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCreateTableCols((prev) =>
                                prev.map((c, i) => (i === idx ? { ...c, type: val } : c))
                              );
                            }}
                            className="w-full px-2 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-700 text-xs font-mono"
                          >
                            {DATA_TYPES.map((dt) => (
                              <option key={dt.value} value={dt.value}>
                                {dt.value}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-2 flex items-center justify-center">
                          <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.pk}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCreateTableCols((prev) =>
                                  prev.map((c, i) => (i === idx ? { ...c, pk: val } : c))
                                );
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600"
                            />
                            <span>PK</span>
                          </label>
                        </div>

                        <div className="col-span-2 flex items-center justify-center">
                          <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.notNull}
                              onChange={(e) => {
                                const val = e.target.checked;
                                setCreateTableCols((prev) =>
                                  prev.map((c, i) => (i === idx ? { ...c, notNull: val } : c))
                                );
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600"
                            />
                            <span>NOT NULL</span>
                          </label>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          {createTableCols.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setCreateTableCols((prev) => prev.filter((_, i) => i !== idx))
                              }
                              className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* OP 6: DROP TABLE FORM */}
            {activeOp === 'drop-table' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-mono space-y-2">
                  <div className="font-bold flex items-center gap-2 text-sm">
                    <AlertTriangle size={16} className="text-rose-500" />
                    <span>Drop Table: "{selectedTableName}"</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">
                    {t('sqlite.dropTableWarning')}
                  </p>
                  <div className="text-[11px] opacity-80 pt-1">
                    Table contains <strong>{currentTable?.rowCount || 0} rows</strong> and{' '}
                    <strong>{currentTable?.columns.length || 0} columns</strong>.
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={dropTableConfirmed}
                    onChange={(e) => setDropTableConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span>I confirm dropping the table "{selectedTableName}" permanently</span>
                </label>
              </div>
            )}

            {/* Generated SQL Code Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-zinc-400 flex items-center gap-1.5">
                  <FileCode size={13} className="text-emerald-400" />
                  <span>{t('sqlite.generatedSql')}</span>
                </span>
                <div className="flex items-center gap-2">
                  {onNavigateToQuery && (
                    <button
                      type="button"
                      onClick={() => onNavigateToQuery(generatedSql)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors cursor-pointer"
                      title={t('sqlite.openInQueryEditor')}
                    >
                      <Terminal size={11} className="text-emerald-400" />
                      <span>{t('sqlite.openInQueryEditor')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors cursor-pointer"
                  >
                    {copiedSql ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
              </div>

              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 rounded-xl bg-black/50 leading-relaxed">
                <code>{generatedSql}</code>
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                id="modifier-execute-btn"
                type="button"
                onClick={handleExecute}
                disabled={
                  isExecuting ||
                  (activeOp === 'drop-column' && !dropColConfirmed) ||
                  (activeOp === 'drop-table' && !dropTableConfirmed) ||
                  (activeOp === 'add-column' && !newColName.trim()) ||
                  (activeOp === 'create-table' && !createTableName.trim())
                }
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  activeOp === 'drop-column' || activeOp === 'drop-table'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-black disabled:opacity-50'
                }`}
              >
                <Play size={14} className={isExecuting ? 'animate-spin' : ''} />
                <span>{isExecuting ? t('sqlite.executingModifier') : t('sqlite.executeModifier')}</span>
              </button>

              <span className="text-[11px] font-mono text-zinc-400">
                Safe Transaction & WAL Auto-Commit
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Existing Table Columns & Schema Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TableIcon size={16} className="text-emerald-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white font-mono">
                  {t('sqlite.tableColumnsOverview')}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300">
                {currentTable?.name}
              </span>
            </div>

            {/* Table Columns List Card */}
            {currentTable ? (
              <div className="space-y-2.5">
                <div className="rounded-2xl border border-zinc-200 dark:border-neutral-800 overflow-hidden font-mono text-xs">
                  <div className="overflow-x-auto max-h-[480px] scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-100 dark:bg-neutral-950 border-b border-zinc-200 dark:border-neutral-800 sticky top-0">
                        <tr>
                          <th className="p-2 text-[10px] font-bold text-zinc-500">#</th>
                          <th className="p-2 text-[10px] font-bold text-zinc-700 dark:text-neutral-300">Column</th>
                          <th className="p-2 text-[10px] font-bold text-zinc-700 dark:text-neutral-300">Type</th>
                          <th className="p-2 text-[10px] font-bold text-zinc-700 dark:text-neutral-300">Constraints</th>
                          <th className="p-2 text-[10px] font-bold text-zinc-700 dark:text-neutral-300 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-neutral-800/80 bg-white dark:bg-neutral-900">
                        {currentTable.columns.map((col) => {
                          const typeObj = DATA_TYPES.find((dt) => dt.value === col.type.toUpperCase());
                          return (
                            <tr
                              key={col.name}
                              className="hover:bg-zinc-50 dark:hover:bg-neutral-800/50 transition-colors"
                            >
                              <td className="p-2 text-[11px] text-zinc-400">{col.cid}</td>
                              <td className="p-2 text-[11px] font-bold text-zinc-900 dark:text-white">
                                <div className="flex items-center gap-1.5">
                                  <span>{col.name}</span>
                                  {col.pk && (
                                    <span
                                      className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                      title="Primary Key"
                                    >
                                      PK
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-[10px]">
                                <span
                                  className={`px-1.5 py-0.5 rounded border text-[10px] font-mono font-semibold ${
                                    typeObj ? typeObj.color : 'bg-zinc-100 dark:bg-neutral-800 text-zinc-600'
                                  }`}
                                >
                                  {col.type}
                                </span>
                              </td>
                              <td className="p-2 text-[10px] text-zinc-500">
                                <div className="space-y-0.5">
                                  {col.notnull && <span className="text-zinc-600 dark:text-neutral-400 block font-semibold">NOT NULL</span>}
                                  {col.dflt_value !== null && col.dflt_value !== undefined && (
                                    <span className="text-zinc-400 block truncate max-w-[120px]" title={`Default: ${col.dflt_value}`}>
                                      Def: {String(col.dflt_value)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Quick Drop Column */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOp('drop-column');
                                      setDropColName(col.name);
                                      setDropColConfirmed(false);
                                    }}
                                    className="p-1 rounded-md text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    title={`Drop column "${col.name}"`}
                                  >
                                    <Trash2 size={12} />
                                  </button>

                                  {/* Quick Rename Column */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveOp('rename-column');
                                      setRenameColOld(col.name);
                                      setRenameColNew(`${col.name}_new`);
                                    }}
                                    className="p-1 rounded-md text-zinc-400 hover:text-purple-600 hover:bg-purple-500/10 transition-colors cursor-pointer"
                                    title={`Rename column "${col.name}"`}
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Metadata Summary Footer */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-600 dark:text-neutral-400 text-[11px]">
                    <span>Foreign Key Constraints:</span>
                    <strong className="text-zinc-900 dark:text-white">{currentTable.foreignKeys.length}</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-neutral-400 text-[11px]">
                    <span>Indexes:</span>
                    <strong className="text-zinc-900 dark:text-white">{currentTable.indexes.length}</strong>
                  </div>
                  <div className="flex items-center justify-between text-zinc-600 dark:text-neutral-400 text-[11px]">
                    <span>Total Rows Stored:</span>
                    <strong className="text-emerald-500">{currentTable.rowCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-zinc-400">
                No table selected.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

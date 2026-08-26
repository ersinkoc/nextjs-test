import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import {
  Database,
  Table as TableIcon,
  Key,
  Link as LinkIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Sparkles,
  Search,
  Copy,
  Check,
  FileCode,
  Layers,
  ArrowRight,
  Terminal,
  Info,
  Sliders,
  Eye,
  X,
  Share2,
  GitFork,
  ShieldAlert,
  Zap,
  Grid,
  Activity
} from 'lucide-react';
import { useI18n } from '../i18n';
import { motion, AnimatePresence } from 'motion/react';

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: boolean;
  dflt_value: any;
  pk: boolean;
}

export interface ForeignKeyInfo {
  id: number;
  seq: number;
  targetTable: string;
  fromColumn: string;
  toColumn: string;
  onUpdate: string;
  onDelete: string;
}

export interface TableIndexInfo {
  name: string;
  unique: boolean;
  origin: string;
  partial: boolean;
}

export interface TableSchemaDetail {
  name: string;
  rowCount: number;
  sql: string;
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: TableIndexInfo[];
  primaryKeys: string[];
  inferredRelations?: Array<{
    targetTable: string;
    fromColumn: string;
    toColumn: string;
    relationType: '1:N' | 'N:1' | '1:1';
  }>;
}

export interface DbFullSchema {
  tables: TableSchemaDetail[];
  totalTables: number;
  totalColumns: number;
  totalForeignKeys: number;
  ddlScript: string;
}

interface ERNode extends d3.SimulationNodeDatum {
  id: string;
  table: TableSchemaDetail;
  width: number;
  height: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  color: string;
}

interface ERLink extends d3.SimulationLinkDatum<ERNode> {
  source: string | ERNode;
  target: string | ERNode;
  fromColumn: string;
  toColumn: string;
  relationType: string;
  isExplicit: boolean;
  onDelete?: string;
  onUpdate?: string;
}

interface SqliteErViewerProps {
  onNavigateToQuery?: (sql: string) => void;
  onNavigateToModifier?: (tableName: string) => void;
  onRefreshStatus?: () => void;
}

// Color palette for table entity nodes
const TABLE_COLORS = [
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', accent: '#10b981' },
  { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', accent: '#6366f1' },
  { border: 'border-sky-500/40', bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', accent: '#0ea5e9' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', accent: '#a855f7' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', accent: '#f59e0b' },
  { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', accent: '#f43f5e' },
  { border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-600 dark:text-teal-400', accent: '#14b8a6' },
];

export const SqliteErViewer: React.FC<SqliteErViewerProps> = ({
  onNavigateToQuery,
  onNavigateToModifier,
  onRefreshStatus,
}) => {
  const { t } = useI18n();

  // Schema state
  const [schema, setSchema] = useState<DbFullSchema | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeedingRelational, setIsSeedingRelational] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<TableSchemaDetail | null>(null);
  const [layoutMode, setLayoutMode] = useState<'force' | 'grid' | 'hierarchical'>('force');
  const [copiedDdl, setCopiedDdl] = useState<boolean>(false);
  const [copiedTableDdl, setCopiedTableDdl] = useState<boolean>(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // SVG & D3 references
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<ERNode, ERLink> | null>(null);

  // Fetch complete database schema
  const fetchSchema = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sqlite/schema');
      if (res.ok) {
        const data: DbFullSchema = await res.json();
        setSchema(data);
        if (data.tables.length > 0 && !selectedTable) {
          setSelectedTable(data.tables[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sqlite schema:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    fetchSchema();
  }, [fetchSchema]);

  // Seed relational schema with explicit Foreign Keys
  const handleSeedRelational = async () => {
    setIsSeedingRelational(true);
    try {
      const res = await fetch('/api/sqlite/seed-relational', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchSchema();
        if (onRefreshStatus) onRefreshStatus();
      }
    } catch (err) {
      console.error('Failed to seed relational schema:', err);
    } finally {
      setIsSeedingRelational(false);
    }
  };

  // Copy Full Schema DDL
  const handleCopyFullDdl = () => {
    if (!schema?.ddlScript) return;
    navigator.clipboard.writeText(schema.ddlScript);
    setCopiedDdl(true);
    setTimeout(() => setCopiedDdl(false), 2000);
  };

  // Copy Selected Table DDL
  const handleCopyTableDdl = () => {
    if (!selectedTable?.sql) return;
    navigator.clipboard.writeText(selectedTable.sql);
    setCopiedTableDdl(true);
    setTimeout(() => setCopiedTableDdl(false), 2000);
  };

  // Extract Nodes and Links from Schema
  const { nodes, links } = useMemo(() => {
    if (!schema || !schema.tables) {
      return { nodes: [] as ERNode[], links: [] as ERLink[] };
    }

    const nodeList: ERNode[] = schema.tables.map((tbl, idx) => {
      // Calculate node card height based on column count (base header 50px + 28px per column + footer 32px)
      const columnCount = tbl.columns.length;
      const height = Math.min(Math.max(120, 60 + columnCount * 28 + 36), 380);
      const width = 280;

      return {
        id: tbl.name,
        table: tbl,
        width,
        height,
        color: TABLE_COLORS[idx % TABLE_COLORS.length].accent,
      };
    });

    const linkList: ERLink[] = [];

    // Parse all explicit Foreign Keys
    schema.tables.forEach((tbl) => {
      tbl.foreignKeys.forEach((fk) => {
        // Find if target table exists in nodes
        const targetExists = nodeList.some((n) => n.id === fk.targetTable);
        if (targetExists) {
          linkList.push({
            source: tbl.name,
            target: fk.targetTable,
            fromColumn: fk.fromColumn,
            toColumn: fk.toColumn,
            relationType: 'N:1',
            isExplicit: true,
            onDelete: fk.onDelete,
            onUpdate: fk.onUpdate,
          });
        }
      });

      // Parse inferred relations
      if (tbl.inferredRelations) {
        tbl.inferredRelations.forEach((inf) => {
          const targetExists = nodeList.some((n) => n.id === inf.targetTable);
          if (targetExists) {
            linkList.push({
              source: tbl.name,
              target: inf.targetTable,
              fromColumn: inf.fromColumn,
              toColumn: inf.toColumn,
              relationType: inf.relationType,
              isExplicit: false,
            });
          }
        });
      }
    });

    return { nodes: nodeList, links: linkList };
  }, [schema]);

  // Filtered tables based on search
  const filteredTableNames = useMemo(() => {
    if (!searchQuery.trim() || !schema) return null;
    const q = searchQuery.toLowerCase();
    return schema.tables
      .filter(
        (tbl) =>
          tbl.name.toLowerCase().includes(q) ||
          tbl.columns.some((c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q))
      )
      .map((tbl) => tbl.name);
  }, [schema, searchQuery]);

  // D3 Graph Initialization & Layout
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    // Clear previous SVG contents
    svg.selectAll('*').remove();

    // Create main graph container group for zoom/pan
    const g = svg.append('g').attr('class', 'er-diagram-stage');

    // Define Arrow Marker Defs for Relationships
    const defs = svg.append('defs');

    // Explicit FK Arrow
    defs
      .append('marker')
      .attr('id', 'fk-arrow-explicit')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#10b981');

    // Inferred FK Arrow
    defs
      .append('marker')
      .attr('id', 'fk-arrow-inferred')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#a855f7');

    // Active Highlight Arrow
    defs
      .append('marker')
      .attr('id', 'fk-arrow-highlight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#38bdf8');

    // D3 Zoom & Pan configuration
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Apply layout positions according to mode
    if (layoutMode === 'grid') {
      const cols = Math.max(1, Math.floor(Math.sqrt(nodes.length * 1.5)));
      const xSpacing = 340;
      const ySpacing = 320;
      nodes.forEach((node, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        node.fx = col * xSpacing + 80;
        node.fy = row * ySpacing + 80;
        node.x = node.fx;
        node.y = node.fy;
      });
    } else if (layoutMode === 'hierarchical') {
      // Find root tables (no foreign keys) and referencing tables
      const inDegree = new Map<string, number>();
      const outDegree = new Map<string, number>();

      nodes.forEach((n) => {
        inDegree.set(n.id, 0);
        outDegree.set(n.id, 0);
      });

      links.forEach((l) => {
        const srcId = typeof l.source === 'string' ? l.source : l.source.id;
        const tgtId = typeof l.target === 'string' ? l.target : l.target.id;
        outDegree.set(srcId, (outDegree.get(srcId) || 0) + 1);
        inDegree.set(tgtId, (inDegree.get(tgtId) || 0) + 1);
      });

      // Sort into layers: roots (targets) on top/middle, leaf sources on bottom
      const layer0 = nodes.filter((n) => (outDegree.get(n.id) || 0) === 0);
      const layer1 = nodes.filter((n) => (outDegree.get(n.id) || 0) > 0 && (inDegree.get(n.id) || 0) > 0);
      const layer2 = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);

      const layers = [layer0, layer1, layer2].filter((l) => l.length > 0);
      const yGap = 360;
      const xGap = 340;

      layers.forEach((layer, layerIdx) => {
        layer.forEach((node, nodeIdx) => {
          node.fx = nodeIdx * xGap + 80;
          node.fy = layerIdx * yGap + 80;
          node.x = node.fx;
          node.y = node.fy;
        });
      });
    } else {
      // Force Layout: clear fixed positions (except during drag)
      nodes.forEach((node) => {
        node.fx = null;
        node.fy = null;
      });
    }

    // Links rendering group
    const linksGroup = g.append('g').attr('class', 'er-links');
    const linkPaths = linksGroup
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'er-link-path')
      .attr('fill', 'none')
      .attr('stroke', (d) => (d.isExplicit ? '#10b981' : '#a855f7'))
      .attr('stroke-width', (d) => (d.isExplicit ? 2 : 1.5))
      .attr('stroke-dasharray', (d) => (d.isExplicit ? 'none' : '5,5'))
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', (d) => (d.isExplicit ? 'url(#fk-arrow-explicit)' : 'url(#fk-arrow-inferred)'));

    // Link Labels Group (showing relation details: "from_col -> to_col")
    const linkLabelsGroup = g.append('g').attr('class', 'er-link-labels');
    const linkLabels = linkLabelsGroup
      .selectAll('g')
      .data(links)
      .enter()
      .append('g')
      .attr('class', 'er-link-label cursor-pointer');

    linkLabels
      .append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('class', 'fill-white dark:fill-neutral-900 stroke-zinc-200 dark:stroke-neutral-800')
      .attr('stroke-width', 1);

    linkLabels
      .append('text')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('class', 'fill-zinc-600 dark:fill-neutral-300 font-semibold')
      .text((d) => `${d.fromColumn} ➔ ${d.toColumn}`);

    // Adjust rect size for text
    linkLabels.each(function () {
      const textElem = d3.select(this).select('text');
      const bbox = (textElem.node() as SVGTextContentElement)?.getBBox();
      if (bbox) {
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x - 6)
          .attr('y', bbox.y - 3)
          .attr('width', bbox.width + 12)
          .attr('height', bbox.height + 6);
      }
    });

    // Nodes rendering group using foreignObject for rich responsive HTML entity cards
    const nodesGroup = g.append('g').attr('class', 'er-nodes');
    const nodeElements = nodesGroup
      .selectAll('g.er-node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'er-node cursor-move')
      .attr('id', (d) => `er-node-${d.id}`);

    // Card foreignObject container
    const foreignObjects = nodeElements
      .append('foreignObject')
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('x', (d) => -d.width / 2)
      .attr('y', (d) => -d.height / 2);

    // Render HTML inside foreignObject for maximum visual beauty & interaction
    foreignObjects.each(function (d) {
      const cardContainer = d3.select(this);
      const isSelected = selectedTable?.name === d.id;
      const isHighlighted =
        !filteredTableNames || filteredTableNames.includes(d.id);

      cardContainer.html(`
        <div class="er-table-card w-full h-full flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border-2 transition-all shadow-md select-none overflow-hidden ${
          isSelected
            ? 'border-emerald-500 ring-2 ring-emerald-500/30'
            : isHighlighted
            ? 'border-zinc-200 dark:border-neutral-800 hover:border-zinc-400 dark:hover:border-neutral-700'
            : 'border-zinc-200/40 dark:border-neutral-800/40 opacity-40'
        }">
          <!-- Header -->
          <div class="px-3.5 py-2.5 bg-zinc-50 dark:bg-neutral-950 border-b border-zinc-200 dark:border-neutral-800 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-neutral-800 text-white flex items-center justify-center text-[10px] font-bold">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
              </span>
              <span class="font-mono font-bold text-xs text-zinc-900 dark:text-white truncate" title="${d.id}">
                ${d.id}
              </span>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-200/70 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300">
              ${d.table.rowCount} rows
            </span>
          </div>

          <!-- Column List -->
          <div class="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono">
            ${d.table.columns
              .map((col) => {
                const isPk = col.pk;
                const isFk = d.table.foreignKeys.some((fk) => fk.fromColumn === col.name);
                const isInferredFk = d.table.inferredRelations?.some((inf) => inf.fromColumn === col.name);

                return `
                  <div class="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-neutral-800/70 transition-colors">
                    <div class="flex items-center gap-1.5 min-w-0">
                      ${
                        isPk
                          ? `<span class="text-amber-500 font-bold text-[10px]" title="Primary Key">🔑</span>`
                          : isFk
                          ? `<span class="text-emerald-500 font-bold text-[10px]" title="Foreign Key">🔗</span>`
                          : isInferredFk
                          ? `<span class="text-purple-500 font-bold text-[10px]" title="Inferred FK">⚡</span>`
                          : `<span class="w-3 text-zinc-300 dark:text-neutral-600 text-[10px]">▪</span>`
                      }
                      <span class="font-medium text-zinc-800 dark:text-neutral-200 truncate ${
                        isPk ? 'font-bold text-amber-600 dark:text-amber-400' : ''
                      }">
                        ${col.name}
                      </span>
                    </div>
                    <div class="flex items-center gap-1">
                      ${
                        col.notnull
                          ? `<span class="text-[9px] px-1 py-0.2 rounded bg-zinc-200/80 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400" title="Not Null">NN</span>`
                          : ''
                      }
                      <span class="text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        col.type.includes('INT')
                          ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : col.type.includes('TEXT') || col.type.includes('CHAR')
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : col.type.includes('REAL') || col.type.includes('NUM')
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }">
                        ${col.type}
                      </span>
                    </div>
                  </div>
                `;
              })
              .join('')}
          </div>

          <!-- Footer Actions -->
          <div class="px-3 py-1.5 bg-zinc-50/80 dark:bg-neutral-950/80 border-t border-zinc-100 dark:border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span class="flex items-center gap-1">
              <span>${d.table.columns.length} cols</span>
              ${d.table.foreignKeys.length ? `• <span class="text-emerald-500">${d.table.foreignKeys.length} FK</span>` : ''}
            </span>
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Select ➔</span>
          </div>
        </div>
      `);
    });

    // Node Interaction Events (Click, Hover, Drag)
    nodeElements
      .on('click', (event, d) => {
        setSelectedTable(d.table);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNodeId(d.id);
        // Highlight connected links
        linkPaths
          .attr('stroke', (l) => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            return src === d.id || tgt === d.id ? '#38bdf8' : l.isExplicit ? '#10b981' : '#a855f7';
          })
          .attr('stroke-width', (l) => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            return src === d.id || tgt === d.id ? 3 : l.isExplicit ? 2 : 1.5;
          })
          .attr('stroke-opacity', (l) => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            return src === d.id || tgt === d.id ? 1 : 0.2;
          })
          .attr('marker-end', (l) => {
            const src = typeof l.source === 'string' ? l.source : l.source.id;
            const tgt = typeof l.target === 'string' ? l.target : l.target.id;
            return src === d.id || tgt === d.id
              ? 'url(#fk-arrow-highlight)'
              : l.isExplicit
              ? 'url(#fk-arrow-explicit)'
              : 'url(#fk-arrow-inferred)';
          });
      })
      .on('mouseleave', () => {
        setHoveredNodeId(null);
        // Reset links styling
        linkPaths
          .attr('stroke', (l) => (l.isExplicit ? '#10b981' : '#a855f7'))
          .attr('stroke-width', (l) => (l.isExplicit ? 2 : 1.5))
          .attr('stroke-opacity', 0.6)
          .attr('marker-end', (l) => (l.isExplicit ? 'url(#fk-arrow-explicit)' : 'url(#fk-arrow-inferred)'));
      });

    // Node Drag Handler
    const dragBehavior = d3
      .drag<SVGGElement, ERNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
        d.x = event.x;
        d.y = event.y;
        ticked();
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
        if (layoutMode === 'force') {
          d.fx = null;
          d.fy = null;
        }
      });

    nodeElements.call(dragBehavior);

    // Compute Bezier Curve Path between Source & Target bounding boxes
    const calculateLinkPath = (d: ERLink) => {
      const source = d.source as ERNode;
      const target = d.target as ERNode;

      if (!source.x || !source.y || !target.x || !target.y) return '';

      const sx = source.x;
      const sy = source.y;
      const tx = target.x;
      const ty = target.y;

      const dx = tx - sx;
      const dy = ty - sy;

      // Connect from closest side edges of cards
      const sourceEdgeX = dx > 0 ? sx + source.width / 2 : sx - source.width / 2;
      const targetEdgeX = dx > 0 ? tx - target.width / 2 : tx + target.width / 2;

      const curvature = 0.5;
      const hx1 = sourceEdgeX + (targetEdgeX - sourceEdgeX) * curvature;
      const hy1 = sy;
      const hx2 = targetEdgeX - (targetEdgeX - sourceEdgeX) * curvature;
      const hy2 = ty;

      return `M ${sourceEdgeX} ${sy} C ${hx1} ${hy1}, ${hx2} ${hy2}, ${targetEdgeX} ${ty}`;
    };

    // Update positions on every animation tick
    const ticked = () => {
      // Update link paths
      linkPaths.attr('d', calculateLinkPath);

      // Update link labels
      linkLabels.attr('transform', (d) => {
        const source = d.source as ERNode;
        const target = d.target as ERNode;
        if (!source.x || !source.y || !target.x || !target.y) return 'translate(0,0)';
        const mx = (source.x + target.x) / 2;
        const my = (source.y + target.y) / 2;
        return `translate(${mx}, ${my})`;
      });

      // Update node elements
      nodeElements.attr('transform', (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    };

    // Initialize D3 Force Simulation if in Force mode
    if (layoutMode === 'force') {
      const simulation = d3
        .forceSimulation<ERNode, ERLink>(nodes)
        .force(
          'link',
          d3
            .forceLink<ERNode, ERLink>(links)
            .id((d) => d.id)
            .distance(380)
        )
        .force('charge', d3.forceManyBody().strength(-1200))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force(
          'collide',
          d3.forceCollide<ERNode>().radius((d) => Math.max(d.width, d.height) * 0.8)
        )
        .on('tick', ticked);

      simulationRef.current = simulation;
    } else {
      // In grid or hierarchical mode, run one synchronous tick
      ticked();
    }

    // Initial Zoom Fit
    const initialTransform = d3.zoomIdentity.translate(40, 40).scale(0.85);
    svg.call(zoom.transform, initialTransform);

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [nodes, links, layoutMode, filteredTableNames, selectedTable]);

  // Zoom Helpers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const initialTransform = d3.zoomIdentity.translate(40, 40).scale(0.85);
    d3.select(svgRef.current).transition().duration(350).call(zoomBehaviorRef.current.transform, initialTransform);
  };

  return (
    <div className="space-y-6" id="sqlite-er-viewer-tab">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <GitFork size={18} />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {t('sqlite.schemaTitle')}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {schema?.totalTables || 0} {t('sqlite.tableCount')} • {schema?.totalForeignKeys || 0} {t('sqlite.foreignKeysCount')}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-neutral-400 max-w-3xl leading-relaxed">
              {t('sqlite.schemaDesc')}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="sqlite-er-seed-relational-btn"
              onClick={handleSeedRelational}
              disabled={isSeedingRelational}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
              title="Populate relational tables with explicit Foreign Keys"
            >
              <Sparkles size={14} className={isSeedingRelational ? 'animate-spin' : ''} />
              <span>{isSeedingRelational ? 'Creating FK Schema...' : t('sqlite.seedRelational')}</span>
            </button>

            <button
              id="sqlite-er-copy-ddl-btn"
              onClick={handleCopyFullDdl}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-800 dark:text-neutral-200 text-xs font-mono font-semibold transition-all border border-zinc-200 dark:border-neutral-700 cursor-pointer"
            >
              {copiedDdl ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copiedDdl ? 'DDL Copied!' : t('sqlite.copyDdl')}</span>
            </button>

            <button
              id="sqlite-er-refresh-btn"
              onClick={fetchSchema}
              disabled={isLoading}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-600 dark:text-neutral-300 transition-all border border-zinc-200 dark:border-neutral-700 cursor-pointer"
              title="Refresh Schema"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Legend & Layout Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-neutral-800/80">
          {/* Legend Items */}
          <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-neutral-400">
              <span className="text-amber-500 font-bold">🔑</span>
              <span>Primary Key (PK)</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-neutral-400">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
              <span>Explicit Foreign Key (1:N)</span>
            </span>
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-neutral-400">
              <span className="w-3 h-0.5 border-b-2 border-dashed border-purple-500 inline-block" />
              <span>Inferred Relation</span>
            </span>
          </div>

          {/* Layout Controls & Table Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Filter */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('sqlite.filterTables')}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200 dark:border-neutral-800 text-xs font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Layout Mode Selector */}
            <div className="flex items-center bg-zinc-100 dark:bg-neutral-800 p-0.5 rounded-xl text-xs font-mono">
              <button
                onClick={() => setLayoutMode('force')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'force'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                    : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={t('sqlite.layoutForce')}
              >
                Force
              </button>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                    : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={t('sqlite.layoutGrid')}
              >
                Grid
              </button>
              <button
                onClick={() => setLayoutMode('hierarchical')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  layoutMode === 'hierarchical'
                    ? 'bg-white dark:bg-neutral-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                    : 'text-zinc-600 dark:text-neutral-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={t('sqlite.layoutHierarchical')}
              >
                Tree
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive D3 ER Canvas (8 cols on xl) */}
        <div className="xl:col-span-8 relative">
          <div
            ref={containerRef}
            className="w-full h-[640px] rounded-3xl bg-zinc-950 border border-zinc-800/80 relative overflow-hidden shadow-inner flex items-center justify-center"
          >
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* D3 SVG Element */}
            <svg
              ref={svgRef}
              id="sqlite-er-svg-canvas"
              className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            />

            {/* Floating Zoom & Canvas Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/90 dark:bg-neutral-900/90 border border-zinc-800 backdrop-blur-md shadow-lg text-white">
              <button
                id="er-zoom-in-btn"
                onClick={handleZoomIn}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={t('sqlite.zoomIn')}
              >
                <ZoomIn size={15} />
              </button>
              <button
                id="er-zoom-out-btn"
                onClick={handleZoomOut}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={t('sqlite.zoomOut')}
              >
                <ZoomOut size={15} />
              </button>
              <div className="w-[1px] h-4 bg-zinc-800" />
              <button
                id="er-zoom-reset-btn"
                onClick={handleResetZoom}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title={t('sqlite.resetZoom')}
              >
                <Maximize2 size={15} />
              </button>
            </div>

            {/* Canvas Hint Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-md text-[11px] font-mono text-zinc-400 flex items-center gap-2 pointer-events-none">
              <Info size={13} className="text-emerald-400" />
              <span>{t('sqlite.selectNodeHint')}</span>
            </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center gap-3 text-white font-mono text-xs">
                <RefreshCw size={18} className="animate-spin text-emerald-400" />
                <span>Parsing SQLite schema & foreign keys...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Table Inspector & DDL Drawer (4 cols on xl) */}
        <div className="xl:col-span-4 space-y-5">
          {selectedTable ? (
            <motion.div
              key={selectedTable.name}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 shadow-xs space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TableIcon size={16} className="text-emerald-500 shrink-0" />
                    <h4 className="text-base font-bold font-mono text-zinc-900 dark:text-white truncate">
                      {selectedTable.name}
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                    {selectedTable.rowCount} records • {selectedTable.columns.length} columns
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigateToModifier && (
                    <button
                      onClick={() => onNavigateToModifier(selectedTable.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
                      title={t('sqlite.modifierTab')}
                    >
                      <Sliders size={13} />
                      <span>Alter</span>
                    </button>
                  )}

                  {onNavigateToQuery && (
                    <button
                      onClick={() => onNavigateToQuery(`SELECT * FROM "${selectedTable.name}" LIMIT 25;`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-semibold transition-all cursor-pointer"
                      title={t('sqlite.quickQuery')}
                    >
                      <Terminal size={13} />
                      <span>Query</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Columns Table Breakdown */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-neutral-500 block">
                  {t('sqlite.columnsCount')} ({selectedTable.columns.length})
                </span>
                <div className="max-h-56 overflow-y-auto rounded-2xl border border-zinc-200 dark:border-neutral-800 divide-y divide-zinc-100 dark:divide-neutral-800/80">
                  {selectedTable.columns.map((col) => {
                    const isFk = selectedTable.foreignKeys.find((fk) => fk.fromColumn === col.name);
                    return (
                      <div
                        key={col.cid}
                        className="px-3 py-2 flex items-center justify-between text-xs font-mono hover:bg-zinc-50 dark:hover:bg-neutral-950 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {col.pk ? (
                            <span className="text-amber-500 font-bold" title="Primary Key">🔑</span>
                          ) : isFk ? (
                            <span className="text-emerald-500 font-bold" title="Foreign Key">🔗</span>
                          ) : (
                            <span className="text-zinc-300 dark:text-neutral-600">▪</span>
                          )}
                          <span className={`truncate ${col.pk ? 'font-bold text-amber-600 dark:text-amber-400' : 'text-zinc-800 dark:text-neutral-200'}`}>
                            {col.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {col.notnull && (
                            <span className="text-[9px] px-1 rounded bg-zinc-100 dark:bg-neutral-800 text-zinc-500">
                              NN
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300">
                            {col.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Foreign Keys List */}
              {selectedTable.foreignKeys.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Foreign Keys ({selectedTable.foreignKeys.length})
                  </span>
                  <div className="space-y-1.5">
                    {selectedTable.foreignKeys.map((fk) => (
                      <div
                        key={`${fk.id}-${fk.fromColumn}`}
                        className="p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold">
                          <span>{fk.fromColumn}</span>
                          <span className="text-zinc-400">➔</span>
                          <span>{fk.targetTable}.{fk.toColumn}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-neutral-400 flex items-center gap-2">
                          <span>ON UPDATE: {fk.onUpdate}</span>
                          <span>•</span>
                          <span>ON DELETE: {fk.onDelete}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indexes List */}
              {selectedTable.indexes && selectedTable.indexes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-neutral-500 block">
                    Indexes ({selectedTable.indexes.length})
                  </span>
                  <div className="space-y-1">
                    {selectedTable.indexes.map((idx) => (
                      <div
                        key={idx.name}
                        className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-neutral-950 border border-zinc-200/80 dark:border-neutral-800 text-xs font-mono flex items-center justify-between"
                      >
                        <span className="text-zinc-700 dark:text-neutral-300 truncate">{idx.name}</span>
                        <span className={`text-[10px] font-semibold ${idx.unique ? 'text-amber-500' : 'text-zinc-400'}`}>
                          {idx.unique ? 'UNIQUE' : 'INDEX'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DDL Preview & Copy */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 dark:text-neutral-500">
                    CREATE TABLE DDL
                  </span>
                  <button
                    onClick={handleCopyTableDdl}
                    className="text-[11px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedTableDdl ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    <span>{copiedTableDdl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 max-h-40 overflow-y-auto leading-relaxed">
                  <pre className="whitespace-pre-wrap">{selectedTable.sql || `-- No DDL available`}</pre>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-neutral-900 border border-zinc-200 dark:border-neutral-800 text-center space-y-3">
              <Database size={24} className="mx-auto text-zinc-400" />
              <p className="text-xs font-mono text-zinc-500 dark:text-neutral-400">
                {t('sqlite.selectNodeHint')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../../types/MindMap';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RefreshIcon from '@mui/icons-material/Refresh';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

interface MindMapProps {
  data: MindMapNode;
  onClose?: () => void;
  showControls?: boolean;
}

export interface MindMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  toggleExpandAll: () => void;
  isAllExpanded: boolean;
}

// Extend D3 Type to handle hidden children state
interface HierarchyDatum extends d3.HierarchyNode<MindMapNode> {
  _children?: HierarchyDatum[];
  x0?: number;
  y0?: number;
  bbox?: DOMRect;
}

export const MindMapVisualization = forwardRef<MindMapRef, MindMapProps>(({ data, showControls = true }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HierarchyDatum | null>(null);
  const svgGroupRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isAllExpanded, setIsAllExpanded] = useState(true);

  // Theme Colors - Fixed colors for each depth level
  const levelColors = [
    { bg: "#4f46e5", border: "#4f46e5", text: "#ffffff" },     // Level 0 (Root) - Indigo
    { bg: "#0d9488", border: "#0d9488", text: "#ffffff" },     // Level 1 - Teal
    { bg: "#f59e0b", border: "#f59e0b", text: "#ffffff" },     // Level 2 - Amber
    { bg: "#ec4899", border: "#ec4899", text: "#ffffff" },     // Level 3 - Pink
    { bg: "#8b5cf6", border: "#8b5cf6", text: "#ffffff" },     // Level 4 - Purple
    { bg: "#06b6d4", border: "#06b6d4", text: "#ffffff" },     // Level 5 - Cyan
  ];

  const getColorByDepth = (depth: number, hasHiddenChildren: boolean) => {
    const colorIndex = Math.min(depth, levelColors.length - 1);
    if (hasHiddenChildren || depth === 0) {
      return levelColors[colorIndex];
    }
    // For expanded nodes (except root), show white bg with colored border
    return {
      bg: "#ffffff",
      border: levelColors[colorIndex].border,
      text: "#1e293b"
    };
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        setDimensions({
          width: wrapperRef.current.clientWidth,
          height: wrapperRef.current.clientHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize D3
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Setup Zoom
    const g = svg.append("g").attr("transform", `translate(${width / 6},${height / 2})`);
    svgGroupRef.current = g;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    // Store zoom behavior in ref for later use
    zoomRef.current = zoom;

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(100, height / 2).scale(0.8));

    // Setup Data
    const root = d3.hierarchy<MindMapNode>(data) as HierarchyDatum;
    root.x0 = height / 2;
    root.y0 = 0;

    rootRef.current = root;
    update(root);

    // Filter Definitions (Shadow)
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "node-shadow").attr("height", "130%");
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 2);
    filter.append("feOffset").attr("dx", 1).attr("dy", 1);
    filter.append("feComponentTransfer").append("feFuncA").attr("type", "linear").attr("slope", 0.3);
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  }, [data, dimensions]);

  // Update Function (Core Animation Logic)
  const update = (source: HierarchyDatum) => {
    if (!rootRef.current || !svgGroupRef.current) return;
    const root = rootRef.current;
    const g = svgGroupRef.current;

    const duration = 500;

    // Compute Layout - Increased spacing for better readability
    const tree = d3.tree<MindMapNode>()
      .nodeSize([65, 280])
      .separation((a, b) => (a.parent === b.parent ? 1.3 : 1.8));

    const treeData = tree(root);
    const nodes = treeData.descendants() as HierarchyDatum[];
    const links = treeData.links();

    // Normalize Depth - Increased horizontal spacing
    nodes.forEach(d => { d.y = d.depth * 320; });

    // DATA JOIN
    const node = g.selectAll<SVGGElement, HierarchyDatum>("g.node")
      .data(nodes, (d) => d.id || ((d as any).id = Math.random().toString()));

    // ENTER
    const nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", () => `translate(${source.y0},${source.x0})`)
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        if (d.children) {
          d._children = d.children;
          d.children = undefined;
        } else {
          d.children = d._children;
          d._children = undefined;
        }
        update(d);
      });

    nodeEnter.append("rect")
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("width", 0)
      .attr("height", 0)
      .attr("stroke-width", 2)
      .style("filter", "url(#node-shadow)");

    nodeEnter.append("text")
      .attr("dy", "0.35em")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .text(d => d.data.name)
      .style("font-family", "'Inter', sans-serif")
      .style("font-size", "14px")
      .style("opacity", 0);

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition().duration(duration)
      .attr("transform", d => `translate(${d.y},${d.x})`);

    nodeUpdate.select("rect")
      .attr("fill", d => {
        const colorConfig = getColorByDepth(d.depth, !!d._children);
        return colorConfig.bg;
      })
      .attr("stroke", d => {
        if (d.depth === 0) return "none";
        const colorConfig = getColorByDepth(d.depth, !!d._children);
        return colorConfig.border;
      })
      .attr("stroke-width", d => d.depth === 0 ? 0 : 2.5)
      .each(function (d) {
        const currentNode = this as unknown as SVGElement;
        const gParent = d3.select(currentNode.parentNode as any);
        const textEl = gParent.select("text").node() as SVGTextElement;
        const bbox = textEl.getBBox();
        d.bbox = bbox;

        const paddingX = 24;
        const paddingY = 12;

        d3.select(this)
          .attr("width", bbox.width + paddingX * 2)
          .attr("height", bbox.height + paddingY * 2)
          .attr("x", -(bbox.width + paddingX * 2) / 2)
          .attr("y", -(bbox.height + paddingY * 2) / 2);
      });

    nodeUpdate.select("text")
      .style("opacity", 1)
      .style("fill", d => {
        const colorConfig = getColorByDepth(d.depth, !!d._children);
        return colorConfig.text;
      })
      .style("font-weight", d => d.depth <= 1 ? "600" : "500");

    // Collapsed Indicator
    nodeUpdate.selectAll("circle.indicator").remove();
    nodeUpdate.filter(d => !!d._children)
      .append("circle")
      .attr("class", "indicator")
      .attr("cx", d => (d.bbox ? (d.bbox.width + 48) / 2 : 20))
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", "#fbbf24")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // EXIT
    const nodeExit = node.exit().transition().duration(duration)
      .attr("transform", () => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select("rect").attr("width", 0).attr("height", 0);
    nodeExit.select("text").style("opacity", 0);

    // Process Links
    const link = g.selectAll<SVGPathElement, d3.HierarchyPointLink<MindMapNode>>("path.link")
      .data(links, (d) => (d.target as any).id);

    const diagonal = d3.linkHorizontal<any, any>()
      .x(d => d.y)
      .y(d => d.x);

    const linkEnter = link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", () => {
        const o = { x: source.x0 || 0, y: source.y0 || 0 };
        return diagonal({ source: o, target: o });
      })
      .attr("fill", "none")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    link.merge(linkEnter as any).transition().duration(duration)
      .attr("d", diagonal);

    link.exit().transition().duration(duration)
      .attr("d", () => {
        const o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      })
      .remove();

    // Store positions for next transition
    nodes.forEach(d => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  // Toolbar Functions
  const handleZoom = (scaleFactor: number) => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomRef.current.scaleBy as any, scaleFactor);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        zoomRef.current.transform as any, 
        d3.zoomIdentity.translate(100, dimensions.height / 2).scale(0.8)
      );
    }
  };

  const toggleExpandAll = () => {
    if (!rootRef.current) return;

    const expand = (d: HierarchyDatum) => {
      if (d._children) {
        d.children = d._children;
        d._children = undefined;
      }
      if (d.children) d.children.forEach(expand);
    };

    const collapse = (d: HierarchyDatum) => {
      if (d.children) {
        d._children = d.children;
        d.children = undefined;
      }
      if (d._children) d._children.forEach(collapse);
    };

    if (!isAllExpanded) {
      expand(rootRef.current);
    } else {
      if (rootRef.current.children) rootRef.current.children.forEach(collapse);
    }

    update(rootRef.current);
    setIsAllExpanded(!isAllExpanded);
    handleReset();
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoom(1.3),
    zoomOut: () => handleZoom(0.7),
    resetView: handleReset,
    toggleExpandAll,
    isAllExpanded,
  }), [isAllExpanded, dimensions.height]);

  return (
    <div ref={wrapperRef} className="w-full h-full relative bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 select-none">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}>
      </div>

      <svg ref={svgRef} className="w-full h-full z-10 relative cursor-grab active:cursor-grabbing" />

      {/* Controls - only render if showControls is true */}
      {showControls && (
        <>
          {/* Bottom Left: Controls - Floating Toolbar */}
          <div className="!absolute !bottom-4 !left-4 flex items-center gap-2 !z-[100]">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white shadow-lg rounded-xl border border-slate-200 p-1 gap-0.5">
              <button 
                onClick={() => handleZoom(0.7)} 
                className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                title="Zoom Out"
              >
                <ZoomOutIcon fontSize="small" />
              </button>
              <div className="w-px h-5 bg-slate-200"></div>
              <button 
                onClick={handleReset} 
                className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                title="Reset View"
              >
                <RefreshIcon fontSize="small" />
              </button>
              <div className="w-px h-5 bg-slate-200"></div>
              <button 
                onClick={() => handleZoom(1.3)} 
                className="p-2 hover:bg-indigo-50 rounded-lg text-slate-500 hover:text-indigo-600 transition-all duration-200 active:scale-95"
                title="Zoom In"
              >
                <ZoomInIcon fontSize="small" />
              </button>
            </div>

            {/* Tree Management Controls */}
            <button
              onClick={toggleExpandAll}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg border transition-all duration-200 text-sm font-medium active:scale-95 ${
                isAllExpanded 
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300' 
                  : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isAllExpanded ? (
                <>
                  <UnfoldLessIcon fontSize="small" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <UnfoldMoreIcon fontSize="small" />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Right: Hint */}
          <div className="!absolute !bottom-4 !right-4 !z-[100]">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg text-xs text-slate-400 border border-slate-200/60">
              <span>🖱️ Drag to pan</span>
              <span className="text-slate-300">•</span>
              <span>🔍 Scroll to zoom</span>
              <span className="text-slate-300">•</span>
              <span>👆 Click node to expand/collapse</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default MindMapVisualization;

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';

interface PuzzleEdge {
  type: 'flat' | 'tab' | 'blank';
}

interface PuzzlePieceProps {
  id: number;
  position: { row: number; col: number };
  gridSize: number;
  rotation: number;
  imageUrl?: string;
  isPlaced: boolean;
  onPieceClick: (id: number) => void;
  onPieceRotate: (id: number) => void;
  onPieceDragStart?: (id: number) => void;
  onPieceDragEnd?: () => void;
  className?: string;
  edges: {
    top: PuzzleEdge;
    right: PuzzleEdge;
    bottom: PuzzleEdge;
    left: PuzzleEdge;
  };
  isDragging?: boolean;
  isSelected?: boolean;
}

// Rotate edges for counter-clockwise rotation
function rotateEdges(edges: PuzzlePieceProps['edges'], rotations: number): PuzzlePieceProps['edges'] {
  const normalizedRotations = ((rotations % 4) + 4) % 4;
  
  switch (normalizedRotations) {
    case 0:
      return edges;
    case 1: // 90 degrees counter-clockwise
      return {
        top: edges.right,
        right: edges.bottom,
        bottom: edges.left,
        left: edges.top
      };
    case 2: // 180 degrees
      return {
        top: edges.bottom,
        right: edges.left,
        bottom: edges.top,
        left: edges.right
      };
    case 3: // 270 degrees counter-clockwise (or 90 clockwise)
      return {
        top: edges.left,
        right: edges.top,
        bottom: edges.right,
        left: edges.bottom
      };
    default:
      return edges;
  }
}

// Generate piece path with perfect semicircular tabs and blanks
function generatePiecePath(edges: PuzzlePieceProps['edges'], size: number = 120) {
  const center = size / 2;
  const tabRadius = size * 0.15; // Radius for perfect semicircles
  const edgeOffset = 4; // Small offset from edge for smoother connection
  
  let path = '';
  
  // Start at top-left corner
  path += `M ${edgeOffset} ${edgeOffset}`;
  
  // Top edge
  if (edges.top.type === 'flat') {
    path += ` L ${size - edgeOffset} ${edgeOffset}`;
  } else {
    const tabStart = center - tabRadius;
    const tabEnd = center + tabRadius;
    const tabDirection = edges.top.type === 'tab' ? -tabRadius : tabRadius;
    
    // Line to start of semicircle
    path += ` L ${tabStart} ${edgeOffset}`;
    
    // Perfect semicircle using arc command
    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
    const sweepFlag = edges.top.type === 'tab' ? 0 : 1; // Controls direction of arc
    path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${tabEnd} ${edgeOffset}`;
    
    // Continue to corner
    path += ` L ${size - edgeOffset} ${edgeOffset}`;
  }
  
  // Right edge
  if (edges.right.type === 'flat') {
    path += ` L ${size - edgeOffset} ${size - edgeOffset}`;
  } else {
    const tabStart = center - tabRadius;
    const tabEnd = center + tabRadius;
    const tabDirection = edges.right.type === 'tab' ? tabRadius : -tabRadius;
    
    path += ` L ${size - edgeOffset} ${tabStart}`;
    
    const sweepFlag = edges.right.type === 'tab' ? 0 : 1;
    path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${size - edgeOffset} ${tabEnd}`;
    
    path += ` L ${size - edgeOffset} ${size - edgeOffset}`;
  }
  
  // Bottom edge
  if (edges.bottom.type === 'flat') {
    path += ` L ${edgeOffset} ${size - edgeOffset}`;
  } else {
    const tabStart = center + tabRadius;
    const tabEnd = center - tabRadius;
    const tabDirection = edges.bottom.type === 'tab' ? tabRadius : -tabRadius;
    
    path += ` L ${tabStart} ${size - edgeOffset}`;
    
    const sweepFlag = edges.bottom.type === 'tab' ? 0 : 1;
    path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${tabEnd} ${size - edgeOffset}`;
    
    path += ` L ${edgeOffset} ${size - edgeOffset}`;
  }
  
  // Left edge
  if (edges.left.type === 'flat') {
    path += ` L ${edgeOffset} ${edgeOffset}`;
  } else {
    const tabStart = center + tabRadius;
    const tabEnd = center - tabRadius;
    const tabDirection = edges.left.type === 'tab' ? -tabRadius : tabRadius;
    
    path += ` L ${edgeOffset} ${tabStart}`;
    
    const sweepFlag = edges.left.type === 'tab' ? 0 : 1;
    path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${edgeOffset} ${tabEnd}`;
    
    path += ` L ${edgeOffset} ${edgeOffset}`;
  }
  
  path += ' Z';
  return path;
}

export function PuzzlePiece({
  id,
  position,
  gridSize,
  rotation,
  imageUrl,
  isPlaced,
  onPieceClick,
  onPieceRotate,
  onPieceDragStart,
  onPieceDragEnd,
  className = '',
  edges,
  isDragging = false,
  isSelected = false
}: PuzzlePieceProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPieceClick(id);
  };
  
  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPieceRotate(id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    onPieceDragStart?.(id);
    
    // Create a custom drag image
    if (dragRef.current) {
      const rect = dragRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(dragRef.current, rect.width / 2, rect.height / 2);
    }
  };

  const handleDragEnd = () => {
    onPieceDragEnd?.();
  };
  
  // Calculate piece size based on grid size
  const basePieceSize = 120;
  const scaleFactor = Math.max(0.6, 1 - (gridSize - 3) * 0.15);
  const pieceSize = Math.floor(basePieceSize * scaleFactor);
  
  // Generate piece path with original edges (no rotation applied to path)
  const piecePath = generatePiecePath(edges, pieceSize);
  
  // Calculate rotation in degrees, normalized to 0-360
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  
  return (
    <motion.div
      ref={dragRef}
      className={`relative cursor-pointer select-none group ${className} ${
        isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
      } ${isDragging ? 'opacity-70' : ''}`}
      style={{
        width: pieceSize,
        height: pieceSize,
        filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' : 
                isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 
                'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1
      }}
      transition={{ 
        duration: 0.2
      }}
    >
      <svg
        width={pieceSize}
        height={pieceSize}
        viewBox={`0 0 ${pieceSize} ${pieceSize}`}
        className="absolute inset-0 pointer-events-none"
        style={{ 
          // Apply rotation to the entire SVG
          transform: `rotate(${normalizedRotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d={piecePath} />
          </clipPath>
          {imageUrl && (
            <pattern
              id={`pattern-${id}`}
              patternUnits="userSpaceOnUse"
              width={pieceSize}
              height={pieceSize}
              // Counter-rotate the pattern to keep image upright
              patternTransform={`rotate(${-normalizedRotation} ${pieceSize/2} ${pieceSize/2})`}
            >
              <image
                href={imageUrl}
                x={-(position.col * pieceSize)}
                y={-(position.row * pieceSize)}
                width={gridSize * pieceSize}
                height={gridSize * pieceSize}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )}
          
          {/* Enhanced shadow filter */}
          <filter id={`shadow-${id}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
          
          {/* Selection glow filter */}
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path
          d={piecePath}
          fill={imageUrl ? `url(#pattern-${id})` : `hsl(var(--primary) / 0.8)`}
          stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
          strokeWidth={isSelected ? "2.5" : "1.5"}
          clipPath={`url(#clip-${id})`}
          filter={
            isSelected 
              ? `url(#glow-${id})` 
              : (isHovered ? `url(#shadow-${id})` : undefined)
          }
          className="transition-colors duration-150"
        />
        
        {!imageUrl && (
          <text
            x={pieceSize / 2}
            y={pieceSize / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-primary-foreground text-xs font-medium pointer-events-none"
            style={{ fontSize: `${Math.max(10, pieceSize * 0.12)}px` }}
          >
            {id + 1}
          </text>
        )}
      </svg>
      
      {/* Rotation button - only show on unplaced pieces when hovered */}
      {!isPlaced && (
        <motion.button
          onClick={handleRotate}
          className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs hover:bg-primary/90 transition-colors shadow-lg border border-primary-foreground/20"
          style={{ fontSize: '9px' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isHovered || isSelected ? 1 : 0, 
            scale: isHovered || isSelected ? 1 : 0 
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
          title="逆时针旋转90°"
        >
          ↺
        </motion.button>
      )}

      {/* Selection highlight */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/5 rounded-sm pointer-events-none" />
      )}
    </motion.div>
  );
}

// Export the rotateEdges function for use in other components
export { rotateEdges };
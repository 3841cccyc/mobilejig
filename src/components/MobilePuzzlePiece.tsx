import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { useTouchEvents } from '../hooks/useTouchEvents';
import { useMobileDetection } from '../hooks/useMobileDetection';

const EDGE_OFFSET = 0;

interface PuzzleEdge {
    type: 'flat' | 'tab' | 'blank';
}

interface MobilePuzzlePieceProps {
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
    onPieceMove?: (id: number, deltaX: number, deltaY: number) => void;
    className?: string;
    edges: {
        top: PuzzleEdge;
        right: PuzzleEdge;
        bottom: PuzzleEdge;
        left: PuzzleEdge;
    };
    isDragging?: boolean;
    isSelected?: boolean;
    cellSize?: number;
    isMobile?: boolean;
}

// Generate piece path with perfect semicircular tabs and blanks
function generatePiecePath(edges: MobilePuzzlePieceProps['edges'], size: number = 120) {
    const center = size / 2;
    const tabRadius = size * 0.15;
    const edgeOffset = EDGE_OFFSET;

    let path = '';

    // Start at top-left corner
    path += `M ${edgeOffset} ${edgeOffset}`;

    // Top edge
    if (edges.top.type === 'flat') {
        path += ` L ${size - edgeOffset} ${edgeOffset}`;
    } else {
        const tabStart = center - tabRadius;
        const tabEnd = center + tabRadius;
        const sweepFlag = edges.top.type === 'tab' ? 0 : 1;
        path += ` L ${tabStart} ${edgeOffset}`;
        path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${tabEnd} ${edgeOffset}`;
        path += ` L ${size - edgeOffset} ${edgeOffset}`;
    }

    // Right edge
    if (edges.right.type === 'flat') {
        path += ` L ${size - edgeOffset} ${size - edgeOffset}`;
    } else {
        const tabStart = center - tabRadius;
        const tabEnd = center + tabRadius;
        const sweepFlag = edges.right.type === 'tab' ? 0 : 1;
        path += ` L ${size - edgeOffset} ${tabStart}`;
        path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${size - edgeOffset} ${tabEnd}`;
        path += ` L ${size - edgeOffset} ${size - edgeOffset}`;
    }

    // Bottom edge
    if (edges.bottom.type === 'flat') {
        path += ` L ${edgeOffset} ${size - edgeOffset}`;
    } else {
        const tabStart = center + tabRadius;
        const tabEnd = center - tabRadius;
        const sweepFlag = edges.bottom.type === 'tab' ? 0 : 1;
        path += ` L ${tabStart} ${size - edgeOffset}`;
        path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${tabEnd} ${size - edgeOffset}`;
        path += ` L ${edgeOffset} ${size - edgeOffset}`;
    }

    // Left edge
    if (edges.left.type === 'flat') {
        path += ` L ${edgeOffset} ${edgeOffset}`;
    } else {
        const tabStart = center + tabRadius;
        const tabEnd = center - tabRadius;
        const sweepFlag = edges.left.type === 'tab' ? 0 : 1;
        path += ` L ${edgeOffset} ${tabStart}`;
        path += ` A ${tabRadius} ${tabRadius} 0 0 ${sweepFlag} ${edgeOffset} ${tabEnd}`;
        path += ` L ${edgeOffset} ${edgeOffset}`;
    }

    path += ' Z';
    return path;
}

export function MobilePuzzlePiece({
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
    onPieceMove,
    className = '',
    edges,
    isDragging = false,
    isSelected = false,
    cellSize,
    isMobile = false
}: MobilePuzzlePieceProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dragRef = useRef<HTMLDivElement>(null);
    const { isMobile: deviceIsMobile } = useMobileDetection();

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onPieceClick(id);
    }, [id, onPieceClick]);

    const handleRotate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onPieceRotate(id);
    }, [id, onPieceRotate]);

    // 移动端触摸事件处理
    const touchHandlers = useTouchEvents({
        onTouchStart: useCallback((position) => {
            if (dragRef.current) {
                const rect = dragRef.current.getBoundingClientRect();
                setDragOffset({
                    x: position.x - rect.left - rect.width / 2,
                    y: position.y - rect.top - rect.height / 2
                });
            }
            onPieceDragStart?.(id);
        }, [id, onPieceDragStart]),

        onTouchMove: useCallback((position, delta) => {
            onPieceMove?.(id, delta.x, delta.y);
        }, [id, onPieceMove]),

        onTouchEnd: useCallback(() => {
            onPieceDragEnd?.();
        }, [onPieceDragEnd])
    });

    // 桌面端拖拽处理
    const handleDragStart = useCallback((e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', id.toString());
        e.dataTransfer.effectAllowed = 'move';
        onPieceDragStart?.(id);

        if (dragRef.current) {
            const rect = dragRef.current.getBoundingClientRect();
            const clone = dragRef.current.cloneNode(true) as HTMLElement;
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            clone.style.left = '-9999px';
            clone.style.transform = 'none';
            clone.style.margin = '0';
            clone.style.pointerEvents = 'none';
            clone.style.width = `${extendedViewBoxSize}px`;
            clone.style.height = `${extendedViewBoxSize}px`;

            document.body.appendChild(clone);
            e.dataTransfer.setDragImage(clone, Math.round(rect.width / 2), Math.round(rect.height / 2));

            requestAnimationFrame(() => {
                try { document.body.removeChild(clone); } catch (err) { /* ignore */ }
            });
        }
    }, [id, onPieceDragStart]);

    const handleDragEnd = useCallback(() => {
        onPieceDragEnd?.();
    }, [onPieceDragEnd]);

    // 计算拼图块大小
    const basePieceSize = 160;
    const scaleFactor = Math.max(0.6, 1 - (gridSize - 3) * 0.15);
    const fallbackPieceSize = Math.floor(basePieceSize * scaleFactor);
    const pieceSize = typeof cellSize === 'number' ? cellSize : fallbackPieceSize;
    const actualPieceSize = pieceSize;

    // 生成拼图块路径
    const piecePath = generatePiecePath(edges, pieceSize);
    const normalizedRotation = ((rotation % 360) + 360) % 360;

    // 计算标签扩展
    const tabRadius = actualPieceSize * 0.15;
    const viewBoxOffset = tabRadius;
    const extendedViewBoxSize = actualPieceSize + (tabRadius * 2);

    // 移动端优化：更大的触摸区域
    const touchAreaSize = isMobile || deviceIsMobile ? actualPieceSize * 1.2 : actualPieceSize;

    return (
        <motion.div
            ref={dragRef}
            className={`absolute cursor-pointer select-none group ${className}`}
            style={{
                width: actualPieceSize,
                height: actualPieceSize,
                top: '-15%',
                left: '-13%',
                transform: `translate(-50%, -50%) rotate(${normalizedRotation}deg)`,
                overflow: 'visible',
                filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' :
                    isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' :
                        'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                // 移动端增加触摸区域
                ...(isMobile || deviceIsMobile ? {
                    minWidth: touchAreaSize,
                    minHeight: touchAreaSize,
                    padding: `${(touchAreaSize - actualPieceSize) / 2}px`
                } : {})
            }}
            draggable={!(isMobile || deviceIsMobile)} // 移动端禁用HTML5拖拽
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            // 移动端触摸事件
            {...((isMobile || deviceIsMobile) ? touchHandlers.touchHandlers : {})}
            whileHover={{ scale: (isMobile || deviceIsMobile) ? 1.02 : 1.05 }}
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
                width={extendedViewBoxSize}
                height={extendedViewBoxSize}
                viewBox={`${-viewBoxOffset} ${-viewBoxOffset} ${extendedViewBoxSize} ${extendedViewBoxSize}`}
                className="absolute inset-0 pointer-events-none"
                style={{
                    transform: `rotate(${normalizedRotation}deg)`,
                    transformOrigin: 'center center',
                    overflow: 'visible'
                }}
            >
                <defs>
                    <clipPath id={`mobile-clip-${id}`}>
                        <path d={piecePath} />
                    </clipPath>
                    {imageUrl && (
                        <pattern
                            id={`mobile-pattern-${id}`}
                            patternUnits="userSpaceOnUse"
                            width={extendedViewBoxSize}
                            height={extendedViewBoxSize}
                            x={-viewBoxOffset}
                            y={-viewBoxOffset}
                        >
                            <image
                                href={imageUrl}
                                x={-(position.col * pieceSize) + 12}
                                y={-(position.row * pieceSize) + 16}
                                width={gridSize * pieceSize}
                                height={gridSize * pieceSize}
                                preserveAspectRatio="xMidYMid slice"
                            />
                        </pattern>
                    )}

                    <filter id={`mobile-shadow-${id}`}>
                        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3" />
                    </filter>

                    <filter id={`mobile-glow-${id}`}>
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <path
                    d={piecePath}
                    fill={imageUrl ? `url(#mobile-pattern-${id})` : `hsl(var(--primary) / 0.8)`}
                    fillOpacity="1"
                    stroke={isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    shapeRendering="crispEdges"
                    filter={
                        isSelected
                            ? `url(#mobile-glow-${id})`
                            : (isHovered ? `url(#mobile-shadow-${id})` : undefined)
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

            {/* 旋转按钮 - 移动端优化 */}
            {!isPlaced && (
                <motion.button
                    onClick={handleRotate}
                    className={`absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs hover:bg-primary/90 transition-colors shadow-lg border border-primary-foreground/20 ${
                        isMobile || deviceIsMobile ? 'w-6 h-6' : 'w-5 h-5'
                    }`}
                    style={{ fontSize: isMobile || deviceIsMobile ? '10px' : '9px' }}
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

            {/* 选中高亮 */}
            {isSelected && (
                <div
                    className="absolute bg-primary/5 rounded-sm pointer-events-none"
                    style={{
                        left: `${tabRadius - EDGE_OFFSET}px`,
                        top: `${tabRadius - EDGE_OFFSET}px`,
                        width: `${pieceSize}px`,
                        height: `${pieceSize}px`
                    }}
                />
            )}
        </motion.div>
    );
}

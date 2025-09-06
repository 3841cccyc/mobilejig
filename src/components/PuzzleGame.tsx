import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { PuzzlePiece, rotateEdges } from './PuzzlePiece';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { RotateCcw, Undo2, RotateCw, X } from 'lucide-react';

interface PuzzleEdge {
    type: 'flat' | 'tab' | 'blank';
}

interface GamePiece {
    id: number;
    position: { row: number; col: number };
    rotation: number;
    originalEdges: {
        top: PuzzleEdge;
        right: PuzzleEdge;
        bottom: PuzzleEdge;
        left: PuzzleEdge;
    };
    currentGridPosition?: { row: number; col: number };
    group?: number;
}

interface MoveHistory {
    type: 'place' | 'remove' | 'rotate';
    pieceId: number;
    from?: { row: number; col: number };
    to?: { row: number; col: number };
    oldRotation?: number;
    newRotation?: number;
}

interface PuzzleGameProps {
    gridSize: number;
    imageUrl?: string;
    onComplete?: (score: number, moves: number, timeElapsed: number) => void;
    onNavigate?: (page: 'home' | 'difficulty' | 'editorDifficulty') => void;
    difficulty: 'easy' | 'medium' | 'hard';
}

// Generate puzzle pieces with jigsaw edges
function generatePuzzlePieces(gridSize: number): GamePiece[] {
    const pieces: GamePiece[] = [];

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const id = row * gridSize + col;

            // Determine edges based on position and random generation
            const edges = {
                top: row === 0 ? { type: 'flat' as const } :
                    Math.random() > 0.5 ? { type: 'tab' as const } : { type: 'blank' as const },
                right: col === gridSize - 1 ? { type: 'flat' as const } :
                    Math.random() > 0.5 ? { type: 'tab' as const } : { type: 'blank' as const },
                bottom: row === gridSize - 1 ? { type: 'flat' as const } :
                    Math.random() > 0.5 ? { type: 'tab' as const } : { type: 'blank' as const },
                left: col === 0 ? { type: 'flat' as const } :
                    Math.random() > 0.5 ? { type: 'tab' as const } : { type: 'blank' as const }
            };

            // Ensure adjacent pieces have matching edges
            if (row > 0) {
                const topPiece = pieces[(row - 1) * gridSize + col];
                edges.top = topPiece.originalEdges.bottom.type === 'tab' ?
                    { type: 'blank' } : { type: 'tab' };
            }

            if (col > 0) {
                const leftPiece = pieces[row * gridSize + (col - 1)];
                edges.left = leftPiece.originalEdges.right.type === 'tab' ?
                    { type: 'blank' } : { type: 'tab' };
            }

            pieces.push({
                id,
                position: { row, col },
                rotation: Math.floor(Math.random() * 4) * 90,
                originalEdges: edges
            });
        }
    }

    return pieces.sort(() => Math.random() - 0.5);
}

export function PuzzleGame({
    gridSize,
    imageUrl,
    onComplete,
    onNavigate,
    difficulty
}: PuzzleGameProps) {

    const [pieces, setPieces] = useState<GamePiece[]>(() => generatePuzzlePieces(gridSize));
    const [puzzleGrid, setPuzzleGrid] = useState<(GamePiece | null)[][]>(() =>
        Array(gridSize).fill(null).map(() => Array(gridSize).fill(null))
    );
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [startTime] = useState(Date.now());
    const [showCompletionDialog, setShowCompletionDialog] = useState(false);
    const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);

    // Calculate dynamic sizing
    const basePieceSize = 120;
    const scaleFactor = Math.max(0.6, 1 - (gridSize - 3) * 0.15);
    const pieceSize = Math.floor(basePieceSize * scaleFactor);
    const gridCellSize = pieceSize; // Add padding for grid cells
    const puzzleAreaSize = gridSize * gridCellSize;


    // Check if two pieces can connect
    const canConnect = useCallback((piece1: GamePiece, piece2: GamePiece, direction: 'top' | 'right' | 'bottom' | 'left'): boolean => {
        const oppositeDirection = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right'
        };

        // Get actual edges after rotation
        const rotationSteps1 = Math.floor(piece1.rotation / 90);
        const rotationSteps2 = Math.floor(piece2.rotation / 90);
        const actualEdges1 = rotateEdges(piece1.originalEdges, rotationSteps1);
        const actualEdges2 = rotateEdges(piece2.originalEdges, rotationSteps2);

        const edge1 = actualEdges1[direction];
        const edge2 = actualEdges2[oppositeDirection[direction] as keyof typeof actualEdges2];

        // Tab connects to blank, flat connects to flat
        if (edge1.type === 'flat' && edge2.type === 'flat') return true;
        if (edge1.type === 'tab' && edge2.type === 'blank') return true;
        if (edge1.type === 'blank' && edge2.type === 'tab') return true;

        return false;
    }, []);

    // Get rotated position based on rotation angle
    function getRotatedPosition(originalPos: { row: number; col: number }, rotation: number, gridSize: number) {
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        const { row, col } = originalPos;

        switch (normalizedRotation) {
            case 0:
                return { row, col };
            case 90:
                return { row: col, col: gridSize - 1 - row };
            case 180:
                return { row: gridSize - 1 - row, col: gridSize - 1 - col };
            case 270:
                return { row: gridSize - 1 - col, col: row };
            default:
                return { row, col };
        }
    }

    // Check if piece can be placed at grid position
    const canPlacePiece = useCallback((piece: GamePiece, gridRow: number, gridCol: number): boolean => {
        // Check if position matches piece's correct position with current rotation
        const rotatedPosition = getRotatedPosition(piece.position, piece.rotation, gridSize);
        if (rotatedPosition.row !== gridRow || rotatedPosition.col !== gridCol) {
            return false;
        }

        // Check connections with adjacent pieces
        const directions = [
            { row: -1, col: 0, direction: 'top' as const },
            { row: 0, col: 1, direction: 'right' as const },
            { row: 1, col: 0, direction: 'bottom' as const },
            { row: 0, col: -1, direction: 'left' as const }
        ];

        for (const { row: dRow, col: dCol, direction } of directions) {
            const adjacentRow = gridRow + dRow;
            const adjacentCol = gridCol + dCol;

            if (adjacentRow >= 0 && adjacentRow < gridSize &&
                adjacentCol >= 0 && adjacentCol < gridSize) {
                const adjacentPiece = puzzleGrid[adjacentRow][adjacentCol];

                if (adjacentPiece && !canConnect(piece, adjacentPiece, direction)) {
                    return false;
                }
            }
        }

        return true;
    }, [puzzleGrid, gridSize, canConnect]);

    // Handle piece click (selection)
    const handlePieceClick = useCallback((pieceId: number) => {
        setSelectedPiece(selectedPiece === pieceId ? null : pieceId);
    }, [selectedPiece]);

    // Handle dedicated rotation button - FIXED INSTANT rotation
    const handleRotateSelected = useCallback(() => {
        if (selectedPiece === null) return;

        setPieces(prevPieces => {
            const updatedPieces = prevPieces.map(piece => {
                if (piece.id === selectedPiece) {
                    const oldRotation = piece.rotation;
                    const newRotation = (piece.rotation - 90 + 360) % 360; // Counter-clockwise

                    // Add to history
                    setMoveHistory(prev => [...prev, {
                        type: 'rotate',
                        pieceId: selectedPiece,
                        oldRotation,
                        newRotation
                    }]);

                    return { ...piece, rotation: newRotation };
                }
                return piece;
            });

            return updatedPieces;
        });

        setMoves(prev => prev + 1);
    }, [selectedPiece]);

    // Handle piece rotation (from piece component) - FIXED INSTANT rotation
    const handlePieceRotate = useCallback((pieceId: number) => {
        setPieces(prevPieces => {
            const updatedPieces = prevPieces.map(piece => {
                if (piece.id === pieceId) {
                    const oldRotation = piece.rotation;
                    const newRotation = (piece.rotation - 90 + 360) % 360; // Counter-clockwise

                    // Add to history
                    setMoveHistory(prev => [...prev, {
                        type: 'rotate',
                        pieceId,
                        oldRotation,
                        newRotation
                    }]);

                    return { ...piece, rotation: newRotation };
                }
                return piece;
            });

            return updatedPieces;
        });

        setMoves(prev => prev + 1);
    }, []);

    // Handle removing selected piece
    const handleRemoveSelected = useCallback(() => {
        if (selectedPiece === null) return;

        const piece = pieces.find(p => p.id === selectedPiece);
        if (!piece || !piece.currentGridPosition) return;

        const gridPos = piece.currentGridPosition;

        // Remove piece from grid
        const newGrid = puzzleGrid.map(row => [...row]);
        newGrid[gridPos.row][gridPos.col] = null;

        const newPieces = pieces.map(p =>
            p.id === selectedPiece
                ? { ...p, currentGridPosition: undefined }
                : p
        );

        setPuzzleGrid(newGrid);
        setPieces(newPieces);

        // Add to history
        setMoveHistory(prev => [...prev, {
            type: 'remove',
            pieceId: selectedPiece,
            from: gridPos
        }]);

        setMoves(prev => prev + 1);
        setSelectedPiece(null);
    }, [selectedPiece, pieces, puzzleGrid]);

    // Handle drag start
    const handlePieceDragStart = useCallback((pieceId: number) => {
        setDraggedPiece(pieceId);
        setSelectedPiece(pieceId);
    }, []);

    // Handle drag end
    const handlePieceDragEnd = useCallback(() => {
        setDraggedPiece(null);
    }, []);

    // Handle drop on grid cell
    const handleGridCellDrop = useCallback((e: React.DragEvent, gridRow: number, gridCol: number) => {
        e.preventDefault();

        const pieceId = parseInt(e.dataTransfer.getData('text/plain'));
        const piece = pieces.find(p => p.id === pieceId);

        if (!piece) return;

        // Check if cell is occupied
        if (puzzleGrid[gridRow][gridCol]) return;

        // Remove piece from its current position if it was placed
        const newGrid = puzzleGrid.map(row => [...row]);
        if (piece.currentGridPosition) {
            newGrid[piece.currentGridPosition.row][piece.currentGridPosition.col] = null;
        }

        // Place piece in new position
        newGrid[gridRow][gridCol] = piece;

        const oldPosition = piece.currentGridPosition;
        const newPieces = pieces.map(p =>
            p.id === pieceId
                ? { ...p, currentGridPosition: { row: gridRow, col: gridCol } }
                : p
        );

        setPuzzleGrid(newGrid);
        setPieces(newPieces);
        setSelectedPiece(pieceId);

        // Add to history
        setMoveHistory(prev => [...prev, {
            type: 'place',
            pieceId,
            from: oldPosition ? { row: oldPosition.row, col: oldPosition.col } : undefined,
            to: { row: gridRow, col: gridCol }
        }]);

        setMoves(prev => prev + 1);

        // Check for completion (only when pieces are in correct positions)
        const allCorrectlyPlaced = newPieces.every(p => {
            if (!p.currentGridPosition) return false;
            return canPlacePiece(p, p.currentGridPosition.row, p.currentGridPosition.col);
        });

        if (allCorrectlyPlaced) {
            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            const calculatedScore = calculateScore(moves + 1, timeElapsed, difficulty);
            setScore(calculatedScore);
            setGameCompleted(true);
            setShowCompletionDialog(true);
            onComplete?.(calculatedScore, moves + 1, timeElapsed);
        }
    }, [pieces, puzzleGrid, canPlacePiece, moves, startTime, difficulty, onComplete]);

    // Handle drag over grid cell
    const handleGridCellDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

<<<<<<< HEAD
    // Handle grid cell click (select or remove piece)
    const handleGridCellClick = useCallback((gridRow: number, gridCol: number) => {
        const piece = puzzleGrid[gridRow][gridCol];
        if (piece) {
            // Select the piece
            setSelectedPiece(piece.id);
=======
  // Handle removing selected piece
  const handleRemoveSelected = useCallback(() => {
    if (selectedPiece === null) return;
    
    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece || !piece.currentGridPosition) return;

    const gridPos = piece.currentGridPosition;
    
    // Remove piece from grid
    const newGrid = puzzleGrid.map(row => [...row]);
    newGrid[gridPos.row][gridPos.col] = null;
    
    const newPieces = pieces.map(p => 
      p.id === selectedPiece 
        ? { ...p, currentGridPosition: undefined }
        : p
    );
    
    setPuzzleGrid(newGrid);
    setPieces(newPieces);

    // Add to history
    setMoveHistory(prev => [...prev, {
      type: 'remove',
      pieceId: selectedPiece,
      from: gridPos
    }]);

    setMoves(prev => prev + 1);
    setSelectedPiece(null);
  }, [selectedPiece, pieces, puzzleGrid]);

  // Handle drag start
  const handlePieceDragStart = useCallback((pieceId: number) => {
    setDraggedPiece(pieceId);
    setSelectedPiece(pieceId);
  }, []);

  // Handle drag end
  const handlePieceDragEnd = useCallback(() => {
    setDraggedPiece(null);
  }, []);

  // Handle drop on grid cell
  const handleGridCellDrop = useCallback((e: React.DragEvent, gridRow: number, gridCol: number) => {
    e.preventDefault();
    
    const pieceId = parseInt(e.dataTransfer.getData('text/plain'));
    const piece = pieces.find(p => p.id === pieceId);
    
    if (!piece) return;

    // Check if cell is occupied
    if (puzzleGrid[gridRow][gridCol]) return;

    // Remove piece from its current position if it was placed
    const newGrid = puzzleGrid.map(row => [...row]);
    if (piece.currentGridPosition) {
      newGrid[piece.currentGridPosition.row][piece.currentGridPosition.col] = null;
    }

    // Place piece in new position
    newGrid[gridRow][gridCol] = piece;
    
    const oldPosition = piece.currentGridPosition;
    const newPieces = pieces.map(p => 
      p.id === pieceId 
        ? { ...p, currentGridPosition: { row: gridRow, col: gridCol } }
        : p
    );
    
    setPuzzleGrid(newGrid);
    setPieces(newPieces);
    setSelectedPiece(pieceId);

    // Add to history
    setMoveHistory(prev => [...prev, {
      type: 'place',
      pieceId,
      from: oldPosition ? { row: oldPosition.row, col: oldPosition.col } : undefined,
      to: { row: gridRow, col: gridCol }
    }]);

    setMoves(prev => prev + 1);

    // Check for completion (only when pieces are in correct positions)
    const allCorrectlyPlaced = newPieces.every(p => {
      if (!p.currentGridPosition) return false;
      return canPlacePiece(p, p.currentGridPosition.row, p.currentGridPosition.col);
    });

    if (allCorrectlyPlaced) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      const calculatedScore = calculateScore(moves + 1, timeElapsed, difficulty);
      setScore(calculatedScore);
      setGameCompleted(true);
      onComplete?.(calculatedScore, moves + 1, timeElapsed);
    }
  }, [pieces, puzzleGrid, canPlacePiece, moves, startTime, difficulty, onComplete]);

  // Handle drag over grid cell
  const handleGridCellDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle grid cell click (select or remove piece)
  const handleGridCellClick = useCallback((gridRow: number, gridCol: number) => {
    const piece = puzzleGrid[gridRow][gridCol];
    if (piece) {
      // Select the piece
      setSelectedPiece(piece.id);
    }
  }, [puzzleGrid]);

  // Handle undo - FIXED to work with rotation properly
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    
    if (lastMove.type === 'place') {
      // Undo placement
      const newGrid = puzzleGrid.map(row => [...row]);
      const newPieces = [...pieces];
      
      if (lastMove.to) {
        newGrid[lastMove.to.row][lastMove.to.col] = null;
      }
      
      const pieceIndex = newPieces.findIndex(p => p.id === lastMove.pieceId);
      if (pieceIndex !== -1) {
        newPieces[pieceIndex] = {
          ...newPieces[pieceIndex],
          currentGridPosition: lastMove.from
        };
        
        if (lastMove.from) {
          newGrid[lastMove.from.row][lastMove.from.col] = newPieces[pieceIndex];
>>>>>>> 8b91050fa05de77ec28460c27ab6e576cbdeaaab
        }
    }, [puzzleGrid]);

    // Handle undo - FIXED to work with rotation properly
    const handleUndo = useCallback(() => {
        if (moveHistory.length === 0) return;

        const lastMove = moveHistory[moveHistory.length - 1];

        if (lastMove.type === 'place') {
            // Undo placement
            const newGrid = puzzleGrid.map(row => [...row]);
            const newPieces = [...pieces];

            if (lastMove.to) {
                newGrid[lastMove.to.row][lastMove.to.col] = null;
            }

            const pieceIndex = newPieces.findIndex(p => p.id === lastMove.pieceId);
            if (pieceIndex !== -1) {
                newPieces[pieceIndex] = {
                    ...newPieces[pieceIndex],
                    currentGridPosition: lastMove.from
                };

                if (lastMove.from) {
                    newGrid[lastMove.from.row][lastMove.from.col] = newPieces[pieceIndex];
                }
            }

            setPuzzleGrid(newGrid);
            setPieces(newPieces);
        } else if (lastMove.type === 'remove') {
            // Undo removal
            const newGrid = puzzleGrid.map(row => [...row]);
            const newPieces = [...pieces];

            const pieceIndex = newPieces.findIndex(p => p.id === lastMove.pieceId);
            if (pieceIndex !== -1 && lastMove.from) {
                newPieces[pieceIndex] = {
                    ...newPieces[pieceIndex],
                    currentGridPosition: lastMove.from
                };
                newGrid[lastMove.from.row][lastMove.from.col] = newPieces[pieceIndex];
            }

            setPuzzleGrid(newGrid);
            setPieces(newPieces);
        } else if (lastMove.type === 'rotate') {
            // Undo rotation - FIXED to work instantly
            setPieces(prevPieces =>
                prevPieces.map(piece =>
                    piece.id === lastMove.pieceId && lastMove.oldRotation !== undefined
                        ? { ...piece, rotation: lastMove.oldRotation }
                        : piece
                )
            );
        }

        setMoveHistory(prev => prev.slice(0, -1));
        setMoves(prev => prev + 1);
    }, [moveHistory, puzzleGrid, pieces]);

    // Calculate score based on performance
    function calculateScore(moves: number, timeElapsed: number, difficulty: 'easy' | 'medium' | 'hard'): number {
        const baseScore = 1000;
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty];
        const timeBonus = Math.max(0, 300 - timeElapsed);
        const moveBonus = Math.max(0, (gridSize * gridSize * 2 - moves) * 10);

        return Math.floor((baseScore + timeBonus + moveBonus) * difficultyMultiplier);
    }

    // Reset game
    const handleReset = useCallback(() => {
        const newPieces = generatePuzzlePieces(gridSize);
        setPieces(newPieces);
        setPuzzleGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
        setSelectedPiece(null);
        setDraggedPiece(null);
        setGameCompleted(false);
        setScore(0);
        setMoves(0);
        setMoveHistory([]);
        setShowCompletionDialog(false);
    }, [gridSize]);

    // Get pieces not placed on grid
    const unplacedPieces = pieces.filter(piece => !piece.currentGridPosition);
    const selectedPieceData = selectedPiece !== null ? pieces.find(p => p.id === selectedPiece) : null;

<<<<<<< HEAD
    return (
        <div className="flex flex-1 min-h-0">
            {/* Central Puzzle Area - Enlarged */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="relative">
                    {/* Puzzle Grid */}
                    <div className="bg-card/95 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                        <div
                            className={`grid gap-0 ${gridSize === 3 ? 'grid-cols-3' :
                                    gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5'
                                }`}
                            style={{
                                width: `${puzzleAreaSize}px`,
                                height: `${puzzleAreaSize}px`
                            }}
                        >
                            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                                const row = Math.floor(index / gridSize);
                                const col = index % gridSize;
                                const piece = puzzleGrid[row][col];
                                const isCorrectPlacement = piece ? canPlacePiece(piece, row, col) : false;
                                const isSelected = piece && selectedPiece === piece.id;
=======
  // Reset game
  const handleReset = useCallback(() => {
    const newPieces = generatePuzzlePieces(gridSize);
    setPieces(newPieces);
    setPuzzleGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill(null)));
    setSelectedPiece(null);
    setDraggedPiece(null);
    setGameCompleted(false);
    setScore(0);
    setMoves(0);
    setMoveHistory([]);
    setStartTime(Date.now()); // Reset start time
  }, [gridSize]);
>>>>>>> 8b91050fa05de77ec28460c27ab6e576cbdeaaab

                                return (
                                    <div
                                        key={index}
                                        className="relative border-0 border-dashed flex items-center justify-center cursor-pointer"
                                        style={{
                                            width: `${gridCellSize}px`,
                                            height: `${gridCellSize}px`
                                        }}
                                        onClick={() => handleGridCellClick(row, col)}
                                        onDrop={(e) => handleGridCellDrop(e, row, col)}
                                        onDragOver={handleGridCellDragOver}
                                    >
                                        {piece && (
                                            <PuzzlePiece
                                                id={piece.id}
                                                position={piece.position}
                                                gridSize={gridSize}
                                                rotation={piece.rotation}
                                                imageUrl={imageUrl}
                                                isPlaced={true}
                                                onPieceClick={handlePieceClick}
                                                onPieceRotate={handlePieceRotate}
                                                onPieceDragStart={handlePieceDragStart}
                                                onPieceDragEnd={handlePieceDragEnd}
                                                edges={piece.originalEdges}
                                                isSelected={selectedPiece === piece.id}
                                                cellSize={gridCellSize}   //新增
                                                className=""
                                            />
                                        )}

                                        {/* Drop zone indicator */}
                                        {!piece && (
                                            <div className="w-full h-full rounded-lg bg-muted/30 opacity-0 transition-opacity duration-200 hover:opacity-100" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="absolute -bottom-4 -right-4 flex gap-2">
                        <Button
                            onClick={handleUndo}
                            disabled={moveHistory.length === 0}
                            size="sm"
                            variant="outline"
                            className="bg-card/95 backdrop-blur-sm shadow-lg"
                        >
                            <Undo2 className="size-4 mr-2" />
                            撤销
                        </Button>
                        <Button
                            onClick={handleReset}
                            size="sm"
                            variant="outline"
                            className="bg-card/95 backdrop-blur-sm shadow-lg"
                        >
                            <RotateCcw className="size-4 mr-2" />
                            重置
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Side Panel - Enlarged */}
            <div className="w-[480px] p-4 bg-card/95 backdrop-blur-sm border-l border-border space-y-4 min-h-0 flex flex-col">
                {/* Selected Piece Controls */}
                {selectedPieceData && (
                    <Card className="flex-shrink-0">
                        <CardContent className="p-4">
                            <h3 className="font-medium mb-3">选中拼图块 #{selectedPieceData.id + 1}</h3>
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleRotateSelected}
                                    variant="outline"
                                    className="w-full justify-start"
                                >
                                    <RotateCw className="size-4 mr-2" />
                                    逆时针旋转 90°
                                </Button>
                                {selectedPieceData.currentGridPosition && (
                                    <Button
                                        onClick={handleRemoveSelected}
                                        variant="outline"
                                        className="w-full justify-start text-destructive hover:text-destructive"
                                    >
                                        <X className="size-4 mr-2" />
                                        移除拼图块
                                    </Button>
                                )}
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                                <p>状态: {selectedPieceData.currentGridPosition ? '已放置' : '未放置'}</p>
                                <p>旋转: {selectedPieceData.rotation}°</p>
                                {selectedPieceData.currentGridPosition && (
                                    <p>位置: ({selectedPieceData.currentGridPosition.row + 1}, {selectedPieceData.currentGridPosition.col + 1})</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Piece Storage */}
                <Card className="flex-1 min-h-0">
                    <CardContent className="p-4 h-full flex flex-col">
                        <h3 className="font-medium mb-4 flex-shrink-0">拼图块存储 (剩余 {unplacedPieces.length} 块)</h3>
                        <div
                            className="grid gap-0 overflow-y-auto flex-1"
                            style={{
                                gridTemplateColumns: `repeat(${Math.min(5, Math.ceil(Math.sqrt(unplacedPieces.length)))}, 1fr)`,
                                gridAutoRows: 'min-content'
                            }}
                        >
                            {unplacedPieces.map((piece) => (
                                <div
                                    key={piece.id}
                                    className="relative flex items-center justify-center"
                                    style={{
                                        aspectRatio: '1',
                                        minHeight: `${Math.max(60, pieceSize * 0.8)}px`,
                                        overflow: 'visible'
                                    }}
                                >
                                    <PuzzlePiece
                                        id={piece.id}
                                        position={piece.position}
                                        gridSize={gridSize}
                                        rotation={piece.rotation}
                                        imageUrl={imageUrl}
                                        isPlaced={false}
                                        onPieceClick={handlePieceClick}
                                        onPieceRotate={handlePieceRotate}
                                        onPieceDragStart={handlePieceDragStart}
                                        onPieceDragEnd={handlePieceDragEnd}
                                        edges={piece.originalEdges}
                                        isSelected={selectedPiece === piece.id}
                                        isDragging={draggedPiece === piece.id}
                                        cellSize={gridCellSize}   // <-- 新增
                                    />
                                </div>
                            ))}
                        </div>

                        {unplacedPieces.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 flex-shrink-0">
                                <p>所有拼图块已放置！</p>
                                <p className="text-xs mt-2">正确完成拼图即可获胜</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="flex-shrink-0">
                    <CardContent className="p-4">
                        <h3 className="font-medium mb-2">操作说明</h3>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p>💡 点击选择拼图块</p>
                            <p>💡 拖拽拼图块到任意位置</p>
                            <p>💡 使用专用按钮瞬间旋转拼图块</p>
                            <p>💡 绿色边框表示正确放置</p>
                            <p>💡 红色边框表示位置错误</p>
                            <p>💡 蓝色边框表示已选中</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Completion Dialog */}
            <AnimatePresence>
                {showCompletionDialog && (
                    <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
                        <DialogContent className="sm:max-w-md">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-2xl">
                                        <motion.div
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <Trophy className="size-8 text-yellow-500" />
                                        </motion.div>
                                        🎉 拼图完成！
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6 text-center">
                                    {/* Animated sparkles */}
                                    <div className="relative">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute"
                                                style={{
                                                    left: `${20 + i * 15}%`,
                                                    top: `${10 + (i % 2) * 20}%`
                                                }}
                                                animate={{
                                                    scale: [0, 1, 0],
                                                    rotate: [0, 180, 360],
                                                    opacity: [0, 1, 0]
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <Sparkles className="size-4 text-yellow-400" />
                                            </motion.div>
                                        ))}

                                        <div className="py-8">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
                                                className="text-4xl font-mono text-primary"
                                            >
                                                {score.toLocaleString()}
                                            </motion.div>
                                            <p className="text-sm text-muted-foreground">最终分数</p>
                                            <div className="flex justify-center gap-4 mt-4 text-xs">
                                                <Badge variant="outline">
                                                    {moves} 步完成
                                                </Badge>
                                                <Badge variant="outline">
                                                    {Math.floor((Date.now() - startTime) / 1000)} 秒
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleReset}
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                            >
                                                再玩一次
                                            </Button>
                                            <Button
                                                onClick={() => onNavigate?.('difficulty')}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                更改难度
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={() => onNavigate?.('home')}
                                            variant="ghost"
                                            className="w-full"
                                        >
                                            <Home className="size-4 mr-2" />
                                            返回主页
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
<<<<<<< HEAD
    );
}
=======
      </div>

      {/* Right Side Panel - Enlarged */}
      <div className="w-[480px] p-4 bg-card/95 backdrop-blur-sm border-l border-border space-y-4 min-h-0 flex flex-col">
        {/* Selected Piece Controls */}
        {selectedPieceData && (
          <Card className="flex-shrink-0">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">选中拼图块 #{selectedPieceData.id + 1}</h3>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleRotateSelected}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <RotateCw className="size-4 mr-2" />
                  逆时针旋转 90°
                </Button>
                {selectedPieceData.currentGridPosition && (
                  <Button
                    onClick={handleRemoveSelected}
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <X className="size-4 mr-2" />
                    移除拼图块
                  </Button>
                )}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                <p>状态: {selectedPieceData.currentGridPosition ? '已放置' : '未放置'}</p>
                <p>旋转: {selectedPieceData.rotation}°</p>
                {selectedPieceData.currentGridPosition && (
                  <p>位置: ({selectedPieceData.currentGridPosition.row + 1}, {selectedPieceData.currentGridPosition.col + 1})</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Piece Storage */}
        <Card className="flex-1 min-h-0">
          <CardContent className="p-4 h-full flex flex-col">
            <h3 className="font-medium mb-4 flex-shrink-0">拼图块存储 (剩余 {unplacedPieces.length} 块)</h3>
            <div 
              className="grid gap-0 overflow-y-auto flex-1"
              style={{ 
                gridTemplateColumns: `repeat(${Math.min(5, Math.ceil(Math.sqrt(unplacedPieces.length)))}, 1fr)`,
                gridAutoRows: 'min-content'
              }}
            >
              {unplacedPieces.map((piece) => (
                <div
                  key={piece.id}
                  className="relative flex items-center justify-center"
                  style={{ 
                    aspectRatio: '1',
                    minHeight: `${Math.max(60, pieceSize * 0.8)}px`,
                    overflow: 'visible'
                  }}
                >
                  <PuzzlePiece
                    id={piece.id}
                    position={piece.position}
                    gridSize={gridSize}
                    rotation={piece.rotation}
                    imageUrl={imageUrl}
                    isPlaced={false}
                    onPieceClick={handlePieceClick}
                    onPieceRotate={handlePieceRotate}
                    onPieceDragStart={handlePieceDragStart}
                    onPieceDragEnd={handlePieceDragEnd}
                    edges={piece.originalEdges}
                    isSelected={selectedPiece === piece.id}
                    isDragging={draggedPiece === piece.id}
                  />
                </div>
              ))}
            </div>
            
            {unplacedPieces.length === 0 && (
              <div className="text-center text-muted-foreground py-8 flex-shrink-0">
                <p>所有拼图块已放置！</p>
                <p className="text-xs mt-2">正确完成拼图即可获胜</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="flex-shrink-0">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">操作说明</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 点击选择拼图块</p>
              <p>💡 拖拽拼图块到任意位置</p>
              <p>💡 使用专用按钮瞬间旋转拼图块</p>
              <p>💡 绿色边框表示正确放置</p>
              <p>💡 红色边框表示位置错误</p>
              <p>💡 蓝色边框表示已选中</p>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
>>>>>>> 8b91050fa05de77ec28460c27ab6e576cbdeaaab

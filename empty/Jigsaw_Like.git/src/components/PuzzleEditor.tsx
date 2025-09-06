import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { PuzzlePiece, rotateEdges } from './PuzzlePiece';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Upload, Play, Save, RotateCcw, Image as ImageIcon, Undo2, RotateCw, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface PuzzleEditorProps {
  gridSize: number;
  onSave?: (puzzleData: any) => void;
  onTest?: (puzzleData: any) => void;
  initialImage?: string;
}

interface EditorPiece {
  id: number;
  position: { row: number; col: number };
  rotation: number;
  originalEdges: {
    top: { type: 'flat' | 'tab' | 'blank' };
    right: { type: 'flat' | 'tab' | 'blank' };
    bottom: { type: 'flat' | 'tab' | 'blank' };
    left: { type: 'flat' | 'tab' | 'blank' };
  };
  currentGridPosition?: { row: number; col: number };
}

interface MoveHistory {
  type: 'place' | 'remove' | 'rotate';
  pieceId: number;
  from?: { row: number; col: number };
  to?: { row: number; col: number };
  oldRotation?: number;
  newRotation?: number;
}

// Generate editable puzzle pieces
function generateEditorPieces(gridSize: number): EditorPiece[] {
  const pieces: EditorPiece[] = [];
  
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const id = row * gridSize + col;
      
      // Generate default edges
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
        rotation: 0,
        originalEdges: edges,
        currentGridPosition: { row, col }
      });
    }
  }
  
  return pieces;
}

export function PuzzleEditor({ 
  gridSize, 
  onSave, 
  onTest, 
  initialImage 
}: PuzzleEditorProps) {
  const { isSfxOn } = useSettings(); // <-- 1. 获取音效设置
  const [pieces, setPieces] = useState<EditorPiece[]>(() => generateEditorPieces(gridSize));
  const [puzzleGrid, setPuzzleGrid] = useState<(EditorPiece | null)[][]>(() => {
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    const initialPieces = generateEditorPieces(gridSize);
    
    initialPieces.forEach(piece => {
      if (piece.currentGridPosition) {
        grid[piece.currentGridPosition.row][piece.currentGridPosition.col] = piece;
      }
    });
    
    return grid;
  });
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null);
  const [puzzleImage, setPuzzleImage] = useState<string>(initialImage || '');
  const [editorMode, setEditorMode] = useState<'design' | 'test'>('design');
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);

  // 2. 准备音效文件 (请将音效文件放入 public/sounds 目录)
  // const dragSound = useMemo(() => new Audio('/sounds/drag_start.mp3'), []);
  // const dropSound = useMemo(() => new Audio('/sounds/drop_end.mp3'), []);

  // Calculate dynamic sizing
  const basePieceSize = 120;
  const scaleFactor = Math.max(0.6, 1 - (gridSize - 3) * 0.15);
  const pieceSize = Math.floor(basePieceSize * scaleFactor);
  const gridCellSize = pieceSize + 8;
  const puzzleAreaSize = gridSize * gridCellSize;

  // Handle piece click (selection)
  const handlePieceClick = useCallback((pieceId: number) => {
    setSelectedPiece(selectedPiece === pieceId ? null : pieceId);
  }, [selectedPiece]);

  // Handle dedicated rotation button - INSTANT rotation
  const handleRotateSelected = useCallback(() => {
    if (selectedPiece === null) return;
    
    const piece = pieces.find(p => p.id === selectedPiece);
    if (!piece) return;

    const oldRotation = piece.rotation;
    const newRotation = (piece.rotation - 90 + 360) % 360; // Counter-clockwise

    // INSTANT rotation - no state delays
    setPieces(prevPieces => 
      prevPieces.map(piece => 
        piece.id === selectedPiece 
          ? { ...piece, rotation: newRotation }
          : piece
      )
    );

    // Add to history in test mode
    if (editorMode === 'test') {
      setMoveHistory(prev => [...prev, {
        type: 'rotate',
        pieceId: selectedPiece,
        oldRotation,
        newRotation
      }]);
    }
  }, [selectedPiece, pieces, editorMode]);

  // Handle piece rotation (from piece component) - INSTANT rotation
  const handlePieceRotate = useCallback((pieceId: number) => {
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece) return;

    const oldRotation = piece.rotation;
    const newRotation = (piece.rotation - 90 + 360) % 360; // Counter-clockwise

    // INSTANT rotation - no state delays
    setPieces(prevPieces => 
      prevPieces.map(piece => 
        piece.id === pieceId 
          ? { ...piece, rotation: newRotation }
          : piece
      )
    );

    // Add to history in test mode
    if (editorMode === 'test') {
      setMoveHistory(prev => [...prev, {
        type: 'rotate',
        pieceId,
        oldRotation,
        newRotation
      }]);
    }
  }, [pieces, editorMode]);

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

    // Add to history in test mode
    if (editorMode === 'test') {
      setMoveHistory(prev => [...prev, {
        type: 'remove',
        pieceId: selectedPiece,
        from: gridPos
      }]);
    }

    setSelectedPiece(null);
  }, [selectedPiece, pieces, puzzleGrid, editorMode]);

  // Handle drag start
  const handlePieceDragStart = useCallback((pieceId: number) => {
    if (isSfxOn) {
      // dragSound.currentTime = 0;
      // dragSound.play();
      console.log("SFX: Drag Start"); // 播放拖拽开始音效
    }
    setDraggedPiece(pieceId);
    setSelectedPiece(pieceId);
  }, [isSfxOn]);

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

    // 播放放置音效
    if (isSfxOn) {
        // dropSound.currentTime = 0;
        // dropSound.play();
        console.log("SFX: Drop End");
    }

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

    // Add to history in test mode
    if (editorMode === 'test') {
      setMoveHistory(prev => [...prev, {
        type: 'place',
        pieceId,
        from: oldPosition ? { row: oldPosition.row, col: oldPosition.col } : undefined,
        to: { row: gridRow, col: gridCol }
      }]);
    }
  }, [pieces, puzzleGrid, editorMode, isSfxOn]);

  // Handle drag over grid cell
  const handleGridCellDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle grid cell click (select piece)
  const handleGridCellClick = useCallback((gridRow: number, gridCol: number) => {
    const piece = puzzleGrid[gridRow][gridCol];
    if (piece) {
      // Select the piece
      setSelectedPiece(piece.id);
    }
  }, [puzzleGrid]);

  // Handle undo (test mode only)
  const handleUndo = useCallback(() => {
    if (editorMode !== 'test' || moveHistory.length === 0) return;

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
      // Undo rotation - INSTANT
      const newPieces = pieces.map(piece => 
        piece.id === lastMove.pieceId && lastMove.oldRotation !== undefined
          ? { ...piece, rotation: lastMove.oldRotation }
          : piece
      );
      setPieces(newPieces);
    }

    setMoveHistory(prev => prev.slice(0, -1));
  }, [editorMode, moveHistory, puzzleGrid, pieces]);

  // Shuffle pieces for testing
  const handleShufflePieces = useCallback(() => {
    const shuffledPieces = pieces.map(piece => ({
      ...piece,
      rotation: Math.floor(Math.random() * 4) * 90,
      currentGridPosition: undefined
    }));
    
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    setPieces(shuffledPieces.sort(() => Math.random() - 0.5));
    setPuzzleGrid(newGrid);
    setSelectedPiece(null);
    setMoveHistory([]);
    setEditorMode('test');
  }, [pieces, gridSize]);

  // Reset to design mode
  const handleResetToDesign = useCallback(() => {
    const resetPieces = pieces.map(piece => ({
      ...piece,
      rotation: 0,
      currentGridPosition: { row: piece.position.row, col: piece.position.col }
    }));
    
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    resetPieces.forEach(piece => {
      if (piece.currentGridPosition) {
        newGrid[piece.currentGridPosition.row][piece.currentGridPosition.col] = piece;
      }
    });
    
    setPieces(resetPieces);
    setPuzzleGrid(newGrid);
    setSelectedPiece(null);
    setMoveHistory([]);
    setEditorMode('design');
  }, [pieces, gridSize]);

  // Handle image upload
  const handleImageUpload = () => {
    const imageUrl = prompt('请输入图片URL (或在实际应用中选择文件):');
    if (imageUrl) {
      setPuzzleImage(imageUrl);
    }
  };

  // Handle save
  const handleSave = () => {
    const puzzleData = {
      pieces,
      gridSize,
      image: puzzleImage,
      timestamp: Date.now()
    };
    onSave?.(puzzleData);
  };

  // Handle test
  const handleTest = () => {
    const puzzleData = {
      pieces,
      gridSize,
      image: puzzleImage
    };
    onTest?.(puzzleData);
  };

  const unplacedPieces = pieces.filter(piece => !piece.currentGridPosition);
  const selectedPieceData = selectedPiece !== null ? pieces.find(p => p.id === selectedPiece) : null;

  return (
    <div className="flex flex-1 min-h-0">
      {/* Central Puzzle Area - Enlarged */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Mode Indicator */}
        <div className="mb-4">
          <Badge variant={editorMode === 'design' ? 'default' : 'secondary'}>
            {editorMode === 'design' ? '设计模式' : '测试模式'}
          </Badge>
        </div>

        <div className="relative">
          {/* Puzzle Grid */}
          <Card className="bg-card/95 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div 
                className={`grid gap-1 ${
                  gridSize === 3 ? 'grid-cols-3' :
                  gridSize === 4 ? 'grid-cols-4' : 'grid-cols-5'
                }`}
                style={{ 
                  width: `${puzzleAreaSize + 16}px`,
                  height: `${puzzleAreaSize + 16}px`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                  const row = Math.floor(index / gridSize);
                  const col = index % gridSize;
                  const piece = puzzleGrid[row][col];
                  const isSelected = piece && selectedPiece === piece.id;
                  
                  return (
                    <div
                      key={index}
                      className={`border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150 relative ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : editorMode === 'design' 
                          ? 'border-solid border-muted-foreground/30 hover:border-muted-foreground/60'
                          : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/60'
                      }`}
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
                          imageUrl={puzzleImage}
                          isPlaced={true}
                          onPieceClick={handlePieceClick}
                          onPieceRotate={handlePieceRotate}
                          onPieceDragStart={handlePieceDragStart}
                          onPieceDragEnd={handlePieceDragEnd}
                          edges={piece.originalEdges}
                          isSelected={selectedPiece === piece.id}
                          className="absolute"
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
            </CardContent>
          </Card>

          {/* Control Buttons */}
          <div className="absolute -bottom-4 -right-4 flex gap-2">
            {editorMode === 'design' ? (
              <>
                <Button
                  onClick={handleShufflePieces}
                  size="sm"
                  variant="outline"
                  className="bg-card/95 backdrop-blur-sm shadow-lg"
                >
                  <Play className="size-4 mr-2" />
                  测试
                </Button>
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 shadow-lg"
                >
                  <Save className="size-4 mr-2" />
                  保存
                </Button>
              </>
            ) : (
              <>
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
                  onClick={handleResetToDesign}
                  size="sm"
                  variant="outline"
                  className="bg-card/95 backdrop-blur-sm shadow-lg"
                >
                  <RotateCcw className="size-4 mr-2" />
                  返回设计
                </Button>
              </>
            )}
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
                {selectedPieceData.currentGridPosition && editorMode === 'test' && (
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

        {/* Image Settings */}
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">拼图图片</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {puzzleImage ? (
                <img 
                  src={puzzleImage} 
                  alt="Puzzle"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="size-12 mx-auto mb-2" />
                  <p className="text-sm">暂无图片</p>
                </div>
              )}
            </div>
            <Button 
              onClick={handleImageUpload}
              variant="outline"
              className="w-full"
            >
              <Upload className="size-4 mr-2" />
              上传图片
            </Button>
          </CardContent>
        </Card>

        {/* Piece Storage (Test Mode) */}
        {editorMode === 'test' && unplacedPieces.length > 0 && (
          <Card className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">拼图块存储 (剩余 {unplacedPieces.length})</CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              <div 
                className="grid gap-[3%] overflow-y-auto flex-1"
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
                      minHeight: `${Math.max(60, pieceSize * 0.8)}px`
                    }}
                  >
                    <PuzzlePiece
                      id={piece.id}
                      position={piece.position}
                      gridSize={gridSize}
                      rotation={piece.rotation}
                      imageUrl={puzzleImage}
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
            </CardContent>
          </Card>
        )}

        {/* Editor Tools */}
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle className="text-lg">编辑器工具</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>网格大小:</span>
                <span>{gridSize}x{gridSize}</span>
              </div>
              <div className="flex justify-between">
                <span>拼图块数:</span>
                <span>{gridSize * gridSize}</span>
              </div>
              <div className="flex justify-between">
                <span>当前模式:</span>
                <Badge variant={editorMode === 'design' ? 'default' : 'secondary'}>
                  {editorMode === 'design' ? '设计' : '测试'}
                </Badge>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• 点击选择拼图块</p>
              <p>• 拖拽移动拼图块位置</p>
              <p>• 使用专用按钮瞬间旋转拼图块</p>
              <p>• 设计模式: 编辑拼图布局</p>
              <p>• 测试模式: 体验拼图游戏</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
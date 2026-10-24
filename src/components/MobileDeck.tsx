/**
 * Minimalist Touch Stream Deck Interface
 * Supports multi-span buttons (1x1, 2x1, 1x2, 2x2), interactive gadgets,
 * and Hold-and-Drag reordering with neighbor displacement (reflow).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOBS } from '../context/OBSContext';
import { DeckButton } from '../types';
import { DeckButtonComponent } from './DeckButtonComponent';
import { ButtonEditModal } from './ButtonEditModal';
import { QuickVolumeModal } from './QuickVolumeModal';
import { IconRenderer } from './IconRenderer';
import {
  Plus,
} from 'lucide-react';

interface MobileDeckProps {
  onTriggerHaptic: (pattern?: number) => void;
  isEditMode: boolean;
}

export const MobileDeck: React.FC<MobileDeckProps> = ({
  onTriggerHaptic,
  isEditMode,
}) => {
  const {
    streamState,
    gridConfig,
    buttons,
    reorderButtons,
  } = useOBS();

  const [editingButton, setEditingButton] = useState<DeckButton | null>(null);
  const [volumeModalInput, setVolumeModalInput] = useState<string | null>(null);

  // Drag and drop state
  const [draggedButton, setDraggedButton] = useState<DeckButton | null>(null);
  const [dragPointer, setDragPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ row: number; col: number } | null>(null);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const dragActiveRef = useRef<boolean>(false);
  const currentDragBtnRef = useRef<DeckButton | null>(null);
  const hoverTargetRef = useRef<{ row: number; col: number } | null>(null);
  const dragStartCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  const pageButtons = buttons.filter(b => b.page === gridConfig.currentPage);

  // Helper to find button at given row & col
  const getButtonAt = (row: number, col: number) => {
    return pageButtons.find(b => b.row === row && b.col === col);
  };

  // Helper to determine if a cell is covered by an adjacent spanning button (colSpan=2 or rowSpan=2)
  const isCellCoveredBySpan = (r: number, c: number): boolean => {
    return pageButtons.some(btn => {
      if (btn.row === r && btn.col === c) return false;
      const isColSpanCovered =
        btn.colSpan === 2 && btn.row === r && c === btn.col + 1;
      const isRowSpanCovered =
        btn.rowSpan === 2 && btn.col === c && r === btn.row + 1;
      const isBothCovered =
        btn.colSpan === 2 && btn.rowSpan === 2 && r === btn.row + 1 && c === btn.col + 1;
      return isColSpanCovered || isRowSpanCovered || isBothCovered;
    });
  };

  // Calculate grid cell under pointer coordinates
  const calculateGridCell = useCallback((clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const col = Math.floor((relX / rect.width) * gridConfig.cols);
    const row = Math.floor((relY / rect.height) * gridConfig.rows);

    const clampedCol = Math.max(0, Math.min(gridConfig.cols - 1, col));
    const clampedRow = Math.max(0, Math.min(gridConfig.rows - 1, row));

    return { row: clampedRow, col: clampedCol };
  }, [gridConfig.cols, gridConfig.rows]);

  // Pointer drag listeners attached to window during drag
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStartCoordsRef.current || !currentDragBtnRef.current) return;

      const dist = Math.hypot(
        e.clientX - dragStartCoordsRef.current.x,
        e.clientY - dragStartCoordsRef.current.y
      );

      // If moved > 8px or edit mode, activate drag
      if (!dragActiveRef.current && (dist > 8 || isEditMode)) {
        dragActiveRef.current = true;
        setDraggedButton(currentDragBtnRef.current);
        onTriggerHaptic(25);
      }

      if (dragActiveRef.current) {
        setDragPointer({ x: e.clientX, y: e.clientY });
        const cell = calculateGridCell(e.clientX, e.clientY);
        if (cell) {
          hoverTargetRef.current = cell;
          setHoverTarget(cell);
        }
      }
    };

    const handlePointerUp = () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (dragActiveRef.current && currentDragBtnRef.current && hoverTargetRef.current) {
        const { row, col } = hoverTargetRef.current;
        reorderButtons(currentDragBtnRef.current.id, row, col);
        onTriggerHaptic(30);
      }

      dragActiveRef.current = false;
      currentDragBtnRef.current = null;
      dragStartCoordsRef.current = null;
      hoverTargetRef.current = null;
      setDraggedButton(null);
      setDragPointer(null);
      setHoverTarget(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [calculateGridCell, isEditMode, onTriggerHaptic, reorderButtons]);

  const handleStartDrag = (button: DeckButton, e: React.PointerEvent) => {
    // Left click or touch only
    if (e.button !== 0) return;

    dragStartCoordsRef.current = { x: e.clientX, y: e.clientY };
    currentDragBtnRef.current = button;

    // In Edit mode, immediate readiness
    if (isEditMode) {
      dragActiveRef.current = true;
      setDraggedButton(button);
      setDragPointer({ x: e.clientX, y: e.clientY });
      onTriggerHaptic(20);
      return;
    }

    // Long press timer (280ms) for normal mode
    longPressTimerRef.current = window.setTimeout(() => {
      dragActiveRef.current = true;
      setDraggedButton(button);
      setDragPointer({ x: e.clientX, y: e.clientY });
      onTriggerHaptic(35);
    }, 280);
  };

  const handleEmptyCellClick = (row: number, col: number) => {
    onTriggerHaptic(20);
    const newBtn: DeckButton = {
      id: `btn_p${gridConfig.currentPage}_${row}_${col}_${Date.now()}`,
      page: gridConfig.currentPage,
      row,
      col,
      colSpan: 1,
      rowSpan: 1,
      title: 'Novo Botão',
      icon: 'Gamepad2',
      color: 'blue',
      actionType: 'CHANGE_SCENE',
      actionPayload: {
        sceneName: streamState.scenes[0] || 'Gameplay',
      },
    };
    setEditingButton(newBtn);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden bg-zinc-50 dark:bg-[#07080c] p-2 md:p-3 transition-colors select-none">
      {/* Main Grid Viewport with Support for Spans (1x1, 2x1, 1x2, 2x2) and Explicit Coordinate Placement */}
      <div
        ref={gridRef}
        className="grid gap-1.5 md:gap-2.5 flex-1 w-full min-h-0 relative touch-none"
        style={{
          gridTemplateRows: `repeat(${gridConfig.rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${gridConfig.cols}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: gridConfig.rows }).map((_, rIdx) =>
          Array.from({ length: gridConfig.cols }).map((_, cIdx) => {
            const isHoveredTarget =
              hoverTarget?.row === rIdx && hoverTarget?.col === cIdx && draggedButton;

            // Check if this cell is covered by an adjacent span
            if (isCellCoveredBySpan(rIdx, cIdx)) {
              return null;
            }

            const btn = getButtonAt(rIdx, cIdx);

            if (!btn) {
              return (
                <div
                  key={`empty_${rIdx}_${cIdx}`}
                  style={{
                    gridRowStart: rIdx + 1,
                    gridRowEnd: rIdx + 2,
                    gridColumnStart: cIdx + 1,
                    gridColumnEnd: cIdx + 2,
                  }}
                  onClick={() => isEditMode && handleEmptyCellClick(rIdx, cIdx)}
                  className={`w-full h-full rounded-xl border flex items-center justify-center transition-all ${
                    isHoveredTarget
                      ? 'border-2 border-dashed border-blue-500 bg-blue-500/15 ring-2 ring-blue-500/30'
                      : isEditMode
                      ? 'border-dashed border-zinc-300 dark:border-white/10 hover:border-blue-500 hover:bg-blue-500/5 cursor-pointer text-zinc-400 dark:text-zinc-600 hover:text-blue-500'
                      : 'border-zinc-200/50 dark:border-white/[0.02] bg-white/40 dark:bg-white/[0.01]'
                  }`}
                >
                  {isEditMode && <Plus className="w-5 h-5" />}
                </div>
              );
            }

            const isCurrentlyDragged = draggedButton?.id === btn.id;

            return (
              <div
                key={btn.id}
                style={{
                  gridRowStart: rIdx + 1,
                  gridRowEnd: `span ${btn.rowSpan || 1}`,
                  gridColumnStart: cIdx + 1,
                  gridColumnEnd: `span ${btn.colSpan || 1}`,
                }}
                className={`relative w-full h-full ${
                  isHoveredTarget && !isCurrentlyDragged
                    ? 'ring-2 ring-blue-500 rounded-2xl'
                    : ''
                }`}
              >
                <DeckButtonComponent
                  button={btn}
                  isEditMode={isEditMode}
                  onEditClick={() => setEditingButton(btn)}
                  onTriggerHaptic={onTriggerHaptic}
                  isDragging={isCurrentlyDragged}
                  onStartDrag={handleStartDrag}
                  onOpenVolumeModal={inputName => setVolumeModalInput(inputName)}
                />
              </div>
            );
          })
        )}
      </div>

      {/* Floating Drag Preview Ghost following cursor/finger */}
      {draggedButton && dragPointer && (
        <div
          style={{
            position: 'fixed',
            left: dragPointer.x - 45,
            top: dragPointer.y - 45,
            width: draggedButton.colSpan === 2 ? 140 : 90,
            height: draggedButton.rowSpan === 2 ? 140 : 90,
            zIndex: 9999,
          }}
          className="pointer-events-none rounded-2xl bg-zinc-900 text-white border-2 border-blue-500 shadow-2xl flex flex-col items-center justify-center gap-1.5 p-2 opacity-90 scale-105 animate-in fade-in duration-75"
        >
          <IconRenderer name={draggedButton.icon} size={24} className="text-blue-400" />
          <span className="text-[10px] font-bold truncate max-w-[80px]">
            {draggedButton.title}
          </span>
          <span className="text-[8px] font-mono text-zinc-400 uppercase">
            Arrastando
          </span>
        </div>
      )}

      {/* Button Edit Modal */}
      {editingButton && (
        <ButtonEditModal
          button={editingButton}
          isOpen={!!editingButton}
          onClose={() => setEditingButton(null)}
        />
      )}

      {/* Quick Volume Adjustment Modal (Triggered by Long-Press or Right-Click) */}
      <QuickVolumeModal
        isOpen={Boolean(volumeModalInput)}
        onClose={() => setVolumeModalInput(null)}
        inputName={volumeModalInput || ''}
        onTriggerHaptic={onTriggerHaptic}
      />
    </div>
  );
};

/**
 * Advanced Button & Volume Fader Customization Modal
 * Controls background color, text color, border color/width, icon/icon size,
 * grid span (1x1, 2x1, 1x2, 2x2), and action parameters.
 */

import React, { useState } from 'react';
import { useOBS } from '../context/OBSContext';
import { ActionType, ButtonColor, DeckButton, GadgetType, IconSize } from '../types';
import { IconRenderer, AVAILABLE_ICONS } from './IconRenderer';
import { X, Trash2, Check, Search, Palette, Zap } from 'lucide-react';

interface ButtonEditModalProps {
  button: DeckButton | null;
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS: { id: ButtonColor; label: string; hex: string }[] = [
  { id: 'slate', label: 'Grafite', hex: '#1e293b' },
  { id: 'blue', label: 'Azul', hex: '#2563eb' },
  { id: 'emerald', label: 'Verde', hex: '#059669' },
  { id: 'rose', label: 'Vermelho', hex: '#e11d48' },
  { id: 'amber', label: 'Âmbar', hex: '#d97706' },
  { id: 'purple', label: 'Roxo', hex: '#7c3aed' },
  { id: 'cyan', label: 'Ciano', hex: '#0891b2' },
  { id: 'indigo', label: 'Índigo', hex: '#4f46e5' },
];

const getContrastRatio = (background: string, foreground: string): number | null => {
  const toLuminance = (hex: string) => {
    const match = /^#?([a-f\d]{6})$/i.exec(hex);
    if (!match) return null;
    const channels = [0, 2, 4].map(offset => parseInt(match[1].slice(offset, offset + 2), 16) / 255);
    const [red, green, blue] = channels.map(channel =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };

  const backgroundLuminance = toLuminance(background);
  const foregroundLuminance = toLuminance(foreground);
  if (backgroundLuminance === null || foregroundLuminance === null) return null;
  const lighter = Math.max(backgroundLuminance, foregroundLuminance);
  const darker = Math.min(backgroundLuminance, foregroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

export const ButtonEditModal: React.FC<ButtonEditModalProps> = ({ button, isOpen, onClose }) => {
  const { streamState, soundboardItems, saveButton, deleteButton } = useOBS();

  const [activeTab, setActiveTab] = useState<'appearance' | 'action'>('appearance');

  // Appearance states
  const [title, setTitle] = useState(button?.title || '');
  const [icon, setIcon] = useState(button?.icon || 'Radio');
  const [iconSize, setIconSize] = useState<IconSize>(button?.customStyle?.iconSize || 'md');
  const [colSpan, setColSpan] = useState<1 | 2>(button?.colSpan || 1);
  const [rowSpan, setRowSpan] = useState<1 | 2>(button?.rowSpan || 1);
  const [color, setColor] = useState<ButtonColor>(button?.color || 'blue');
  const [customBg, setCustomBg] = useState(button?.customStyle?.customBg || '');
  const [customTextColor, setCustomTextColor] = useState(button?.customStyle?.customTextColor || '#ffffff');
  const [customBorderColor, setCustomBorderColor] = useState(button?.customStyle?.customBorderColor || '#3b82f6');
  const [borderWidth, setBorderWidth] = useState<number>(button?.customStyle?.borderWidth ?? 1);

  // Action states
  const [actionType, setActionType] = useState<ActionType>(button?.actionType || 'CHANGE_SCENE');
  const [sceneName, setSceneName] = useState(button?.actionPayload?.sceneName || streamState.scenes[0] || '');
  const [inputName, setInputName] = useState(button?.actionPayload?.inputName || streamState.audioInputs[0]?.name || '');
  const [soundId, setSoundId] = useState(button?.actionPayload?.soundId || soundboardItems[0]?.id || '');
  const [targetPage, setTargetPage] = useState(button?.actionPayload?.targetPage || 1);

  // Gadget states
  const [gadgetType, setGadgetType] = useState<GadgetType>(button?.gadgetConfig?.type || 'volume_fader');
  const [gadgetInput, setGadgetInput] = useState(button?.gadgetConfig?.targetInput || streamState.audioInputs[0]?.name || '');

  const [iconSearch, setIconSearch] = useState('');

  if (!isOpen || !button) return null;

  const handleSave = () => {
    const updated: DeckButton = {
      ...button,
      title: title.trim() || 'Botão',
      icon,
      color,
      colSpan,
      rowSpan,
      customStyle: {
        customBg: customBg || undefined,
        customTextColor: customTextColor || undefined,
        customBorderColor: customBorderColor || undefined,
        borderWidth,
        iconSize,
      },
      actionType,
      actionPayload: {
        sceneName: actionType === 'CHANGE_SCENE' ? sceneName : undefined,
        inputName: actionType === 'TOGGLE_MUTE' ? inputName : undefined,
        soundId: actionType === 'SOUNDBOARD_PLAY' ? soundId : undefined,
        targetPage: actionType === 'NAVIGATE_PAGE' ? Number(targetPage) : undefined,
      },
      gadgetConfig: actionType === 'GADGET' ? {
        type: gadgetType,
        targetInput: gadgetInput,
      } : undefined,
    };

    saveButton(updated);
    onClose();
  };

  const handleDelete = () => {
    deleteButton(button.id);
    onClose();
  };

  const filteredIcons = AVAILABLE_ICONS.filter(name =>
    name.toLowerCase().includes(iconSearch.toLowerCase())
  );

  const previewBg = customBg || (COLOR_PRESETS.find(p => p.id === color)?.hex || '#1e293b');
  const previewContrast = getContrastRatio(previewBg, customTextColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 md:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
      <div role="dialog" aria-modal="true" aria-labelledby="button-edit-modal-title" className="my-auto flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#0e1017]">
        {/* Header with 1:1 Live Preview */}
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/[0.06] dark:bg-black/30 sm:px-5 sm:py-3">
          <div className="flex items-center gap-3">
            {/* Live Preview Box */}
            <div
              style={{
                backgroundColor: previewBg,
                color: customTextColor,
                borderColor: customBorderColor,
                borderWidth: `${borderWidth}px`,
              }}
              className="h-12 w-12 shrink-0 rounded-xl p-1 flex flex-col items-center justify-center gap-1 shadow-xs transition-all sm:h-14 sm:w-14"
            >
              <IconRenderer name={icon} size={iconSize === 'sm' ? 16 : iconSize === 'lg' ? 28 : iconSize === 'xl' ? 32 : 22} />
              <span className="text-[9px] font-bold text-center leading-none truncate max-w-[50px]">{title || 'Botão'}</span>
            </div>

            <div>
              <h2 id="button-edit-modal-title" className="text-xs font-bold text-zinc-900 dark:text-white sm:text-sm">Personalizar Botão</h2>
              <span className="text-[10px] text-zinc-500 font-mono sm:text-xs">
                Tamanho: {colSpan}x{rowSpan} · Pág. {button.page} (L{button.row + 1}, C{button.col + 1})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar personalização"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-3 pt-1 border-b border-zinc-200 dark:border-white/[0.06] gap-1 sm:px-5 sm:pt-2 sm:gap-2">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex min-h-11 items-center gap-1.5 border-b-2 px-2 text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-xs ${
              activeTab === 'appearance'
                ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Aparência</span>
          </button>

          <button
            onClick={() => setActiveTab('action')}
            className={`flex min-h-11 items-center gap-1.5 border-b-2 px-2 text-[11px] font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-xs ${
              activeTab === 'action'
                ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Ação / Volume</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* TAB 1: APARÊNCIA */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Rótulo / Texto do Botão</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={25}
                  placeholder="Ex: Gameplay, Som do Jogo..."
                  className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Grid Span / Size selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                  Tamanho do Botão na Grade
                </label>
                <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-4">
                  {[
                    { label: '1x1 (Padrão)', cols: 1, rows: 1 },
                    { label: '2x1 (Largo)', cols: 2, rows: 1 },
                    { label: '1x2 (Alto)', cols: 1, rows: 2 },
                    { label: '2x2 (Grande)', cols: 2, rows: 2 },
                  ].map(s => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => {
                        setColSpan(s.cols as 1 | 2);
                        setRowSpan(s.rows as 1 | 2);
                      }}
                      className={`min-h-11 rounded-lg border p-2 text-xs font-medium text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                        colSpan === s.cols && rowSpan === s.rows
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-zinc-100 dark:bg-black/30 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-400 hover:border-zinc-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Background color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Cor de Fundo</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBg || '#1e293b'}
                      onChange={e => setCustomBg(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customBg}
                      onChange={e => setCustomBg(e.target.value)}
                      placeholder="Hex (ex: #2563eb)"
                      className="flex-1 px-2.5 py-1 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customTextColor}
                      onChange={e => setCustomTextColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTextColor}
                      onChange={e => setCustomTextColor(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Cor da Borda</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBorderColor}
                      onChange={e => setCustomBorderColor(e.target.value)}
                      className="w-8 h-8 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={customBorderColor}
                      onChange={e => setCustomBorderColor(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Border Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                    <span>Espessura da Borda</span>
                    <span className="font-mono">{borderWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={borderWidth}
                    onChange={e => setBorderWidth(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {previewContrast !== null && (
                <div
                  aria-live="polite"
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                    previewContrast >= 4.5
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300'
                      : 'border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-200'
                  }`}
                >
                  <span>
                    Contraste do rótulo: <strong>{previewContrast.toFixed(2)}:1</strong>
                    {previewContrast < 4.5 ? ' · abaixo de 4,5:1' : ' · adequado para texto normal'}
                  </span>
                  {previewContrast < 4.5 && (
                    <span className="flex gap-1">
                      <button type="button" onClick={() => setCustomTextColor('#ffffff')} className="min-h-11 rounded-md border border-zinc-300 bg-white px-2 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Texto claro</button>
                      <button type="button" onClick={() => setCustomTextColor('#111827')} className="min-h-11 rounded-md border border-zinc-700 bg-zinc-900 px-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Texto escuro</button>
                    </span>
                  )}
                </div>
              )}

              {/* Icon & Icon Size */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Tamanho do Ícone</label>
                  <div className="flex gap-1">
                    {[
                      { id: 'sm', label: '16px' },
                      { id: 'md', label: '24px' },
                      { id: 'lg', label: '32px' },
                      { id: 'xl', label: '40px' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setIconSize(sz.id as IconSize)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                          iconSize === sz.id
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Selecione o Ícone</span>
                    <div className="relative w-36">
                      <Search className="w-3 h-3 text-zinc-400 absolute left-2 top-2" />
                      <input
                        type="text"
                        value={iconSearch}
                        onChange={e => setIconSearch(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full pl-6 pr-2 py-1 text-[11px] bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 p-2 bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/[0.06] rounded-xl max-h-32 overflow-y-auto">
                    {filteredIcons.map(iconName => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setIcon(iconName)}
                        title={iconName}
                        className={`p-2 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          icon === iconName
                            ? 'bg-blue-600 text-white'
                            : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <IconRenderer name={iconName} className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AÇÃO OU VOLUME */}
          {activeTab === 'action' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Tipo de Controle</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as ActionType)}
                  className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="CHANGE_SCENE">Trocar Cena do OBS</option>
                  <option value="TOGGLE_MUTE">Alternar Mudo de Canal de Áudio</option>
                  <option value="SOUNDBOARD_PLAY">Tocar Efeito da Soundboard</option>
                  <option value="TOGGLE_STREAM">Iniciar / Parar Live</option>
                  <option value="TOGGLE_RECORD">Iniciar / Parar Gravação</option>
                  <option value="NAVIGATE_PAGE">Navegar para Outra Página</option>
                </select>
              </div>

              {/* STANDARD ACTION OPTIONS */}
              {actionType === 'CHANGE_SCENE' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Cena Alvo do OBS</label>
                  <select
                    value={sceneName}
                    onChange={e => setSceneName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white"
                  >
                    {streamState.scenes.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'TOGGLE_MUTE' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Canal de Áudio</label>
                  <select
                    value={inputName}
                    onChange={e => setInputName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white"
                  >
                    {streamState.audioInputs.map(input => (
                      <option key={input.name} value={input.name}>{input.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'SOUNDBOARD_PLAY' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Efeito Sonoro</label>
                  <select
                    value={soundId}
                    onChange={e => setSoundId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white"
                  >
                    {soundboardItems.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'NAVIGATE_PAGE' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">Ir Para Página</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={targetPage}
                    onChange={e => setTargetPage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-100 dark:bg-black/40 border border-zinc-300 dark:border-white/10 rounded-lg text-zinc-900 dark:text-white font-mono"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-black/30">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remover Botão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

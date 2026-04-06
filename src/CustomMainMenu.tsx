import React from 'react'
import {
  ClipboardMenuGroup,
  DefaultMainMenu,
  EditSubmenu,
  ExtrasGroup,
  KeyboardShortcutsMenuItem,
  MiscMenuGroup,
  SelectAllMenuItem,
  TldrawUiMenuGroup,
  TldrawUiMenuSubmenu,
  ToggleFocusModeItem,
  ToggleGridItem,
  ToggleLockMenuItem,
  ToggleSnapModeItem,
  ToggleToolLockItem,
  UndoRedoGroup,
  UnlockAllMenuItem,
} from 'tldraw'

export function CustomMainMenu() {
  return (
    <DefaultMainMenu>
      <EditSubmenu>
        <UndoRedoGroup />
        <ClipboardMenuGroup />
        <MiscMenuGroup />
        <TldrawUiMenuGroup id="lock">
          <ToggleLockMenuItem />
          <UnlockAllMenuItem />
        </TldrawUiMenuGroup>
        <TldrawUiMenuGroup id="select-all">
          <SelectAllMenuItem />
        </TldrawUiMenuGroup>
      </EditSubmenu>
      <ExtrasGroup />
      <TldrawUiMenuSubmenu id="preferences" label="menu.preferences">
        <TldrawUiMenuGroup id="preferences-actions">
          <ToggleSnapModeItem />
          <ToggleToolLockItem />
          <ToggleGridItem />
          <ToggleFocusModeItem />
        </TldrawUiMenuGroup>
        <TldrawUiMenuGroup id="keyboard-shortcuts">
          <KeyboardShortcutsMenuItem />
        </TldrawUiMenuGroup>
      </TldrawUiMenuSubmenu>
    </DefaultMainMenu>
  )
}

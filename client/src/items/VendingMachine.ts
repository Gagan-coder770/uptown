import { ItemType } from '../../../types/Items'
import Item from './Item'

export default class VendingMachine extends Item {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.itemType = ItemType.VENDINGMACHINE
  }

  onOverlapDialog() {
    this.setDialogBox('Press R to play games or order snacks!');
    // Listen for R key press and trigger modal
    const rKey = this.scene.input.keyboard.addKey('R');
    const openDialog = () => {
      if (this.scene.input.keyboard.checkDown(rKey, 250)) {
        window.dispatchEvent(new Event('openGameSnackDialog'));
      }
    };
    this.scene.input.keyboard.on('keydown-R', openDialog);

    // Mobile: Add a floating button only while dialog is active
    let btn: HTMLButtonElement | null = null;
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      btn = document.createElement('button');
      btn.innerText = 'Play / Order Snacks';
      btn.style.position = 'fixed';
      btn.style.bottom = '80px';
      btn.style.left = '50%';
      btn.style.transform = 'translateX(-50%)';
      btn.style.zIndex = '9999';
      btn.style.padding = '16px 32px';
      btn.style.background = '#16ff99';
      btn.style.color = '#232946';
      btn.style.border = 'none';
      btn.style.borderRadius = '12px';
      btn.style.fontWeight = 'bold';
      btn.style.fontSize = '18px';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      btn.onclick = () => {
        window.dispatchEvent(new Event('openGameSnackDialog'));
      };
      document.body.appendChild(btn);
    }
    // Clean up listeners and button when dialog is closed or player moves away
    this.once('destroy', () => {
      this.scene.input.keyboard.off('keydown-R', openDialog);
      if (btn) btn.remove();
    });
  }
}

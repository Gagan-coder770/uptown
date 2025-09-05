import { ItemType } from '../../../types/Items'
import Item from './Item'

export default class VendingMachine extends Item {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.itemType = ItemType.VENDINGMACHINE
  }

  onOverlapDialog() {
    this.setDialogBox('Press R to play games or order snacks! :');
    // Listen for R key press and trigger modal
    const rKey = this.scene.input.keyboard.addKey('R');
    const openDialog = () => {
      if (this.scene.input.keyboard.checkDown(rKey, 250)) {
        window.dispatchEvent(new Event('openGameSnackDialog'));
      }
    };
    this.scene.input.keyboard.on('keydown-R', openDialog);
    // Clean up listener when dialog is closed or player moves away
    this.once('destroy', () => {
      this.scene.input.keyboard.off('keydown-R', openDialog);
    });
  }
}

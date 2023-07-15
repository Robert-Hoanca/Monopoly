import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-theme-editor',
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.scss']
})
export class ThemeEditorComponent implements OnInit {

  @ViewChild('themeDialogRef', { static: true }) themeDialogRef:any;
  @ViewChild('saveThemesRef', { static: true }) saveThemesRef:any;
  clickedTheme:any = {};

  constructor(public gameService: GameService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  editTheme(theme:object){

    this.clickedTheme = theme;

    this.dialog.open(this.themeDialogRef, {
      panelClass: 'theme-edit-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:false,
      data: {
        theme : this.clickedTheme
      }
    });
  }

  deleteTheme(themeToDelete:any){
    const themeIndex = this.gameService.themes.findIndex((theme:any) => theme == themeToDelete);
    
    if(themeIndex){
      this.gameService.themes.splice(themeIndex,1)
    }
    
    this.closeDialog();
  }

  openSaveDialog(){

    this.dialog.open(this.saveThemesRef, {
      panelClass: 'save-themes-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose: true,
    });
  }


  saveAllThemes(){
    this.gameService.setThemesDb(this.gameService.themes);
    this.closeDialog();
  }

  closeDialog(){
    this.dialog.closeAll()
  }



}

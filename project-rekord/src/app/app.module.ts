import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { CardComponent } from './components/card/card.component';
import { PawnComponent } from './components/pawn/pawn.component';

//firestore
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//MATERIAL
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CardDialogComponent } from './shared/card-dialog/card-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChooseModeComponent } from './components/choose-mode/choose-mode.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';


//NGX THREE
import { NgxThreeModule } from 'ngx-three';
import { ThObjLoaderPipe } from './th-obj-loader.pipe';
import { ThObjLoaderDirective } from './th-obj-loader.directive';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    CardComponent,
    PawnComponent,
    CardDialogComponent,
    ChooseModeComponent,
    ThObjLoaderPipe,
    ThObjLoaderDirective,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirestore(() => getFirestore()),
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    FormsModule,
    MatDialogModule,
    FlexLayoutModule,
    MatIconModule,
    MatPaginatorModule,
    NgxThreeModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

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

//Three Js
/*import { NgtCanvasModule ,NgtCanvas} from '@angular-three/core';
import { NgtMesh } from '@angular-three/core/meshes';
import { NgtAmbientLight, NgtSpotLight, NgtPointLight, NgtAmbientLightModule, NgtPointLightModule } from '@angular-three/core/lights';
import { NgtBoxGeometry } from '@angular-three/core/geometries';
import { NgtMeshBasicMaterial, NgtMeshStandardMaterial } from '@angular-three/core/materials';
import { NgtPrimitiveModule } from '@angular-three/core/primitive';

import { NgtSobaLoaderModule } from '@angular-three/soba/loaders';
import { NgtSobaOrbitControlsModule } from '@angular-three/soba/controls';
 NgtCanvasModule,
    NgtCanvas,
    NgtAmbientLight,
    NgtSpotLight,
    NgtPointLight,
    NgtMesh,
    NgtBoxGeometry,
    NgtMeshBasicMaterial,
    NgtPrimitiveModule,
    NgtSobaLoaderModule,
    NgtSobaOrbitControlsModule,
    NgtMeshStandardMaterial*/

//NGX THREE
import { NgxThreeModule } from 'ngx-three';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    CardComponent,
    PawnComponent,
    CardDialogComponent,
    ChooseModeComponent,
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
    FormsModule,
    MatDialogModule,
    FlexLayoutModule,
    MatIconModule,
    MatPaginatorModule,
    NgxThreeModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { Injectable, Type } from '@angular/core';
import { ThAsyncLoaderService } from 'ngx-three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

@Injectable({
  providedIn: 'root'
})
export class OBJLoaderService extends ThAsyncLoaderService<OBJLoader>{
  public readonly clazz = OBJLoader;

}

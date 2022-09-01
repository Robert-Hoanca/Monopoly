import { Pipe, PipeTransform } from '@angular/core';
import { ThAsyncLoaderBasePipe } from 'ngx-three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OBJLoaderService } from './objloader.service';

@Pipe({
  name: 'thObjLoader'
})
export class ThObjLoaderPipe  extends ThAsyncLoaderBasePipe<OBJLoader> implements PipeTransform {

  constructor(protected service: OBJLoaderService) {
    super();
  }

}

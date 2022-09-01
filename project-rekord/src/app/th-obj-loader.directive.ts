import { Directive, Host, NgZone } from '@angular/core';
import { ThAsyncLoaderBaseDirective, ThObject3D } from 'ngx-three';
import { Group } from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OBJLoaderService } from './objloader.service';

@Directive({
  selector: '[loadObj]'
})
export class ThObjLoaderDirective extends ThAsyncLoaderBaseDirective<OBJLoader>{
  
  constructor(
    @Host() protected override host: ThObject3D,
    protected override zone: NgZone,
    protected service: OBJLoaderService
  ) { 
    super(host, zone);
  }

  protected getRefFromResponse(response: Group) {
    return response;
  }

  
}

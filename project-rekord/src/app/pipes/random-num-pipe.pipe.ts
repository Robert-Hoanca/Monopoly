import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'randomNumPipe'
})
export class RandomNumPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    console.log("Value", value)
    return null;
  }

}

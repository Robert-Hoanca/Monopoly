import { RandomNumPipePipe } from './random-num-pipe.pipe';

describe('RandomNumPipePipe', () => {
  it('create an instance', () => {
    const pipe = new RandomNumPipePipe();
    expect(pipe).toBeTruthy();
  });
});

import { NumberToFractionPipe } from './number-to-fraction.pipe';

describe('NumberToFractionPipe', () => {
  it('create an instance', () => {
    const pipe = new NumberToFractionPipe();
    expect(pipe).toBeTruthy();
  });
});

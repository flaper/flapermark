import {Sanitize} from '../src/index.js'
let should = require('chai').should();

describe('sanitize', () => {
  it('text', () => {
    let res = Sanitize.text(' something ');
    res.should.eq('something');
  });

  const text1 = '    &quot;Некоторый длинный  <strong>жирный</strong> текст"';

  it('html', () => {
    let res = Sanitize.html(text1);
    res.should.eq('"Некоторый длинный  жирный текст"');
  });

  it('symbolsNumber', () => {
    let len = Sanitize.symbolsNumber(text1);
    len.should.eq(27);
  });
  
  it('faker', () => {
    let text = Sanitize.fakerIncreaseAlphaLength(text1, 100);
    let len = Sanitize.symbolsNumber(text);
    len.should.least(100);
  });
});

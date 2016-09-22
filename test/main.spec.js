import {Sanitize} from '../src/sanitize'
let should = require('chai').should();

describe('FlaperMark.', () => {
  it('Sanitize gen', ()=>{
     let text = Sanitize.text(' something ');
     text.should.eq('something');
  });
});

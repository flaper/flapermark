import sanitizeHtml from 'sanitize-html';
import striptags from 'striptags';

export class Sanitize {
  /**
   * @description difference with Sanitize.text is that current method encode '"<> etc to html entities
   * @param dirty
   * @returns {*}
   */
  static html(dirty) {
    return sanitizeHtml(dirty, {
      allowedTags: [],
      allowedAttributes: [],
      textFilter: function (text) {
        return text.replace(/&quot;/g, '\"');
      }
    }).trim();
  }

  static text(dirty) {
    return striptags(dirty).trim();
  }

  static symbolsNumber(data) {
    let text = Sanitize.html(data);
    text = text.replace(/[^A-Za-z0-9а-яёА-ЯЁ]/g, '');
    return text.length;
  }

  static fakerIncreaseAlphaLength(str, length) {
    let repeat = Math.ceil(length / Sanitize.symbolsNumber(str));
    //to prevent right strings be completed removed by e.g. unclosed <script> tag
    let s = Sanitize.html(str);
    let result = s;
    for (let i = 1; i < repeat; i++) result += '\n' + s;
    return result;
  }
}

let should = require('chai').should();
import {TEST_IMAGE_ID, FlaperImage} from '@flaper/consts';
import {FlaperMark} from '../src/index.js';
import {MD_IMAGES_GROUP_CLASS} from '../src/markdown/htmlRender.js';
import {cutInlineHtml} from '../src/markdown/shortInline.js';

const GROUP_CLASS = MD_IMAGES_GROUP_CLASS;

describe('markdown', () => {
  let testId = TEST_IMAGE_ID;
  let testPath = FlaperImage.idToPath(testId) + '_middle.jpg';
  let testBucket = FlaperImage.getBucketPath();
  let testUrl = `${testBucket}${testPath}`;

  it('external image', () => {
    //external means not an image created via Image model
    let html = FlaperMark.toHTML(`![](/external.jpg)`);
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="/external.jpg" alt=""></div></div></p>`);
  });

  it('local image', () => {
    let html = FlaperMark.toHTML(`![](${testId})`);
    html.trim().should.eq(`<p><div class="${GROUP_CLASS}"><div><img src="${testUrl}" alt=""></div></div></p>`);
  });

  it('idn-domain', () => {
    let html = FlaperMark.toHTML(`http://xn--80avnr.xn--p1ai/%D0%BE%D1%80%D0%B5%D0%BD%D0%B1%D1%83%D1%80%D0%B3`);
    html.trim().should.eq('<p><a href="http://флап.рф/оренбург" target="_blank">флап.рф/оренбург</a></p>');
  });

  it('Link to flaper.org', () => {
    let html = FlaperMark.toHTML(`http://flaper.org/s/%D0%A4%D0%BB%D0%B0%D0%BF%D0%B5%D1%80`);
    html.trim().should.eq('<p><a href="http://flaper.org/s/Флапер">flaper.org/s/Флапер</a></p>');
  });

  it('Regular link', () => {
    let html = FlaperMark.toHTML('https://translate.yandex.ru/?text=тест&lang=ru-en');
    html.trim().should.eq('<p><a href="https://translate.yandex.ru/?text=тест&lang=ru-en" target="_blank">' +
      'translate.yandex.ru/?text=тест&lang=ru-en</a></p>');
  });

  it('group images', () => {
    let markdown = `![](${testId})`;
    for (let i = 0; i < 7; i++) {
      markdown += ` ![](/external${i})`;
    }
    let result = `<p><div class="${GROUP_CLASS}"><div>` +
      `<img src="${testUrl}" alt=""></div> ` +
      '<div><img src="/external0" alt=""></div> <div><img src="/external1" alt=""></div> ' +
      '<div><img src="/external2" alt=""></div> ' +
      `<div><img src="/external3" alt=""></div> ` +
      '<div><img src="/external4" alt=""></div> ' +
      '<div><img src="/external5" alt=""></div> <div><img src="/external6" alt=""></div></div></p>';


    let html = FlaperMark.toHTML(markdown);
    html.trim().should.eq(result);
  });

  describe('Text render', () => {
    it('Headers, images, paragraph', () => {
      let source = '     \n' +
        ' ## Header2\n' +
        '1p One line\n' +
        '1p Second line\n\n' +
        'New paragraph\n' +
        '### Header3\n' +
        `![](${testId})\n`;
      let text = FlaperMark.toInline(source);
      let result = '<strong>Header2</strong>\n' +
        '1p One line\n' +
        '1p Second line\n\n' +
        'New paragraph\n' +
        '<strong>Header3</strong>';
      text.should.eq(result);
    });

    it('List, hr', () => {
      let source = 'List:\n' +
        '* Item1\n' +
        '* Item2\n' +
        '* Item3\n' +
        '_________\n' +
        'Next line';
      let text = FlaperMark.toInline(source);
      let result = 'List:\n Item1 Item2 Item3\n\n' +
        'Next line';
      text.should.eq(result);
    });

    it('Sample1', () => {
      let source = require('./data/sample1');
      let text = FlaperMark.shortInline(source);
      let lines = text.split('\n');
      lines.length.should.eq(7);
    })
  });

  describe('Cut Inline html', () => {
    it('Test1', () => {
      let source = "Text <strong>length</strong> another";
      let res = cutInlineHtml(source, 5);
      res.should.eq('Text');
      res = cutInlineHtml(source, 10);
      res.should.eq('Text');
      res = cutInlineHtml(source, 11);
      res.should.eq('Text <strong>length</strong>');
      res = cutInlineHtml(source, 18);
      res.should.eq('Text <strong>length</strong>');
      res = cutInlineHtml(source, 19);
      res.should.eq('Text <strong>length</strong> another');
    });

    it('Text Attached to tag', () => {
      let source = "Text start<strong>length</strong>end another";
      let res = cutInlineHtml(source, 5);
      res.should.eq('Text');
      res = cutInlineHtml(source, 9);
      res.should.eq('Text');
      res = cutInlineHtml(source, 10);
      res.should.eq('Text start');
      res = cutInlineHtml(source, 15);
      res.should.eq('Text start');
      res = cutInlineHtml(source, 16);
      res.should.eq('Text start<strong>length</strong>');
    });

    it('Cut sample1', () => {
      let source = require('./data/sample1');
      let inline = FlaperMark.toInline(source);

      let text = cutInlineHtml(inline, 8);
      let res = '<strong>Введение</strong>';
      text.should.eq(res);

      text = cutInlineHtml(inline, 9);
      text.should.eq(res);

      text = cutInlineHtml(inline, 10);
      res += '\n1';
      text.should.eq(res);

      text = cutInlineHtml(inline, 27);
      res += ' балл - эквивалент';
      text.should.not.eq(res);

      text = cutInlineHtml(inline, 28);
      text.should.eq(res);

      text = cutInlineHtml(inline, 29);
      text.should.eq(res);

      text = cutInlineHtml(inline, 30);
      text.should.eq(res + ' <strong>1</strong>');

      text = cutInlineHtml(inline, 47);
      res += ' <strong>1 рубля</strong> на флапере.';
      text.should.not.eq(res);

      text = cutInlineHtml(inline, 48);
      text.should.eq(res);

      res += '\nНакопленные баллы можно потратить на различные';
      text = cutInlineHtml(inline, 94);
      text.should.not.eq(res);

      text = cutInlineHtml(inline, 95);
      text.should.eq(res);

      res += ' подарки';
      text = cutInlineHtml(inline, 102);
      text.should.not.eq(res);

      text = cutInlineHtml(inline, 103);
      text.should.eq(res);
      res += '.';
      text = cutInlineHtml(inline, 104);
      text.should.eq(res);
      text = cutInlineHtml(inline, 105);
      text.should.eq(res);
    });

    it('Cut sample2', () => {
      let source = require('./data/sample2');
      let text = FlaperMark.shortInline(source);

      let res = 'Оренбург! Какие ассоциации рождаются у Вас в голове?  Пуховые платки, газовая промышленность, и ... ' +
        'Чтобы расширить Ваш ассоциативный ряд - я скажу Вам, что Оренбург - это прежде всего дружелюбные горожане. ' +
        'Оренбург! Какие ассоциации рождаются у Вас в голове?  Пуховые платки, газовая промышленность, и ... ' +
        'Чтобы расширить Ваш ассоциативный ряд - я скажу Вам, что Оренбург - это прежде всего дружелюбные горожане. ' +
        'Оренбург! Какие ассоциации рождаются у Вас в голове? Пуховые';
      text.should.eq(res);
    });

    it('Cut sample3', () => {
      let source = require('./data/sample3');
      let text = FlaperMark.shortInline(source);
      let res = 'Первая версия правил, тестового режима <a href="http://flaper.org">flaper.org</a>. ' +
        'Правки / дополнения приветствуются в комментариях.\n' +
        '<strong>Статьи</strong>\n' +
        ' Статьи должны нести уникальный контент, скопированный текст вредит проекту и не приносит ' +
        'просмотров авторам.\n' +
        ' Минимальное требование на длину - от <strong>1000</strong> значимых символов. ' +
        'Рекомендуемая длина более <strong>3000</strong> символов, так как и люди и ' +
        'соотвественно поисковые системы любят хорошо раскрытый материал.\n' +
        ' <strong>О чем писать?</strong> Писать можно о чем угодно (не запрещенном законом). В статьях';
      text.should.eq(res);
    });

    it('Cut sample4 (multiple new lines)', () => {
      let source = require('./data/sample4');
      let text = FlaperMark.shortInline(source);
      let res = 'Во времена Никиты Сергеевича "Хрущева", с начала 1953 года - наша страна чем то начала меняться. ' +
        'Никто не скажет сейчас - почему. Возможно одно и тоже уже надоело и 60- годы стали для страны новым ' +
        'шагом изменений. Из черно белого фотодела выросла и цветная фотография...' +
        '\n' +
        'Когда появились цветные картинки';
      text.should.eq(res);
    });

    it('Cut sample5 (links)', () => {
      let source = require('./data/sample5');
      let text = FlaperMark.shortInline(source);
      let res = 'ссылка <a href="http://flaper.org">flaper.org</a> и далее\n' +
        'идет разбитый тег 5&lt;a  something';
      text.should.eq(res);
    });

    it('Cut sample6 (two paragraphs)', () => {
      let source = require('./data/sample6');
      let text = FlaperMark.toInline(source);
      let res = 'два абзаца\n\n' +
        'второй абзац';
      text.should.eq(res);
    });
  });

  describe('Get images', ()=> {
    it('Should get 0 images', () => {
      let source = require('./data/sample6');
      let images = FlaperMark.getImages(source);
      images.length.should.eq(0);
    });

    it('Should get 4 images', () => {
      let source = require('./data/sample_images');
      let images = FlaperMark.getImages(source);
      images.length.should.eq(4);
      let expected = ['57c384b5a5db9b354a007a4b',
        '57c384bca5db9b354a007a4c',
        '57c380eca5db9b354a007a46',
        '57c380e6a5db9b354a007a45'];
      JSON.stringify(expected).should.eq(JSON.stringify(images));
    });
  });
});

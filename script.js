function showBox(index) {
const contents =
document.querySelectorAll('.content');
contents[index].classList.toggle('active');
}
let lang = 'fg';
const head = {
  fg: '穂語辞書',
  yj: '裕語辞書',
  kl: '嘉語辞書'
}
const pronFuncs = {
  fg: calcPronFg,
  yj: calcPronYj,
  kl: calcPronKl
}
function setLang(selectedLang) {
  lang = selectedLang;
document.getElementById('title').textContent = head[lang];
  loadDic(lang);
}
function showDetail(item) {
  const detail = document.getElementById('detail');
  const spell = document.getElementById('spell');
  const mean = document.getElementById('mean');
  const qualis = document.getElementById('qualis');
  const pron = document.getElementById('pron');
  const infl = document.getElementById('infl');
  const origin = document.getElementById('origin');
  const usage = document.getElementById('usage');
  const table = document.getElementById('inflectionTable');

  spell.textContent = `${item.word}`;
  mean.textContent = `意味: ${item.mean}`;
  qualis.textContent = `属性: ${item.qualis}`;
  const pronounce = pronFuncs[lang](item.word);
  pron.textContent = `発音: ${pronounce}`;
  const toi = estmInfl(item.word,estmPos(item.qualis),lang);
  if (toi) {
    infl.style.display = 'block';
    infl.textContent = `屈折型: ${toi}型`;
  } else {
    infl.style.display = 'none';
  }
  if (item.origin) {
    origin.style.display = 'block';
    origin.innerHTML = '';
    origin.textContent = `語源:`;
    origin.appendChild(parseCont(item.origin,dicData));
    const originText = document.createElement('span');
    originText.textContent = 'から。';
    origin.appendChild(originText);
  } else {
    origin.style.display = 'none';
  }
  if (item.usage) {
    usage.style.display = 'block';
    usage.textContent = `用法: ${item.usage}`;
  } else {
    usage.style.display = 'none';
  }
  table.style.display = 'table';
  if (lang === 'fg') {
    calcInflFg(item.word,toi);
  } else if (lang === 'yj' && estmPos(item.qualis) === 'noun') {
    table.innerHTML = '';
    calcInflYjNoun(item.word,toi);
  } else if (lang === 'yj' && estmPos(item.qualis) === 'verb') {
    calcInflYjVerb(item.word,toi);
  } else if (lang === 'yj' && estmPos(item.qualis) === 'adj') {
    calcInflYjAdj(item.word,toi);
  } else {
    table.innerHTML = '';
    table.style.display = 'none';
  }
}
function calcPronFg(word) {
  const map1 = {
    a:'a',b:'b',c:'tʃ',d:'d',e:'e',f:'f',g:'g',h:'h',i:'i',j:'ʒ',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',q:'kj',r:'r',s:'s',t:'t',u:'u',v:'v',w:'w',x:'ʃ',y:'j',z:'z'
  }
  const map2 = {
    tʃ:'t͡ɕ',kj:'kʲ'
  }
  const map3 = {
    a:'ä',b:'b',d:'d',e:'e̞',f:'f',g:'ɡ',h:'h',i:'i',ʒ:'ʑ',k:'k',l:'l',m:'m',n:'n',o:'o̞',p:'p',r:'ɾ',s:'s',t:'t',u:'ɯ',v:'v',w:'w',ʃ:'ɕ',j:'j',z:'z'
  }
  const phoneme = word
    .split('')
    .map(char => map1[char] || '?')
    .join('');
  const chars = phoneme;
  let phonetic = '';
  let i = 0;

  while (i < chars.length) {
    const pair = chars[i] + (chars[i + 1] || '');

    if (map2[pair]) {
      phonetic += map2[pair];
      i += 2;
    } else if (map3[chars[i]]) {
      phonetic += map3[chars[i]];
      i += 1;
    } else {
      phonetic += '?';
      i += 1;
    }
  }
  return `/${phoneme}/ [${phonetic}]`
}
function calcPronYj(word) {
  const map1 = {
    c:'tʃ',f:'f',i:'i',j:'ʒ',k:'k',l:'l',r:'r',s:'s',t:'t',v:'v',x:'ʃ',z:'z'
  }
  const map2 = {
    c:'tʃ',k:'k',s:'s',t:'t',v:'v',x:'ʃ',z:'z'
  }
  const map3 = {
    f:'æ',i:'i',j:'e',l:'u',r:'ɑ'
  }
  const map4 = {
    tʃ:'t͡ʃ'
  }
  const map5 = {
    ʒ:'j',v:'w',z:'ɹ'
  }
  const map6 = {
    ɑ:'ɑ',æ:'æ',e:'e',f:'f',i:'i',ʒ:'ʒ',k:'k',l:'l',r:'ɾ',s:'s',t:'t',u:'ɯ',v:'v',ʃ:'ʃ',z:'z'
  }
  const chars = word.split('');
  let phoneme = '';
  let phonetic = '';
  let i = 0;
  let j = 0;
  let preWasCons = false;

  while (i < chars.length) {
    const current = chars[i];
    if (i === chars.length - 1) {
      if (chars.length === 2 && chars[chars.length - 1] === 'l' && preWasCons) {
        phoneme += map3[current] || '?';
        i += 1;
      } else {
        phoneme += map1[current] || '?';
        preWasCons = true;
        i += 1;
      }
    } else {
      if (preWasCons) {
        if (map2[current]) {
          phoneme += map2[current] || '?';
          preWasCons = true;
          i += 1;
        } else {
          phoneme += map3[current] || '?';
          preWasCons = false;
          i += 1;
        }
      } else {
        if (i === 0 && (map2[chars[i + 1]] || current === 'i')) {
          phoneme += map3[current] || '?!';
          i += 1;
        } else {
          phoneme += map1[current] || '?';
          preWasCons = true;
          i += 1;
        }
      }
    }
  }
  const figure = phoneme.split('');
  while (j < figure.length) {
    const current = figure[j];
    const pair = figure[j] + (figure[j + 1] || '');
    if (map4[pair]) {
      phonetic += map4[pair];
      j += 2;
    } else {
      if (map5[current] && (map2[figure[j + 1]] || figure[j + 1] === 'u' || j === figure.length - 1)) {
        phonetic += map5[current];
        j += 1;
      } else {
        phonetic += map6[current];
        j += 1;
      }
    }
  }
  return `/${phoneme}/ [${phonetic}]`
}
function calcPronKl(word) {
  const map1 = {
    a:'a',b:'b',c:'ts',d:'d',e:'e',f:'f',g:'g',h:'h',i:'i',j:'zw',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',q:'kw',s:'s',t:'t',u:'u',v:'v',w:'w',x:'ʃ',y:'j',z:'z'
  }
  const map2 = {
    ts:'t͡s',dz:'d͡z',pj:'pʲ',bj:'bʲ',sw:'sʷ',zw:'zʷ',kw:'kʷ',gw:'gʷ',ei:'eɪ',al:'ɑɫ'
  }
  const map3 = {
    a:'a',b:'b',d:'d',e:'e',f:'f',g:'ɡ',h:'h',i:'i',j:'j',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',s:'s',t:'t',u:'u',v:'v',w:'w',ʃ:'ʃ',z:'z',ː:'ː'
  }
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const phonemeArr = [];
  const chars = word.split('');
  for (let j = 0; j < chars.length; j++) {
    const current = chars[j];
    const prev = chars[j - 1];
    if (current === 'h' && vowels.includes(prev)) {
      phonemeArr.push('ː');
    } else {
      phonemeArr.push(map1[current] || '?');
    }
  }
  const phoneme = phonemeArr.join('');
  const figure = phoneme.split('');
  let phonetic = '';
  let i = 0;

  while (i < figure.length) {
    const pair = figure[i] + (figure[i + 1] || '');

    if (map2[pair]) {
      phonetic += map2[pair];
      i += 2;
    } else if (map3[figure[i]]) {
      phonetic += map3[figure[i]];
      i += 1;
    } else {
      phonetic += '?!';
      i += 1;
    }
  }
  return `/${phoneme}/ [${phonetic}]`
}
function estmPos(qualis) {
  if (qualis.includes('格体')) {
    return 'noun';
  } else if (qualis.includes('実心')) {
    return 'verb';
  } else if (qualis.includes('飾定')) {
    return 'adj';
  } else if (qualis.includes('助動')) {
    return 'axlv';
  } else if (qualis.includes('離')) {
    return 'dfx'
  }
}
function estmInfl(word,pos,lang) {
  if (lang === 'fg') {
    if (pos === 'verb' || (pos === 'axlv' && word.slice(-1) === 'u')) {
      return '三段';
    } else if (pos === 'adj' || (pos === 'axlv' && word.slice(-1) === 'i')) {
      return '二段';
    }
  } else if (lang === 'yj') {
    if (pos === 'noun') {
      return '格体';
    } else if (pos === 'adj') {
      return '飾定';
    } else if (pos === 'verb') {
      if (word.slice(-1) === 'l' || word.slice(-1) === 'j') {
        return word.slice(-2);
      } else {
        return word.slice(-2,-1) + 'C';
      }
    }
  }
}
function calcInflFg(word,toi) {
   const table = document.getElementById('inflectionTable');
  table.innerHTML = '';
  const stem = word.slice(0, -1);
  let inflect = {};
  if (toi === '三段') {
    inflect = {
      '基本形': word,
      '連用形': stem + 'i',
      '命令形': stem + 'a'
    };
  } else if (toi === '二段') {
    inflect = {
      '基本形': word,
      '連用形': stem + 'a',
    };
  } else {
    table.style.display = 'none';
    return;
  }

  for (let label in inflect) {
    const row = document.createElement('tr');

    const headerCell = document.createElement('th');
    headerCell.textContent = label;
    row.appendChild(headerCell);

    const dataCell = document.createElement('td');
    dataCell.textContent = inflect[label];
    row.appendChild(dataCell);

    table.appendChild(row);
  }
}
function calcInflYjNoun(word,toi) {
  const table =  document.getElementById('inflectionTable');

  let stem = '';
  let end = '';

  if (word.length === 2 && word[word.length - 1] === 'l') {
    stem = word.slice(0,-1);
} else if (word.length > 2 && word[word.length - 2] !== 'j') {
    stem = word.slice(0,-3);
    end = word.slice(-2);
  } else {
    stem = word.slice(0,-2);
    end = word.slice(-1);
  }

  const forms = {
    '原形':   [`l${end}`, `j${end}`],
    '主格':   [`i${end}`, `f${end}`],
    '対格':   [`l${end}`, `r${end}`],
    '所有形': [`i${end}x`, `f${end}x`]
  };
  let headers = [];
  if (toi === '格体') {
    headers = ['', '限定', '非限定'];
  } else {
    headers = ['格体形', '限定', '非限定'];
  }
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (let label in forms) {
    const row = document.createElement('tr');

    const th = document.createElement('th');
    th.textContent = label;
    row.appendChild(th);

    const defCell = document.createElement('td');
    defCell.textContent = stem + forms[label][0];
    row.appendChild(defCell);

    const indefCell = document.createElement('td');
    indefCell.textContent = stem + forms[label][1];
    row.appendChild(indefCell);

    table.appendChild(row);
  }
}
function insertAffix(word,affix) {
  const prefix = word.slice(0,word.length-2);
  const stem = word.slice(-2);
  const parts = stem.split('');
  let result = '';
  for (let i = 0; i <= parts.length+1; i++) {
    result += (affix[i] || '') + (parts[i] || '');
  }
  return result;
}
function calcInflYjVerb(word,toi) {
  const table =  document.getElementById('inflectionTable');
  table.innerHTML = '';

  let stem = '';
  let forms = {};
  let noun = {};
  if (toi === 'fl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '連格形':   [['l','','f'],['l','j','f']],
    '連象形':   [['l','','r'],['l','j','r']]
    };
    noun = ['l','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'jl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '連格形':   [['r','','f'],['r','j','f']],
    '連象形':   [['r','','r'],['r','j','r']]
    };
    noun = ['r','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'll') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '連格形':   [['f','','f'],['f','j','f']],
    '連象形':   [['f','','r'],['f','j','r']]
    };
    noun = ['f','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'rl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '連格形':   [['i','','f'],['i','j','f']],
    '連象形':   [['i','','r'],['i','j','r']]
    };
    noun = ['i','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'fj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['j','','f'],['j','l','f']],
    '連象形':   [['j','','r'],['j','l','r']]
    };
    noun = ['f','l','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'jj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['f','','f'],['f','l','f']],
    '連象形':   [['f','','r'],['f','l','r']]
    };
    noun = ['f','l','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'lj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['r','','f'],['r','l','f']],
    '連象形':   [['r','','r'],['r','l','r']]
    };
    noun = ['r','l','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'rj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['i','','f'],['i','l','f']],
    '連象形':   [['i','','r'],['i','l','r']]
    };
    noun = ['i','l','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'fC') {
    forms = {
    '実心形':   [['f','',''],['fr','','']],
    '連格形':   [['l','f','f'],['lfr','','f']],
    '連象形':   [['l','f','r'],['lfr','','r']]
    };
    noun = ['lfj','','t'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'jC') {
    forms = {
    '実心形':   [['j','',''],['jr','','']],
    '連格形':   [['r','f','f'],['rfr','','f']],
    '連象形':   [['r','f','r'],['rfr','','r']]
    };
    noun = ['ijj','','k'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'lC') {
    forms = {
    '実心形':   [['l','',''],['lf','','']],
    '連格形':   [['r','l','f'],['rlf','','f']],
    '連象形':   [['f','l','r'],['flf','','r']]
    };
    noun = ['ilj','','k'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'rC') {
    forms = {
    '実心形':   [['r','',''],['rf','','']],
    '連格形':   [['j','r','f'],['jrf','','f']],
    '連象形':   [['j','r','r'],['jrf','','r']]
    };
    noun = ['jrj','','t'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  }
  
  const headers = [' ', '現在', '過去'];
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  for (let label in forms) {
    const row = document.createElement('tr');

    const th = document.createElement('th');
    th.textContent = label;
    row.appendChild(th);

    const preForm = prefix + insertAffix(stem,forms[label][0]);
    const prePron = calcPronYj(preForm);

    const preCell = document.createElement('td');
    preCell.textContent = preForm;
    preCell.title = prePron;
    row.appendChild(preCell);

    const pstCell = document.createElement('td');
    pstCell.textContent = prefix + insertAffix(stem,forms[label][1]);
    row.appendChild(pstCell);

    table.appendChild(row);
  }
  calcInflYjNoun(prefix+insertAffix(stem,noun),toi);
}
function calcInflYjAdj(word,toi) {
  const table =  document.getElementById('inflectionTable');
  table.innerHTML = '';

  const prefix = word.slice(0,-2);
  const stem = word.slice(-2,-1);
  const forms = {
    '原級':   [['','','x'],['','','f'],['','','s']],
    '比較級':   [['l','','x'],['j','','f'],['i','','s']],
    '最上級':   [['r','lk','x'],['j','jk','f'],['f','ik','s']]
    };

    const topRow = document.createElement('tr');

  const emptyTh = document.createElement('th');
  emptyTh.rowSpan = 2;
  topRow.appendChild(emptyTh);

  const conjTh = document.createElement('th');
  conjTh.colSpan = 2;
  conjTh.textContent = '連格';
  topRow.appendChild(conjTh);

  const complTh = document.createElement('th');
  complTh.rowSpan = 2;
  complTh.textContent = '補連象';
  topRow.appendChild(complTh);

  table.appendChild(topRow);

  const subRow = document.createElement('tr');

  const limTh = document.createElement('th');
  limTh.textContent = '限定';
  subRow.appendChild(limTh);

  const nonLimTh = document.createElement('th');
  nonLimTh.textContent = '非限定';
  subRow.appendChild(nonLimTh);

  table.appendChild(subRow);

  for (let label in forms) {
    const row = document.createElement('tr');

    const th = document.createElement('th');
    th.textContent = label;
    row.appendChild(th);

    const limConjCell = document.createElement('td');
    limConjCell.textContent = prefix + insertAffix(stem,forms[label][0]);
    row.appendChild(limConjCell);

    const nonLimConjCell = document.createElement('td');
    nonLimConjCell.textContent = prefix + insertAffix(stem,forms[label][1]);
    row.appendChild(nonLimConjCell);

    const complCell = document.createElement('td');
    complCell.textContent = prefix + insertAffix(stem,forms[label][2]);
    row.appendChild(complCell);

    table.appendChild(row);
  }
}
let dicData = null;
function parseCont(meaningText,data) {
  const container = document.createElement('span');

  const parts = meaningText.split(/(「[^」]+」)/);

  parts.forEach(part => {
    if (/^「[^」]+」$/.test(part)) {
      const innerText = part.slice(1,-1);
      const wordWithMeaning = innerText.split('(');
      const wordOnly = wordWithMeaning[0].trim();
      const meaning = wordWithMeaning[1] ? wordWithMeaning[1].slice(0,-1).trim():'';

      const link = document.createElement('a');
      link.textContent = wordOnly;

      const targetItem = data.find(item => item.word === wordOnly);

      const bracket = document.createElement('span');
      bracket.textContent = '「';
      const backBracket = document.createElement('span');
      backBracket.textContent = '」';

      if (targetItem) {
        link.href = '#';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showDetail(targetItem);
        });
        container.appendChild(bracket);
        container.appendChild(link);
      } else {
        container.appendChild(bracket);
         container.appendChild(document.createTextNode(wordOnly));
      }
      if (meaning) {
      const meanSpan = document.createElement('span');
      meanSpan.textContent = `(${meaning})」`;
      container.appendChild(meanSpan);
      } else {
        container.appendChild(backBracket);
      }
    } else {
      container.appendChild(document.createTextNode(part));
    }
  });
  return container;
}
function loadDic(lang) {
  fetch(`dic_${lang}.json`)
  .then(res => res.json())
  .then(data => {
    dicData = data;
    const search = document.getElementById('search');
    const suggest = document.getElementById('suggest');
    const word = document.getElementById('word');
    const detail = document.getElementById('detail');
    const count = document.createElement('p');
    count.textContent = `現在の語数: ${data.length}`;

    search.value = '';
    suggest.innerHTML = '';
    detail.style.display = 'none';
    suggest.appendChild(count);

    search.addEventListener('keydown',(event) => {
      if (event.key === 'Enter') {
        suggest.innerHTML = '';
        const query = search.value.toLowerCase();

        const filtered = data.filter(item => item.word.includes(query) || item.mean.includes(query));

        filtered.forEach(item => {
          const result = document.createElement('div');
          result.className = 'sentence';
          result.classList.add('result');

          const wordElm = document.createElement('span');
          wordElm.classList.add('word');
          wordElm.textContent = item.word;
          wordElm.classList.add(estmPos(item.qualis))

          const meanElm = document.createElement('span');
          meanElm.classList.add('mean')
          meanElm.textContent = item.mean;

          result.addEventListener('click', () => {
            showDetail(item)
            detail.style.display = 'block';
          });
          suggest.appendChild(result);
          result.appendChild(wordElm);
          result.appendChild(document.createElement('br'));
          result.appendChild(meanElm);
        });
      }
    });
  });
}

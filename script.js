function showBox(index) {
const contents =
document.querySelectorAll('.content');
contents[index].classList.toggle('active');
}
let lang = '';
let shownWord = '';
let wordIndex = '';
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const selectedlang = params.get('lang');
  const word = params.get('word');
   if (selectedlang) {
    setLang(selectedlang).then(() => {
      if (word) {
        const parts = word.split('-')
        const spell = parts[0];
        const index = parseInt(parts[1] || '0');
        const matches = dicData.filter(entry => entry.word === spell);
        const item = matches[index];
        if (item) {
          showDetail(item);
        } else {
          alert('単語が見つかりませんでした。');
        }
      }
    });
  }
});
const head = {
  fg: '穂語辞書',
  yj: '裕語辞書',
  kl: '嘉語辞書',
  pp: '唇語辞書'
}
const pronFuncs = {
  fg: calcPronFg,
  yj: calcPronYj,
  kl: calcPronKl,
  pp: calcPronPp
}
function setLang(selectedLang) {
  lang = selectedLang;
document.getElementById('title').textContent = head[lang];
  return loadDic();
}
function showDetail(item) {
  const detail = document.getElementById('detail');
  detail.style.display = 'block';
  const spell = document.getElementById('spell');
  const mean = document.getElementById('mean');
  const qualis = document.getElementById('qualis');
  const pron = document.getElementById('pron');
  const infl = document.getElementById('infl');
  const origin = document.getElementById('origin');
  const usage = document.getElementById('usage');
  const relation = document.getElementById('relation');
  const table = document.getElementById('inflectionTable');

  spell.textContent = `${item.word}`;
  mean.textContent = `意味: ${item.mean}`;
  qualis.textContent = `属性: ${item.qualis}`;
  const pronounce = pronFuncs[lang](item.word);
  pron.textContent = `発音: ${pronounce}`;
  const toi = estmInfl(item.word,estmPos(item.qualis));
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
    usage.textContent = `用法: `;
    usage.appendChild(parseCont(item.usage,dicData));
  } else {
    usage.style.display = 'none';
  }
  const relatedItem = dicData.filter(entry => {
    if (entry.word === item.word) return false;
    const pattern = new RegExp(`「${item.word}\\(`);
    return (entry.origin && pattern.test(entry.origin)) || (entry.usage && pattern.test(entry.usage));
  });
  if (relatedItem.length > 0) {
    relation.style.display = 'block';
    relation.textContent = '関連語: ';
    relatedItem.forEach(entry => {
      const bracket = document.createElement('span');
      bracket.textContent = '「';
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = entry.word;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showDetail(entry);
      });
      const meaningText = document.createElement('span');
      meaningText.textContent = `(${entry.mean})」`;
      relation.appendChild(bracket);
      relation.appendChild(link);
      relation.appendChild(meaningText);
    });
  } else {
    relation.style.display = 'none';
  }
  table.innerHTML = '';
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
    table.style.display = 'none';
  }
  shownWord = item.word;
  const matches = dicData.filter(entry => entry.word === shownWord);
  if (matches.length === 1) {
    wordIndex = '';
  } else if (matches.length > 1) {
    wordIndex = '-' + matches.findIndex(entry => entry.mean === item.mean && entry.qualis === item.qualis);
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
  const map7 = {
    ʒ:'a',ʃ:'a',r:'a',l:'a'
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
          if (map3[current]) {
            phoneme += map3[current] || '?!';
          } else {
            phoneme += map2[current] || '♪';
          }
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
      if (map5[current] && (map2[figure[j + 1]] || map7[figure[j + 1]] || figure[j + 1] === 'u' || j === figure.length - 1)) {
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
function calcPronPp(word) {
  const map = {
    p:'p',ê:'e˥',ē:'e˩',ë:'ɘ˩',î:'i˥',ī:'i˩',ï:'ɨ˩',ô:'o˥',ō:'o˩',û:'u˥',ū:'u˩'
  }
    const phonetic = word
    .split('')
    .map(char => map[char] || '?')
    .join('');
  return `[${phonetic}]`
}
function estmPos(qualis) {
  if (qualis.includes('格体')) {
    return 'noun';
  } else if (qualis.includes('実心')) {
    return 'verb';
  } else if (qualis.includes('飾定') || qualis.includes('連格')) {
    return 'adj';
  } else if (qualis.includes('助動')) {
    return 'axlv';
  } else if (qualis.includes('着')) {
    return 'nfx';
  } else if (qualis.includes('離')) {
    return 'dfx';
  } else if (qualis.includes('非能')) {
    return 'xfic';
  } else if (qualis.includes('連象')) {
    return 'cml';
  }
}
function estmInfl(word,pos) {
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
    noun = ['f','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'jj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['f','','f'],['f','l','f']],
    '連象形':   [['f','','r'],['f','l','r']]
    };
    noun = ['f','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'lj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['r','','f'],['r','l','f']],
    '連象形':   [['r','','r'],['r','l','r']]
    };
    noun = ['r','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'rj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '連格形':   [['i','','f'],['i','l','f']],
    '連象形':   [['i','','r'],['i','l','r']]
    };
    noun = ['i','j','t'];
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
    '連象形':   [['r','l','r'],['rlf','','r']]
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
function loadDic() {
  return fetch(`dic_${lang}.json`)
  .then(res => res.json())
  .then(data => {
    window.dicData = data;
    const search = document.getElementById('search');
    const suggest = document.getElementById('suggest');
    const word = document.getElementById('word');
    const detail = document.getElementById('detail');
    const count = document.createElement('p');
    count.textContent = `現在の見出し語数: ${data.length}`;

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
            showDetail(item);
          });
          suggest.appendChild(result);
          result.appendChild(wordElm);
          result.appendChild(document.createElement('br'));
          result.appendChild(meanElm);
        });
      }
    });
    return data;
  });
}
function shareWord () {
  const url = `https://fogenese.github.io/fogenese-homepage/dictionary.html?lang=${lang}&word=${shownWord}${wordIndex}`;
  navigator.clipboard.writeText(url)
    .then(() => {
      alert("URLをコピーしました！");
    })
    .catch(err => {
      alert("コピーに失敗しました: " + err);
    });
}
function analyze(sentence) {
  const result = document.getElementById('analyzed');
  const analysis = document.getElementById('analysis');
  const headers = ['単語','辞書形','意味','属性','値'];
  analysis.innerHTML = '';
  const row = document.createElement('tr');
  headers.forEach(head => {
    const thead = document.createElement('th');
    thead.textContent = head;
    row.appendChild(thead);
  });
  analysis.appendChild(row);
  const words = sentence.trim().split(/\s+/);
  words.forEach(word => {
    
    const th = document.createElement('th');
    th.textContent = word;

    const dicForm = document.createElement('td');
    const meanCell = document.createElement('td');
    const qualisCell = document.createElement('td');
    const valueCell = document.createElement('td');

    const matches = dicData.filter(entry => entry.word === word);
    const reverses = inflFuncs[lang](word);

    if (matches.length === 1 && !reverses) {
      dicForm.textContent = matches[0].word;
      meanCell.textContent = matches[0].mean;
      qualisCell.textContent = matches[0].qualis;
      valueCell.textContent = '-';
      const tr = document.createElement('tr');
      analysis.appendChild(tr);
      tr.appendChild(th);
      tr.appendChild(dicForm);
      tr.appendChild(meanCell);
      tr.appendChild(qualisCell);
      tr.appendChild(valueCell);
    } else if (Array.isArray(reverses) && reverses.length > 1) {
      for (let i = 0; i < reverses.length; i++) {
        const tr = document.createElement('tr');
        if (i === 0) {
          th.rowSpan = reverses.length;
          tr.appendChild(th);
        }
        const subDicForm = document.createElement('td');
        const subMeanCell = document.createElement('td');
        const subQualisCell = document.createElement('td');
        const subValueCell = document.createElement('td');

        subDicForm.textContent = reverses[i].word;
        subMeanCell.textContent = reverses[i].mean;
        subQualisCell.textContent = reverses[i].qualis;
        subValueCell.textContent = reverses[i].value;
        analysis.appendChild(tr);
        tr.appendChild(subDicForm);
        tr.appendChild(subMeanCell);
        tr.appendChild(subQualisCell);
        tr.appendChild(subValueCell);
      };
    } else if (reverses) {
      dicForm.textContent = reverses.word;
      meanCell.textContent = reverses.mean;
      qualisCell.textContent = reverses.qualis;
      valueCell.textContent = reverses.value;
      const tr = document.createElement('tr');
      analysis.appendChild(tr);
      tr.appendChild(th);
      tr.appendChild(dicForm);
      tr.appendChild(meanCell);
      tr.appendChild(qualisCell);
      tr.appendChild(valueCell);
    } else if (matches.length > 1) {
      matches.forEach((match,index) => {
        const tr = document.createElement('tr');
        if (index === 0) {
          th.rowSpan = matches.length;
          tr.appendChild(th);
        }
        const subDicForm = document.createElement('td');
        const subMeanCell = document.createElement('td');
        const subQualisCell = document.createElement('td');
        const subValueCell = document.createElement('td');

        subDicForm.textContent = word;
        subMeanCell.textContent = match.mean;
        subQualisCell.textContent = match.qualis;
        subValueCell.textContent = '-';
        analysis.appendChild(tr);
        tr.appendChild(subDicForm);
        tr.appendChild(subMeanCell);
        tr.appendChild(subQualisCell);
        tr.appendChild(subValueCell);
      });
    } else {
      const nonMatchCell = document.createElement('td');
      nonMatchCell.textContent = '見つかりませんでした。';
      nonMatchCell.colSpan = 4;
      const tr = document.createElement('tr');
      analysis.appendChild(tr);
      tr.appendChild(th);
      tr.appendChild(nonMatchCell);
    }
  });
  result.appendChild(analysis);
}
function reverseInflFg(word) {
  const results = [];
  const verbs = dicData.filter(entry => entry.word === word.slice(0,-1)+'u');
  const adj = dicData.find(entry => entry.word === word.slice(0,-1)+'i');
  const adj1 = dicData.find(entry => entry.word === word.slice(0,-2)+'i');
  let pos = null;
  let infl = null;
  if (verbs.length > 0) {
    const verb = verbs[0];
    pos = estmPos(verb.qualis);
    infl = estmInfl(verb.word,pos);
  }
  if (adj) {
    pos = estmPos(adj.qualis);
    infl = estmInfl(adj.word,pos);
  }
  if (adj1) {
    if (word.endsWith('o')) {
      pos = estmPos(adj1.qualis);
      infl = estmInfl(adj1.word,pos);
    }
  }
  if ((word.endsWith('u') ||  word.endsWith('i') || word.endsWith('a')) && verbs && infl === '三段') {
    verbs.forEach(verb => {
      if (word.endsWith('u')) {
        results.push({...verb, value:'基本形'});
      } else if (word.endsWith('i')) {
        results.push({...verb, value:'連用形'});
      } else if (word.endsWith('a')) {
        results.push({...verb, value:'命令形'});
      }
    });
    return results.length === 1 ? results[0] : results;
  } else if (word.endsWith('i') && (infl === '三段' || infl === '二段')) {
    if (infl === '三段') {
      return {...verb, value:'連用形'};
    } else if (infl === '二段') {
      return {...adj, value:'基本形'};
    }
  } else if (word.endsWith('a') && (infl === '三段' || infl === '二段')) {
    if (infl === '三段') {
      return {...verb, value:'命令形'};
    } else if (infl === '二段') {
      return {...adj, value:'連用形'};
    }
  } else if (word.endsWith('do') && adj1) {
    return {...adj1, value:'程度格体形'};
  } else return null;
}
function reverseInflYj(word) {

  const pron = calcPronYj(word);
  const match = pron.match(/(?<=\/).+(?=\/)/);
  const phoneme = match ? match[0] : '';
  const vowels = ['æ', 'ɑ', 'e', 'i', 'u'];
  let Vplace1 = 0;
  let Vplace2 = 0;
  let Vplace3 = 0;
  for (let i = phoneme.length -1; i >= 0; i--) {
    if (vowels.includes(phoneme[i])) {
      if (Vplace1 === 0) {
        Vplace1 = phoneme.length - i;
      } else if (Vplace2 === 0) {
        Vplace2 = phoneme.length - i;
      } else if (Vplace3 === 0) {
        Vplace3 = phoneme.length - i;
        break;
      }
    }
  }
  const stem = word.slice(0, -Vplace1);
  const end = word.slice(-Vplace1+1);

  const rules = [
    { last: ['j','l','v','z']},
    { end: ['f','j','l','r','v','z'], value: '現在'},
    { end: ['lj','jl'], value: '過去'},
    { end: ['fv','fz'], cond: ['l','r'], value: '過去'},
    { end: ['rv','rz'], cond: ['f','j'], value: '過去'},
    { inffix: ['lfl','irl','rjl','fll','jfj','irj','fjj','rlj','lfv','rjv','rlv','jrv','lfz','rjz','rlz','jrz']},
    { inffix: ['lvf','rvj','rvl','jvr','lzf','rzj','rzl','jzr']},
    { inffix: ['lflt','irlt','rjlk','fllk','jfjt','fjjk','rljk','iljt','lfvt','ijvk','ilvk','jrvt','lfzt','ijzk','ilzk','jrzt']},
    { i:'限定形・主格',l:'限定形 , 限定形・対格'},
    { f:'非限定形・主格',j:'非限定形',r:'非限定形・対格'},
    { f: {vowelA:'j',vowelB:'j',value:'非限定形・連格'},
      s: {vowelA:'i',vowelB:'f',value:'補連象'},
      x: {vowelA:'l',vowelB:'r',value:'限定形・連格'}
    }
  ];
  
  if (word.length === 2 && (word.endsWith('i') || word.endsWith('l')) && dicData.find(entry => entry.word === word.slice(0,-1)+'l')) {
    const nounValue = rules[8][word.slice(-1)];
    return {...dicData.find(entry => entry.word === word.slice(0,-1)+'l'), value:nounValue};
  } else if (word.length === 3 && word.slice(-2) === 'ix' && dicData.find(entry => entry.word === word.slice(0,-2)+'l')) {
    return {...dicData.find(entry => entry.word === word.slice(0,-2)+'l'), value:'限定形・所有形'};

  
  } else if (rules[0].last.includes(word.slice(-1))) {
    let verbVowel = word.slice(-Vplace1,-Vplace1+1);
    let verbStem = stem;
    let verbEnd = end;
    let tense = '';
    let modality = '';
    if (word.slice(-Vplace1,-1) === 'i') {
      verbVowel = word.slice(-Vplace2,-Vplace2+1);
      verbStem = word.slice(0,-Vplace2);
      verbEnd = verbForm.slice(-Vplace2+3);
      if (word.slice(-Vplace1-1,-Vplace1) === 'v') {modality = '・意志';}
    }
    for (let rule of rules) {
      if (rule.end && rule.end.includes(verbEnd) && (!rule.cond || rule.cond.includes(verbVowel))) {
        tense = rule.value;
        break;
      }
    }
    if (tense) {
      const form = dicData.find(entry => entry.word === verbStem+verbVowel+word.slice(-1));
      if (form) {return {...form, value:`${tense}${modality}`};}
    }
  } else if (word.endsWith('f') || word.endsWith('r')) {
    let vowel = word.slice(-Vplace1-1,-Vplace1);
    let verbStem = word.slice(0,-Vplace2);
    let verbEnd = word.slice(-Vplace1,-1);
    let inffix = word.slice(-Vplace1-2,-Vplace1)+verbEnd.slice(-1);
    let tense = '';
    let modality = '';
    let qualis = '';
    if (word.slice(-Vplace1,-1) === 'i') {
      vowel = word.slice(-Vplace2-1,-Vplace2);
      verbStem = word.slice(0,-Vplace3);
      verbEnd = word.slice(-Vplace2,-3);
      inffix = word.slice(-Vplace2-2,-Vplace2)+verbEnd.slice(-1);
      if (word.slice(-Vplace1-1,-Vplace1) === 'v') {modality = '・意志';}
    }
    if (word.endsWith('f')) {qualis = '・連格';}
    else if (word.endsWith('r')) {qualis = '・連象';}
    for (let rule of rules) {
      if (rule.end && rule.end.includes(verbEnd) && (!rule.cond || rule.cond.includes(vowel))) {
        tense = rule.value;
        break;
      }
    }
    if (tense && (rules[5].inffix.includes(inffix) || rules[6].inffix.includes(inffix))) {
      let form = dicData.find(entry => entry.word === verbStem+vowel+verbEnd.slice(-1));
      if (rules[6].inffix.includes(inffix) && tense === '現在') {form = dicData.find(entry => entry.word === verbStem+verbEnd+vowel);}
      if (form) {return {...form, value:`${tense}${qualis}${modality}`};}
    }


  } else if ((word.endsWith('t') || word.endsWith('k')) && (dicData.find(entry => entry.word === stem+'j'+end) || dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2)) || dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2)))) {
    let verbForm = '';
    let modality = '';
    let inffix = word.slice(-Vplace1-2,-Vplace1)+word.slice(-Vplace1+1);
    let verbEnd = word.slice(-Vplace1,-1);
    let vowel = word[word.length-Vplace1];
    const modalyVerb = dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2));
    if (word.slice(-Vplace1,-1) === 'i' && modalyVerb) {
      inffix = word.slice(-Vplace2-2,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-1);
      vowel = word.slice(-Vplace2,-4);
      if (word.slice(-Vplace1-1,-Vplace1) === 'v') {modality = '・意志';}
    }
    const nounValue = rules[8][vowel] || rules[9][vowel];
    const nounForm = dicData.find(entry => entry.word === stem+'j'+end);
    if (modality && !nounForm) {verbForm = modalyVerb;}
    else if (!nounForm) {verbForm = dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2));}
    if (nounForm) {return {...nounForm, value:nounValue};}
    else if (verbForm && rules[7].inffix.includes(inffix)) {
      return {...verbForm, value:`格体形・${nounValue}${modality}`};
    }
  } else if (word.endsWith('x') && (dicData.find(entry => entry.word === stem+'j'+end.slice(-2,-1)) || dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2)) || dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2)))) {
    let nounValue = '';
    let verbForm = '';
    let modality = '';
    let inffix = word.slice(-Vplace1-2,-Vplace1)+word.slice(-Vplace1+1,-1);
    let vowel = word[word.length-Vplace1];
    const modalyVerb = dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2));
    if (word.slice(-Vplace1,-1) === 'i' && modalyVerb) {
      inffix = word.slice(-Vplace2-2,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1-2,-Vplace1-1);
      vowel = word.slice(-Vplace2,-5);
      if (word.slice(-Vplace1-1,-Vplace1) === 'v') {modality = '・意志';}
    }
    if (vowel === 'i') {nounValue = '限定形';}
    else if (vowel ==='f') {nounValue = '非限定形';}
    else {return;}
    const nounForm = dicData.find(entry => entry.word === stem+'j'+end.slice(-2,-1));
    if (modality && !nounForm) {verbForm = modalyVerb;}
    else if (!nounForm) {verbForm = dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2));}
    if (nounForm) {return {...nounForm, value:`${nounValue}・所有形`};}
    else if (verbForm && rules[7].inffix.includes(inffix)) {
      return {...verbForm, value:`格体形・${nounValue}・所有形${modality}`};
    }
    
    
  } if (rules[10][word.slice(-1)]) {
    const adjEnd = word.slice(-1);
    const rule = rules[10][adjEnd];
    const vowel1 = word[word.length-Vplace1];
    const vowel2 = word[word.length-Vplace2];
    if (dicData.find(entry => entry.word === word.slice(0,-1)+'f')) {
      const orgValue = rule.value;
      return {...dicData.find(entry => entry.word === word.slice(0,-1)+'f'), value:orgValue};
    }
    if (dicData.find(entry => entry.word === stem+end.slice(0,-1)+'f')) {
      if (vowel1 === rule.vowelA) {
        const cmprValue = rule.value;
        return {...dicData.find(entry => entry.word === stem+end.slice(0,1)+'f'), value:`比較級・${cmprValue}`};
      }
    }
    if (dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace1)+'f')) {
      let advValue = '';
      if (vowel1 === rule.vowelA && vowel2 === rule.vowelB && word.slice(-2,-1) === 'k') {
        const advValue = rule.value;
        return {...dicData.find(entry => entry.word === word.slice(0,-Vplace2) + word.slice(-Vplace2+1,-Vplace1) + 'f'), value:`最上級・${advValue}`};
      }
    }


  } else if (word.endsWith('r')) {
    if ((word[word.length-Vplace2] === 'f' && word[word.length-Vplace1] === 'i' && word[word.length-Vplace1+1] === 'f')) {
      return {...dicData.find(entry => entry.word === word.slice(0,-Vplace2) + word.slice(-Vplace2+1,-Vplace1) + 'f'), value:'最上級'};
    }
    
    
  } else return null;
}

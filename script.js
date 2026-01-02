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
const dichead = {
  fg: '穂語辞書',
  yj: '裕語辞書',
  kl: '嘉語辞書',
  pp: '唇語辞書'
}
const anahead = {
  fg: '穂語文解析',
  yj: '裕語文解析',
  kl: '嘉語文解析',
  pp: '唇語文解析'
}
const gamhead = {
  fg: '穂語単語学習',
  yj: '裕語単語学習',
  kl: '嘉語単語学習',
  pp: '唇語単語学習',
  sb: '澄語単語学習',
  cq: '楪語単語学習'
}
const pronFuncs = {
  fg: calcPronFg,
  yj: calcPronYj,
  kl: calcPronKl,
  pp: calcPronPp
}
const inflFuncs = {
  fg: reverseInflFg,
  yj: reverseInflYj,
  kl: dummy,
  pp: dummy
}
function dummy() {return [];}
function setLang(selectedLang) {
  lang = selectedLang;
  if (document.body.classList.contains('dic')) {
    document.getElementById('title').textContent = dichead[lang];
  } else if (document.body.classList.contains('ana')) {
    document.getElementById('title1').textContent = anahead[lang];
  } else {
    document.getElementById('title2').textContent = gamhead[lang];
  }
  return loadDic();
}
function showDetail(item) {
  const langInfo = document.getElementById('langInfo');
  langInfo.innerHTML = '';
  const detail = document.getElementById('detail');
  detail.style.display = 'block';
  const spell = document.getElementById('spell');
  const mean = document.getElementById('mean');
  const qualis = document.getElementById('qualis');
  const qualisElm = document.createElement('span');
  const posElm = document.createElement('span');
  const pron = document.getElementById('pron');
  const infl = document.getElementById('infl');
  const origin = document.getElementById('origin');
  const usage = document.getElementById('usage');
  const relation = document.getElementById('relation');
  const table = document.getElementById('inflectionTable');
  const share = document.getElementById('shareWord');
  share.style.display = 'block';

  spell.textContent = `${item.word}`;
  mean.textContent = `意味: ${item.mean}`;
  qualis.textContent = '';
  qualisElm.textContent = `属性: ${estmPos(item.qualis,'qualis')}`;
  posElm.textContent = `品詞: ${estmPos(item.qualis,'pos')}`;
  qualis.appendChild(qualisElm);
  qualis.appendChild(document.createElement('br'));
  qualis.appendChild(posElm);
  const pronounce = pronFuncs[lang](item.word.toLowerCase());
  pron.textContent = `発音: ${pronounce}`;
  const toi = estmInfl(item);
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
  const pos = estmPos(item.qualis,'pos');
  if (lang === 'fg') {
    calcInflFg(item.word,toi);
  } else if (lang === 'yj') {
    if (pos.includes('名詞')){
      calcInflYjNoun(item.word,toi);
    } else if (pos.includes('動詞')) {
      calcInflYjVerb(item.word,toi);
    } else if (pos.includes('形容詞')) {
      calcInflYjAdj(item.word);
    }
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
function estmPos(codeText,flag) {
  const codes = codeText.split(',');
  const rules = [
    [['名詞','格体','noun'],['動詞','実心','verb'],['形容詞','飾定','adj'],['述語','心子','verb'],['連体詞','連格','adj'],['副詞','連象','adv'],['接続詞','連包','conj'],['間投詞','非能','int']],
    { '0':'格','1':'実','2':'飾','3':'心','4':'洛','5':'潒','6':'泡','7':'非','e':'着','f':'離','g':'頭辞','h':'尾辞','i':'入辞','j':'合辞','k':'周辞','l':'通辞'},
    {
      '05fg':['前置詞','prep'],
      '05':['格助詞','adv'],
      '00':['名詞接尾辞','noun'],
      '11':['助動詞','aux'],
      '12':['助動詞','aux'],
      '13':['終助詞','part']
      '15':['接続助詞','conj'],
      '55':['副助詞','conj']
    },
    {a:['代'],b:['自','内向'],c:['他','外向'],d:['両向'],m:['結び'],n:['解き']}
  ];
  let pos = [];
  let qualis = [];
  let color = [];
  codes.forEach(code => {
    if (code.length < 3) {
      const rule0 = rules[0][parseInt(code.slice(-1))];
      pos.push(rule0[0]);
      qualis.push(rule0[1]);
      color.push(rule0[2]);
      if (code.length > 1) {
        pos[0] = rules[3][code.slice(0,1)][0] + pos[0];
        qualis[qualis.length - 1] = rules[3][code.slice(0,1)][rules[3][code.slice(0,1)].length - 1] + qualis[qualis.length - 1];
      }
    }
    else {
      qualis.push('');
      code.split('').forEach(char => {
        qualis[qualis.length - 1] += rules[1][char];
      });
      Object.keys(rules[2]).forEach(function (key) {
        if (code.includes(key)) {
          pos.push(rules[2][key][0]);
          color.push(rules[2][key][1]);
        }
      });
    }
  });
  if (pos.length < 1) {pos = null;}
  if (flag === 'pos') {return pos[0];}
  else if (flag === 'qualis') {return qualis;}
  else if (flag === 'color') {return color;}
}
function estmInfl(item) {
  const word = item.word;
  const pos = estmPos(item.qualis,'pos');
  if (lang === 'fg') {
    if (pos === '助動詞' && word.slice(-1) === 'i') {
      return '助動詞二段';
    } else if (pos === '形容詞') {
      return '二段';
    } else if (pos.includes('動詞') || (pos === '助動詞' && word.slice(-1) === 'u')) {
      return '三段';
    }
  } else if (lang === 'yj') {
    if (pos.includes('名詞')) {
      return '格体';
    } else if (pos === '形容詞') {
      return '飾定';
    } else if (pos.includes('動詞')) {
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
  const inflects = [
    {'基本形': 'u', '連用形': 'i', '命令形': 'a'},
    {'基本形': 'i', '連用形': 'a', '程度形': 'do'},
    {'基本形': 'i', '連用形': 'a'}
  ];
  let inflect = {};
  if (toi === '三段') {
    inflect = inflects[0];
  } else if (toi === '二段') {
    inflect = inflects[1];
  } else if (toi === '助動詞二段') {
    inflect = inflects[2];
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
    dataCell.textContent = stem + inflect[label];
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
function calcCharFreq () {
  const langInfo = document.getElementById('langInfo');
  langInfo.innerHTML = '';
  const freq = {};
  let sum = 0;
  dicData.forEach(entry => {
    const word = entry.word.toLowerCase();
    for(let char of word) {
      if (freq[char]) {
        freq[char]++;
      } else {
        freq[char] = 1;
      }
      sum += 1;
    }
  });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([char,count]) => {
    const ratio = Math.round(count / sum * 1000) / 10;
    const p = document.createElement("p");
    p.textContent = `${char}: ${count} (${ratio}%)`
    langInfo.appendChild(p);
  });
}
function loadDic() {
  return fetch(`dic_${lang}.json`)
  .then(res => res.json())
  .then(data => {
    window.dicData = data;
    const search = document.getElementById('search');
    const suggest = document.getElementById('suggest');
    const detail = document.getElementById('detail');
    const table = document.getElementById('inflectionTable');
    const share = document.getElementById('shareWord');
    const langInfo = document.getElementById('langInfo');
    const count = document.createElement('p');
    count.textContent = `現在の見出し語数: ${data.length}`;

    search.value = '';
    suggest.innerHTML = '';
    detail.style.display = 'none';
    table.style.display = 'none';
    share.style.display = 'none';
    calcCharFreq();
    suggest.appendChild(count);

    search.addEventListener('keydown',(event) => {
      if (event.key === 'Enter') {
        suggest.innerHTML = '';
        const query = search.value.toLowerCase();
        let filtered = [];
        if (query.startsWith('#')) {
          filtered = data.filter(item => 'qualis' in item && item.qualis.match(query.slice(1)));
        } else if (query.startsWith('¥')) {
          filtered = data.filter(item => 'qualis' in item && item.qualis === query.slice(1));
        } else if (query.startsWith('/')) {
          filtered = data.filter(item => 'origin' in item && item.origin.includes(query.slice(1)));
        } else {
          filtered = data.filter(item => item.word.toLowerCase().includes(query) || item.mean.includes(query));
        }

        filtered.forEach(item => {
          const result = document.createElement('div');
          result.className = 'sentence';
          result.classList.add('result');

          const wordElm = document.createElement('span');
          wordElm.classList.add('word');
          wordElm.textContent = item.word;
          wordElm.classList.add(estmPos(item.qualis,'color'));

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
  const headers = ['単語','辞書形','意味','属性','品詞','値'];
  analysis.innerHTML = '';
  const row = document.createElement('tr');
  headers.forEach(head => {
    const thead = document.createElement('th');
    thead.textContent = head;
    row.appendChild(thead);
  });
  analysis.appendChild(row);
  const words = sentence
    .toLowerCase()
    .trim()
    .match(/[a-z]+|[^a-z\s]/gi);
  words.forEach(word => {
    
    const th = document.createElement('th');
    th.textContent = word;

    const reverses = inflFuncs[lang](word);
    if (reverses.length < 1) {
      const matches = dicData.filter(entry => entry.word.toLowerCase() === word);
      matches.forEach(match => {
        reverses.push({...match, value:'-'});
      });
    }
    if (reverses.length === 0 && !/^[a-z]+$/.test(word)) {
      const tokenCell = document.createElement('th');
      tokenCell.colSpan = 5;
      const tr = document.createElement('tr');
      analysis.appendChild(tr);
      tr.appendChild(th);
      tr.appendChild(tokenCell);
    } else if (reverses.length > 0) {
      for (let i = 0; i < reverses.length; i++) {
        const tr = document.createElement('tr');
        if (i === 0) {
          th.rowSpan = reverses.length;
          tr.appendChild(th);
        }
        const DicForm = document.createElement('td');
        const MeanCell = document.createElement('td');
        const QualisCell = document.createElement('td');
        const PosCell = document.createElement('td');
        const ValueCell = document.createElement('td');

        DicForm.textContent = reverses[i].word;
        MeanCell.textContent = reverses[i].mean;
        QualisCell.textContent = estmPos(reverses[i].qualis,'qualis');
        PosCell.textContent = estmPos(reverses[i].qualis,'pos');
        ValueCell.textContent = reverses[i].value;
        analysis.appendChild(tr);
        tr.appendChild(DicForm);
        tr.appendChild(MeanCell);
        tr.appendChild(QualisCell);
        tr.appendChild(PosCell);
        tr.appendChild(ValueCell);
      };
    } else {
      const nonMatchCell = document.createElement('td');
      nonMatchCell.textContent = '見つかりませんでした。';
      nonMatchCell.colSpan = 5;
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
  const adjs1 = dicData.filter(entry => entry.word === word.slice(0,-1)+'i');
  const adjs2 = dicData.filter(entry => entry.word === word.slice(0,-2)+'i');
  const adjs = [...adjs1,...adjs2];
  let infl = null;
  const rules = [
    { u: '基本形', i: '連用形', a: '命令形' },
    { i: '基本形', a: '連用形', do: '程度形' }
  ];
  if (verbs.length > 0) {
    verbs.forEach(verb => {
      const value = rules[0][word.slice(-1)];
      infl = estmInfl(verb);
      if (value !== undefined && infl === '三段') {
        results.push({ ...verb, value: value});
      }
    });
  }
  if (adjs.length > 0) {
    adjs.forEach(adj => {
      const value = rules[1][word.replace(adj.word.slice(0, -1),'')];
      infl = estmInfl(adj);
      if (value !== undefined && (infl === '二段' || (infl === '助動詞二段' && value !== '程度形'))) {
        results.push({ ...adj, value: value});
      }
    });
  }
  return results;
}
function reverseInflYj(word) {
  const results = [];
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
    results.push({...dicData.find(entry => entry.word === word.slice(0,-1)+'l'), value:nounValue});
  }
  if (word.length === 3 && word.slice(-2) === 'ix' && dicData.find(entry => entry.word === word.slice(0,-2)+'l')) {
    results.push({...dicData.find(entry => entry.word === word.slice(0,-2)+'l'), value:'限定形・所有形'});
  }
  
  if (rules[0].last.includes(word.slice(-1))) {
    let verbVowel = word.slice(-Vplace1,-Vplace1+1);
    let verbStem = stem;
    let verbEnd = end;
    let tense = '';
    let modality = '';
    if (word.slice(-Vplace1,-1) === 'i') {
      verbVowel = word.slice(-Vplace2,-Vplace2+1);
      verbStem = word.slice(0,-Vplace2);
      verbEnd = word.slice(-Vplace2+3);
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
      if (form) {results.push({...form, value:`${tense}${modality}`});}
    }
  }
  if (word.endsWith('f') || word.endsWith('r')) {
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
      if (form) {results.push({...form, value:`${tense}${qualis}${modality}`});}
    }
  }
  
  if ((word.endsWith('t') || word.endsWith('k')) && (dicData.find(entry => entry.word === stem+'j'+end) || dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2)) || dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2)))) {
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
    if (nounForm) {results.push({...nounForm, value:nounValue});}
    else if (verbForm && rules[7].inffix.includes(inffix)) {
      results.push({...verbForm, value:`格体形・${nounValue}${modality}`});
    }
  }
  if (word.endsWith('x') && (dicData.find(entry => entry.word === stem+'j'+end.slice(-2,-1)) || dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace2+2)+word.slice(-Vplace1+1,-Vplace1+2)) || dicData.find(entry => entry.word === word.slice(0,-Vplace3)+word.slice(-Vplace3+1,-Vplace3+2)+word.slice(-Vplace2+1,-Vplace2+2)))) {
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
    if (nounForm) {results.push({...nounForm, value:`${nounValue}・所有形`});}
    else if (verbForm && rules[7].inffix.includes(inffix)) {
      results.push({...verbForm, value:`格体形・${nounValue}・所有形${modality}`});
    }
  }
  if (rules[10][word.slice(-1)]) {
    const adjEnd = word.slice(-1);
    const rule = rules[10][adjEnd];
    const vowel1 = word[word.length-Vplace1];
    const vowel2 = word[word.length-Vplace2];
    if (dicData.find(entry => entry.word === word.slice(0,-1)+'f')) {
      const orgValue = rule.value;
      results.push({...dicData.find(entry => entry.word === word.slice(0,-1)+'f'), value:orgValue});
    }
    if (dicData.find(entry => entry.word === stem+end.slice(0,-1)+'f')) {
      if (vowel1 === rule.vowelA) {
        const cmprValue = rule.value;
        results.push({...dicData.find(entry => entry.word === stem+end.slice(0,1)+'f'), value:`比較級・${cmprValue}`});
      }
    }
    if (dicData.find(entry => entry.word === word.slice(0,-Vplace2)+word.slice(-Vplace2+1,-Vplace1)+'f')) {
      let advValue = '';
      if (vowel1 === rule.vowelA && vowel2 === rule.vowelB && word.slice(-2,-1) === 'k') {
        const advValue = rule.value;
        results.push({...dicData.find(entry => entry.word === word.slice(0,-Vplace2) + word.slice(-Vplace2+1,-Vplace1) + 'f'), value:`最上級・${advValue}`});
      }
    }
  }
  return results;
}

let game = null;
function wordGame() {
  const container = document.getElementById('container');
  const correctionMark = document.getElementById('correction');
  const answers =
  [
    document.getElementById('answer0'),
    document.getElementById('answer1'),
    document.getElementById('answer2'),
    document.getElementById('answer3')
  ];
  const questionText = document.getElementById('question');
  let answerFlag = false;
  let incorrections = [];
  let r1 = [];
  let r2 = 0;
  let r4 = 0;
  let requestionFlag = false;
  function nextQuestion() {
    answers.forEach(answer => {answer.style.backgroundColor = '#ffe7b0';});
    correctionMark.style.opacity = '0';
    answerFlag = false;
    requestionFlag = false;
    if (incorrections.length === 1 && incorrections[0] === '') {incorrections = [];}
    r1 = [];
    r2 = Math.floor(Math.random() * 4);
    const r3 = Math.floor(Math.random() * 10);
    r4 = Math.floor(Math.random() * (incorrections.length - 1));
    let k = 0;
    while (k < 4) {
      if (incorrections.length > 1 && r3 < 5 && k === 0) {
        r1.push(incorrections[r4]);
        requestionFlag = true;
        k++;
      } else {
        const r5 = Math.floor(Math.random() * dicData.length);
        if (!r1.includes(r5)) {
          r1.push(r5);
          k++;
        }
      }
    }
    [r1[0],r1[r4]] = [r1[r4],r1[0]];
    const question = dicData[r1[r2]];
    questionText.textContent = question.word;
    answers[r2].textContent = question.mean;
    const others = [0,1,2,3].filter(i => i !== r2);
    others.forEach(i => {
      answers[i].textContent = dicData[r1[i]].mean;
    });
  }
  nextQuestion();
  
  function checkAnswer(index) {
    if (answerFlag) {return;}
    answerFlag = true;
    if (index === r2) {
      correctionMark.style.opacity = '50%';
      correctionMark.style.color = '#0f0';
      correctionMark.textContent = '〇';
      if (incorrections.length > 0 && incorrections[incorrections.length-1] !== '') {
        incorrections.push('');
      }
      if (requestionFlag) {
        incorrections.splice(r4,1);
      }
    } else {
      correctionMark.style.opacity = '50%';
      correctionMark.style.color = '#f00';
      correctionMark.textContent = '✕';
      answers[index].style.backgroundColor = '#f00';
      if (incorrections[incorrections.length-1] === '') {
        incorrections.pop()
      }
      if (!incorrections.includes(r1[r2])) {
        incorrections.push(r1[r2]);
      }
    }
    answers[r2].style.backgroundColor = '#0f0';
    container.innerHTML = '';
    const restart = document.createElement('button');
    restart.textContent = 'リスタート';
    restart.addEventListener('click', () => {game = wordGame();});
    const next = document.createElement('button');
    next.textContent = '次へ';
    next.addEventListener('click', () => {game.nextQuestion();});
    container.appendChild(restart);
    container.appendChild(next);
  }
  return {nextQuestion,checkAnswer};
}

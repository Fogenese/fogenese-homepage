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
  sb: '澄語辞書',
  pp: '唇語辞書',
  cq: '楪語辞書',
  fb: '发語辞書',
  zl: '津語辞書'
}
const anahead = {
  fg: '穂語文解析',
  yj: '裕語文解析',
  kl: '嘉語文解析',
  sb: '澄語文解析',
  pp: '唇語文解析',
  cq: '楪語文解析',
  fb: '发語文解析',
  zl: '津語文解析'
}
const gamhead = {
  fg: '穂単語学習',
  yj: '裕単語学習',
  kl: '嘉単語学習',
  sb: '澄単語学習',
  pp: '唇単語学習',
  cq: '楪単語学習',
  fb: '发単語学習',
  zl: '津単語学習'
}
const pronFuncs = {
  fg: calcPronFg,
  yj: calcPronYj,
  kl: calcPronKl,
  sb: calcPronSb,
  pp: calcPronPp,
  cq: calcPronCq,
  fb: calcPronFb,
  zl: calcPronZl
}
const inflFuncs = {
  fg: calcInflFg,
  yj: calcInflYj,
  kl: dummy,
  sb: dummy,
  pp: dummy,
  cq: dummy,
  fb: calcInflFb,
  zl: dummy
}
const revFuncs = {
  fg: reverseInflFg,
  yj: reverseInflYj,
  kl: dummy,
  sb: reverseInflSb,
  pp: dummy,
  cq: reverseInflCq,
  fb: dummy,
  zl: dummy
}
function dummy() {return [];}
const langSelector = document.getElementById('langSelector');
langSelector.addEventListener('change', () => {
  const selectedValue = langSelector.value;
  setLang(selectedValue);
});
function setLang(selectedLang) {
  lang = selectedLang;
  langSelector.value = selectedLang;
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
  const tableArea = document.getElementById('tableArea');
  const share = document.getElementById('shareWord');
  share.style.display = 'block';

  spell.innerHTML = '';
  const spellText = document.createElement('span');
  spellText.textContent = item.word;
  const mark = applyTextStyle(item, spellText);
  if (mark[1] !== 'pre') {spell.appendChild(mark[0]);}
  spell.appendChild(spellText);
  if (mark[1] !== 'sub') {spell.appendChild(mark[0]);}
  mean.textContent = `意味: ${item.mean}`;
  qualis.textContent = '';
  const pos = estmPos(item.qualis,'pos');
  qualisElm.textContent = `属性: ${estmPos(item.qualis,'qualis')}`;
  posElm.textContent = `品詞: ${pos}`;
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
    const pattern = new RegExp(`「${item.word}\\」`);
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
  tableArea.innerHTML = '';
  inflFuncs[lang](item.word,toi);
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
function calcPronSb(word) {
  const map1 = {
    a:'a',b:'w',c:'c',d:'r',f:'f',g:'ɰ',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',q:'j',s:'s',t:'t',α:'ɑ',θ:'θ',σ:'ʃ',φ:'ɸ',χ:'x',б:'b',в:'v',г:'g',ж:'ʒ',н:'ɴ',у:'u',ц:'ts',з:'z',э:'e'
  }
  const map2 = {
    a:'a',w:'β̞',c:'ç',r:'ɹ',f:'f',ɰ:'ɰ',h:'h',i:'i',k:'k',l:'l',m:'m',n:'n',o:'o',p:'p',j:'j',s:'s',t:'t',ɑ:'ɑ',θ:'θ',ʃ:'ʃ',ɸ:'ɸ',x:'x',b:'β',v:'v',g:'ɣ',ʒ:'ʒ',ɴ:'ɴ',u:'u',ts:'t͡s',z:'z',e:'e'
  }
  const map3 = {
    w:'ʷ',j:'ʲ',ɰ:'ˠ'
  }
  const map4 = {
    ts:'t͡s'
  }
  const phoneme = word
  .split('')
  .map(char => map1[char] || '?')
  .join('');
  const figure = phoneme.split('');
  let phonetic = '';
  let i = 0;
  while (i < figure.length) {
    const current = figure[i];
    if (map4[current + figure[i + 1]]) {
      phonetic += map4[current + figure[i + 1]]
      i += 2;
    } else if (map3[current] && map2[figure[i - 1]]) {
      phonetic += map3[current];
      i += 1;
    } else if (map2[current]) {
      phonetic += map2[current];
      i += 1;
    } else {
      phonetic += '?';
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
function calcPronCq (word) {
  const map1 = {
    a:'a',ā:'aː',c:'tʃ',i:'i',ī:'iː',m:'m',n:'n',p:'p',q:'kʲ',r:'ɾ',u:'u',ū:'uː',y:'j'
  }
  const map2 = {
    â:'a',î:'i',û:'u'
  }
  let phonetic = '';
  for (let i = 0; i < word.length; i++) {
    if (map2[word[i]]) {
      phonetic += map2[word[i]] + map1[word[i + 1]] + 'ː';
      i++;
    } else {
      phonetic += map1[word[i]];
    }
  }
  return `[${phonetic}]`
}
function calcPronFb(word) {
  const map1 = {
    a:'a',å:'ɛ',e:'e',i:'i',p:'p',b:'b',f:'pʰ',v:'bʰ',m:'m','-':''
  }
  const map2 = {
    a:'a',å:'ɛ',e:'e',i:'i',p:'p',b:'b',f:'ɸ',v:'β̞',m:'m','-':''
  }
  const map3 = {
    b:'m',v:'','-':''
  }
  let phoneme = '';
  for (let i = 0; i < word.length; i++) {
    phoneme += map1[word[i]];
  }
  let phonetic = '';
  for (let i = 0; i < word.length; i++) {
    if (i === word.length - 1 && word[i] in map3) {
      phonetic += map3[word[i]];
    } else {
      phonetic += map2[word[i]];
    }
  }
  return `/${phoneme}/ [${phonetic}]`;
}
function calcPronZl(word) {
  let phoneme = '';
  let phonetic = '';
  return `/${phoneme}/ [${phonetic}]`;
}
function estmPos(codeText,flag) {
  const codes = codeText.split(',');
  const rules = [
    [['名詞','格体','noun'],['動詞','実心','verb'],['形容詞','飾定','adj'],['述語','心子','verb'],['連体詞','連格','adj'],['副詞','連象','adv'],['接続詞','連包','conj'],['間投詞','非能','int']],
    { '0':['格','-noun'],'1':['実','-verb'],'2':['飾','-adj'],'3':['心','.verb'],'4':['洛','.adj'],'5':['潒','.adv'],'6':['泡','.conj'],'7':['非','.int'],'e':['着','nef'],'f':['離','def'],'g':['頭辞','pre'],'h':['尾辞','sub'],'i':['入辞',''],'j':['合辞',''],'k':['周辞',''],'l':['通辞','']},
    {
      '05fg':'前置詞',
      '05':'格助詞',
      '00':'名詞接尾辞',
      '11':'助動詞',
      '12':'助動詞',
      '13':'終助詞',
      '15':'接続助詞',
      '52':'助動詞',
      '54':'副助詞',
      '55':'副助詞',
      'eg':'接頭辞',
      'eh':'接尾辞'
    },
    {a:['代'],b:['自','内向'],c:['他','外向'],d:['両向'],m:['結び'],n:['解き']}
  ];
  let pos = [];
  let qualis = [];
  let color = [];
  codes.forEach(code => {
    if (code.length < 3 && !isNaN(code.slice(-1))) {
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
      let affix = [];
      if (code.length < 4) affix = ['',''];
      code.split('').forEach(char => {
        qualis[qualis.length - 1] += rules[1][char][0];
        affix.push(rules[1][char][1]);
      });
      color.push(affix);
      Object.keys(rules[2]).forEach(function (key) {
        if (code.includes(key)) {
          pos.push(rules[2][key]);
        }
      });
    }
  });
  if (pos.length < 1) {pos = null;}
  if (flag === 'pos') {return pos[0];}
  else if (flag === 'qualis') {return qualis;}
  else if (flag === 'color') {return color[0];}
}
function applyTextStyle(item, span) {
  let color = estmPos(item.qualis,'color');
  const mark = document.createElement('span');
  if (color[0].length > 1) {
    mark.textContent = color[2] === 'nef' ? color[0].slice(0,1) : color[0].slice(0,1) + color[0].slice(0,1);
    mark.classList.add(color[0].slice(1));
    span.classList.add(color[1].slice(1));
    const lineStyle = color[1].slice(0,1) === '-' ? 'solid' : 'dotted';
    span.style.setProperty('--line', lineStyle);
    color = color[3] + color[2];
  }
  else if (color[2].length > 1) color = color[3] + color[2];
  span.classList.add(color);
  return [mark, color.slice(0,3)];
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
  } else if (lang === 'yj' || lang === 'fb') {
    if (pos.includes('名詞')) {
      return '格体';
    } else if (pos === '形容詞') {
      return '飾定';
    } else if (pos.includes('動詞')) {
      if (lang === 'yj') {
        if (word.slice(-1) === 'l' || word.slice(-1) === 'j') {
          return word.slice(-2);
        } else {
          return word.slice(-2,-1) + 'C';
        }
      } else return '実心';
    }
  }
}
function calcInflFg(word,toi) {
  const area = document.getElementById('tableArea');
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

  const table = document.createElement('table');
  table.classList.add('inflectionTable');
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
  area.appendChild(table);
}
function calcInflYj(word,toi) {
  if (toi === '格体') calcInflYjNoun(word,toi);
  else if (toi === '飾定') calcInflYjAdj(word);
  else if (toi) calcInflYjVerb(word,toi);
}
function calcInflYjNoun(word,toi) {
  const area = document.getElementById('tableArea');
  
  const pron = calcPronYj(word);
  const match = pron.match(/(?<=\[).+(?=\])/);
  const phonetic = match ? match[0] : '';
  const vowels = ['æ', 'ɑ', 'e', 'i', 'ɯ'];
  let Vplace = -1;
  for (let i = phonetic.length -1; i >= 0; i--) {
    if(vowels.includes(phonetic[i])) {
      Vplace = phonetic.length - i;
      break;
    }
  }
  const stem = word.slice(0, -Vplace);
  let end = '';
  if (Vplace === 1) {end = '';}
  else {end = word.slice(-Vplace+1);}

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
  const table = document.createElement('table');
  table.classList.add('inflectionTable');
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
  area.appendChild(table);
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
  const area = document.getElementById('tableArea');

  let stem = '';
  let forms = {};
  let noun = {};
  if (toi === 'fl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '飾定形':   [['l','','f'],['l','j','f']],
    '飾潒形':   [['l','','r'],['l','j','r']]
    };
    noun = ['l','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'jl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '飾定形':   [['r','','f'],['r','j','f']],
    '飾潒形':   [['r','','r'],['r','j','r']]
    };
    noun = ['r','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'll') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '飾定形':   [['f','','f'],['f','j','f']],
    '飾潒形':   [['f','','r'],['f','j','r']]
    };
    noun = ['f','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'rl') {
    forms = {
    '実心形':   [['','',''],['','j','']],
    '飾定形':   [['i','','f'],['i','j','f']],
    '飾潒形':   [['i','','r'],['i','j','r']]
    };
    noun = ['i','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'fj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '飾定形':   [['j','','f'],['j','l','f']],
    '飾潒形':   [['j','','r'],['j','l','r']]
    };
    noun = ['f','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'jj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '飾定形':   [['f','','f'],['f','l','f']],
    '飾潒形':   [['f','','r'],['f','l','r']]
    };
    noun = ['f','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'lj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '飾定形':   [['r','','f'],['r','l','f']],
    '飾潒形':   [['r','','r'],['r','l','r']]
    };
    noun = ['r','j','k'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'rj') {
    forms = {
    '実心形':   [['','',''],['','l','']],
    '飾定形':   [['i','','f'],['i','l','f']],
    '飾潒形':   [['i','','r'],['i','l','r']]
    };
    noun = ['i','j','t'];
    prefix = word.slice(0,-2);
    stem = word;
  } else if (toi === 'fC') {
    forms = {
    '実心形':   [['f','',''],['fr','','']],
    '飾定形':   [['l','f','f'],['lfr','','f']],
    '飾潒形':   [['l','f','r'],['lfr','','r']]
    };
    noun = ['lfj','','t'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'jC') {
    forms = {
    '実心形':   [['j','',''],['jr','','']],
    '飾定形':   [['r','f','f'],['rfr','','f']],
    '飾潒形':   [['r','f','r'],['rfr','','r']]
    };
    noun = ['ijj','','k'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'lC') {
    forms = {
    '実心形':   [['l','',''],['lf','','']],
    '飾定形':   [['r','l','f'],['rlf','','f']],
    '飾潒形':   [['r','l','r'],['rlf','','r']]
    };
    noun = ['ilj','','k'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  } else if (toi === 'rC') {
    forms = {
    '実心形':   [['r','',''],['rf','','']],
    '飾定形':   [['j','r','f'],['jrf','','f']],
    '飾潒形':   [['j','r','r'],['jrf','','r']]
    };
    noun = ['jrj','','t'];
    prefix = word.slice(0,-2);
    stem = word.slice(-1);
  }
  
  const table = document.createElement('table');
  table.classList.add('inflectionTable');
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
  area.appendChild(table);
  calcInflYjNoun(prefix+insertAffix(stem,noun),toi);
}
function calcInflYjAdj(word,toi) {
  const area = document.getElementById('tableArea');

  const prefix = word.slice(0,-2);
  const stem = word.slice(-2,-1);
  const forms = {
    '原級':   [['','','x'],['','','f'],['','','s']],
    '比較級':   [['l','','x'],['j','','f'],['i','','s']],
    '最上級':   [['r','lk','x'],['j','jk','f'],['f','ik','s']]
    };

  const table = document.createElement('table');
  table.classList.add('inflectionTable');
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
  area.appendChild(table);
}
function calcInflFb(word,toi) {
  if (toi === '格体') calcInflFbNoun(word);
  else if (toi === '実心') calcInflFbVerb(word);
  else if (toi === '飾定') calcInflFbAdj(word, '');
}
function calcInflFbNoun(word) {
  const area = document.getElementById('tableArea');
  const definites = {
    '非限定':'',
    '限定':'ap'
  };
  const compensates = {
    '非補語':'',
    '補語':'pe'
  };
  const cases = ['活格','緩格','与格'];
  const relaxive = {
    i:'a',a:'åi'
  }
  const dAgrees = {
    '非限定一致':'b',
    '限定一致':''
  };
  const cAgrees = {
    '活格一致':'i',
    '緩格一致':'ie',
    '与格一致':'ia'
  };
  const tableA = document.createElement('table');
  tableA.classList.add('inflectionTable');
  const head1 = document.createElement('tr');
  const head2 = document.createElement('tr');
  const cornerA = document.createElement('th');
  cornerA.rowSpan = 2;
  head1.appendChild(cornerA);
  for (let definite in definites) {
    const definiteTh = document.createElement('th');
    definiteTh.textContent = definite;
    definiteTh.colSpan = 2;
    head1.appendChild(definiteTh);
    for (let compensate in compensates) {
      const compensateTh = document.createElement('th');
      compensateTh.textContent = compensate;
      head2.appendChild(compensateTh);
    }
  }
  tableA.appendChild(head1);
  tableA.appendChild(head2);
  cases.forEach((caseName, index) => {
    const row = document.createElement('tr');
    const caseTh = document.createElement('th');
    caseTh.textContent = caseName;
    row.appendChild(caseTh);
    for (let definite in definites) {
      for (let compensate in compensates) {
        const td = document.createElement('td');
        let form = word;
        if (index === 1) form = word.slice(0,-2) + relaxive[word.slice(-2,-1)] + word.slice(-1);
        else if (index === 2) form = soundChangeFb(word, 'ef');
        form = soundChangeFb(form, definites[definite]);
        form = soundChangeFb(form, compensates[compensate]);
        td.textContent = form;
        row.appendChild(td);
      }
    }
    tableA.appendChild(row);
  });
  const tableB = document.createElement('table');
  tableB.classList.add('inflectionTable');
  const head3 = document.createElement('tr');
  const cornerB = document.createElement('th');
  cornerB.textContent = '所有形';
  head3.appendChild(cornerB);
  for (let cAgree in cAgrees) {
    const cAgreeTh = document.createElement('th');
    cAgreeTh.textContent = cAgree;
    head3.appendChild(cAgreeTh);
  }
  tableB.appendChild(head3);
  for (let dAgree in dAgrees) {
    const row = document.createElement('tr');
    const dAgreeTh = document.createElement('th');
    dAgreeTh.textContent = dAgree;
    row.appendChild(dAgreeTh);
    for (let cAgree in cAgrees) {
      const td = document.createElement('td');
      let form = word;
      form = soundChangeFb(form, dAgrees[dAgree] + cAgrees[cAgree]);
      td.textContent = form;
      row.appendChild(td);
    }
    tableB.appendChild(row);
  }
  area.appendChild(tableA);
  area.appendChild(tableB);
}
function calcInflFbVerb(word) {
  const area = document.getElementById('tableArea');
  const tenses = {
    '過去時制': 'am.',
    '現在時制': '',
    '未来時制': 'ip.'
  }
  const aspects = {
    '完結相': '',
    '進行相': 'evm',
    '既済相': 'imp',
    '未済相': 'eb'
  }
  const moods = {
    '叙述法': '',
    '命令法': 'mipa',
    '疑問法': 'vebå'
  }
  const aspectColor = {
    '完結相': '#fdd',
    '進行相': '#ffc',
    '既済相': '#aee',
    '未済相': '#aea'
  }
  const table = document.createElement('table');
  table.classList.add('inflectionTable');
  const head = document.createElement('tr');
  const cornerA = document.createElement('th')
  cornerA.colSpan = 2;
  head.appendChild(cornerA);
  for (let tense in tenses) {
    const tenseTh = document.createElement('th');
    tenseTh.textContent = tense;
    head.appendChild(tenseTh);
  }
  table.appendChild(head);
  
  for (let aspect in aspects) {
    const aspectTh = document.createElement('th');
    aspectTh.textContent = aspect;
    aspectTh.rowSpan = 3;
    aspectTh.style.writingMode = 'vertical-rl';
    for (let mood in moods) {
      const row = document.createElement('tr');
      if (mood === '叙述法') row.appendChild(aspectTh);
      const moodTh = document.createElement('th');
      moodTh.textContent = mood;
      row.appendChild(moodTh);
      for (let tense in tenses) {
        const td = document.createElement('td');
        td.style.backgroundColor = aspectColor[aspect];
        let form = word;
        form = soundChangeFb(form, tenses[tense]);
        form = soundChangeFb(form, aspects[aspect]);
        form = soundChangeFb(form, moods[mood]);
        td.textContent = form;
        row.appendChild(td);
      }
      table.appendChild(row);
    }
  }
  area.appendChild(table);
  for (let aspect in aspects) {
    for (tense in tenses) {
      let form = word;
      form = soundChangeFb(form, tenses[tense]);
      form = soundChangeFb(form, aspects[aspect]);
      calcInflFbAdj(form, tense.slice(0,-2)+aspect.slice(0,-1));
    }
  }
}
function calcInflFbAdj(word, verb) {
  const area = document.getElementById('tableArea');
  const degrees = {
    '原級': '',
    '比較級': 'fe',
    '最上級': 'piv'
  }
  const dAgrees = {
    '非限定一致':'b',
    '限定一致':''
  };
  const cAgrees = {
    '活格一致':'i',
    '緩格一致':'ie',
    '与格一致':'ia'
  };
  const compensates = {
    '非補語':'',
    '補語':'pe'
  };
  const relativities = ['活格関係','緩格関係','与格関係'];
  const relaxive = {
    i:'a',e:'å',å:'ea',a:'åi'
  }
  const dAgreeColor = {
    '非限定一致': '#fdd',
    '限定一致': '#ffc'
  };
  const compColor = {
    '非補語': '#aee',
    '補語': '#aea'
  }
  const table = document.createElement('table');
  table.classList.add('inflectionTable');
  const head = document.createElement('tr');
  const corner = document.createElement('th');
  corner.colSpan = 2;
  if (verb.length > 0) corner.textContent = verb;
  head.appendChild(corner);
  if (verb.length < 1) {
    for (let degree in degrees) {
      const degreeTh = document.createElement('th');
      degreeTh.textContent = degree;
      head.appendChild(degreeTh);
    }
  } else {
    relativities.forEach(relativity => {
      const relativityTh = document.createElement('th');
      relativityTh.textContent = relativity;
      head.appendChild(relativityTh);
    });
  }
  table.appendChild(head);
  
  for (let dAgree in dAgrees) {
    const dAgreeTh = document.createElement('th');
    dAgreeTh.textContent = dAgree;
    dAgreeTh.rowSpan = 3;
    for (let cAgree in cAgrees) {
      const row = document.createElement('tr');
      if (cAgree === '活格一致') row.appendChild(dAgreeTh);
      const cAgreeTh = document.createElement('th');
      cAgreeTh.textContent = cAgree;
      row.appendChild(cAgreeTh);
      if (verb.length < 1) {
        for (let degree in degrees) {
          const td = document.createElement('td');
          td.style.backgroundColor = dAgreeColor[dAgree];
          let form = word;
          form = soundChangeFb(form, degrees[degree]);
          form = soundChangeFb(form, dAgrees[dAgree] + cAgrees[cAgree]);
          td.textContent = form;
          row.appendChild(td);
        }
      } else {
        relativities.forEach((relativity, index) => {
          const td = document.createElement('td');
          td.style.backgroundColor = dAgreeColor[dAgree];
          let form = word;
          if (index === 1) {
            if (relaxive[word.slice(-2,-1)]) form = word.slice(0,-2) + relaxive[word.slice(-2,-1)] + word.slice(-1);
            else form = word.slice(0,-3) + relaxive[word.slice(-3,-2)] + word.slice(-2);
          }
          else if (index === 2) form = soundChangeFb(word, 'ef');
          form = soundChangeFb(form, dAgrees[dAgree] + cAgrees[cAgree]);
          td.textContent = form;
          row.appendChild(td);
        });
      }
      table.appendChild(row);
    }
  }
  if (verb.length > 0) {
    area.appendChild(table);
    return;
  }
  for (let compensate in compensates) {
    const row = document.createElement('tr');
    const compensateTh = document.createElement('th');
    compensateTh.textContent = compensate;
    compensateTh.colSpan = 2;
    row.appendChild(compensateTh);
    for (let degree in degrees) {
      const td = document.createElement('td');
      td.style.backgroundColor = compColor[compensate];
      let form = word;
      form = soundChangeFb(form, degrees[degree]);
      form = soundChangeFb(form, compensates[compensate]);
      td.textContent = form;
      row.appendChild(td);
    }
    table.appendChild(row);
  }
  area.appendChild(table);
}
function soundChangeFb(word1, word2) {
  const colliquation = {
    p:{p:'pp',b:'bb',f:'pf',v:'bv',m:'bm'},
    b:{p:'pp',b:'bb',f:'bif',v:'bv',m:'bm'},
    f:{p:'fip',b:'fm',f:'pf',v:'fm',m:'bm'},
    v:{p:'vip',b:'vb',f:'pf',v:'bv',m:'vm'},
    m:{p:'mp',b:'mb',f:'mf',v:'mv',m:'mm'}
  };
  const cGradation = {
    p:{a:'ba',å:'på',e:'pe',i:'fi'},
    b:{a:'va',å:'bå',e:'be',i:'pi'},
    f:{a:'va',å:'få',e:'fe',i:'fi'},
    v:{a:'va',å:'vå',e:'ve',i:'mi'},
    m:{a:'ba',å:'må',e:'me',i:'mi'}
  }
  const cons = 'pbfvm';
  let last = word1.slice(-1);
  let initial = word2.slice(0,1) || null;
  if ((word1.endsWith('am.') || word1.endsWith('ip.'))) {
    if (cons.includes(initial) || word2 === 'evm') {
      word1 = word1.slice(0,-2);
      last = word1.slice(-1);
      if (word2 === 'evm') {
        word2 = 'vm';
        initial = word2.slice(0,1);
      }
    } else {
      word1 = word1.slice(0,-1);
      last = word1.slice(-1);
    }
  }
  if (word2 === '') return word1;
  if (cons.includes(last)) {
    if (cons.includes(initial)) return word1.slice(0,-1) + colliquation[last][initial] + word2.slice(1);
    else return word1.slice(0,-1) + cGradation[last][initial] + word2.slice(1);
  } else return word1 + word2;
}
function parseCont(meaningText,data) {
  const container = document.createElement('span');

  const parts = meaningText.split(/(「[^」]+」)/);

  parts.forEach(part => {
    if (/^「[^」]+」$/.test(part)) {
      const innerText = part.slice(1,-1);
      const wordWithMeaning = innerText.split('(');
      let wordOnly = wordWithMeaning[0].trim();
      const meaning = wordWithMeaning[1] ? wordWithMeaning[1].slice(0,-1).trim():'';
      let index = 0;
      if (/-[0-9]+$/.test(wordOnly)) {
        index = wordOnly.split('-')[1];
        wordOnly = wordOnly.split('-')[0];
      }

      const link = document.createElement('a');
      link.textContent = wordOnly;

      const targetItems = data.filter(item => item.word === wordOnly);
      const targetItem = targetItems[index];

      const bracket = document.createElement('span');
      bracket.textContent = '「';
      const backBracket = document.createElement('span');
      backBracket.textContent = '」';
      const targetMeaning = document.createElement('span');
      targetMeaning.textContent = `(${targetItem?.mean.split(',')[0]})`;

      if (targetItem) {
        link.href = '#';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          showDetail(targetItem);
        });
        container.appendChild(bracket);
        container.appendChild(link);
        container.appendChild(targetMeaning);
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
    const tableArea = document.getElementById('tableArea');
    const share = document.getElementById('shareWord');
    const langInfo = document.getElementById('langInfo');
    const count = document.createElement('p');
    count.textContent = `現在の見出し語数: ${data.length}`;

    search.value = '';
    suggest.innerHTML = '';
    detail.style.display = 'none';
    tableArea.innerHTML = '';
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
          const mark = applyTextStyle(item, wordElm);
          mark[0].classList.add('word');

          const meanElm = document.createElement('span');
          meanElm.classList.add('mean')
          meanElm.textContent = item.mean;

          result.addEventListener('click', () => {
            showDetail(item);
          });
          suggest.appendChild(result);
          if (mark[1] !== 'pre') {result.appendChild(mark[0]);}
          result.appendChild(wordElm);
          if (mark[1] !== 'sub') {result.appendChild(mark[0]);}
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
  const headers = ['単語','辞書形','意味','品詞','属性','値'];
  analysis.innerHTML = '';
  const row = document.createElement('tr');
  headers.forEach(head => {
    const thead = document.createElement('th');
    thead.textContent = head;
    row.appendChild(thead);
  });
  analysis.appendChild(row);
  const chars = 'a-zâāêēëîīïôōûū';
  const words = sentence
    .toLowerCase()
    .trim()
    .match(new RegExp(`[${chars}]+|[^${chars}\\s]`,'gi'));
  words.forEach(word => {
    
    const th = document.createElement('th');
    th.textContent = word;

    const reverses = revFuncs[lang](word);
    const matches = dicData.filter(entry => entry.word.toLowerCase() === word);
    matches.forEach(match => {
      if (reverses.filter(entry => entry.word === word).length === 0) {
        reverses.push({...match, value:'-'});
      }
    });
    if (reverses.length === 0 && !new RegExp(`^[${chars}]+$`,'i').test(word)) {
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
        const dicForm = document.createElement('td');
        const formElm = document.createElement('a');
        const meanCell = document.createElement('td');
        const posCell = document.createElement('td');
        const qualisCell = document.createElement('td');
        const valueCell = document.createElement('td');

        let index = '';
        const suggests = dicData.filter(entry => entry.word === reverses[i].word);
        if (suggests.length > 1) {
          index = '-' + suggests.findIndex(entry => entry.mean === reverses[i].mean && entry.qualis === reverses[i].qualis);
        }
        formElm.href = `https://fogenese.github.io/fogenese-homepage/dictionary.html?lang=${lang}&word=${reverses[i].word}${index}`;
        
        const mark = applyTextStyle(reverses[i], formElm);
        formElm.textContent = reverses[i].word;
        if (mark[1] !== 'pre') {dicForm.appendChild(mark[0]);}
        dicForm.appendChild(formElm);
        if (mark[1] !== 'sub') {dicForm.appendChild(mark[0]);}
        meanCell.textContent = reverses[i].mean;
        posCell.textContent = estmPos(reverses[i].qualis,'pos');
        qualisCell.textContent = estmPos(reverses[i].qualis,'qualis');
        valueCell.textContent = reverses[i].value;
        analysis.appendChild(tr);
        tr.appendChild(dicForm);
        tr.appendChild(meanCell);
        tr.appendChild(posCell);
        tr.appendChild(qualisCell);
        tr.appendChild(valueCell);
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
  const rules = [
    { u: '基本形', i: '連用形', a: '命令形' },
    { i: '基本形', a: '連用形', do: '程度形' }
  ];
  const verbs = dicData.filter(entry => entry.word === word.slice(0,-1)+'u');
  const adjs1 = dicData.filter(entry => entry.word === word.slice(0,-1)+'i');
  let adjs2 = [];
  if (rules[1][word.slice(-2)] !== undefined) {
    adjs2 = dicData.filter(entry => entry.word === word.slice(0,-2)+'i');
  }
  const adjs = [...adjs1,...adjs2];
  let infl = null;
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
    if (word.endsWith('f')) {qualis = '・飾定';}
    else if (word.endsWith('r')) {qualis = '・飾潒';}
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
function reverseInflSb(word) {
  return [];
}
function reverseInflCq(word) {
  const results = [];
  const rules = [
    {end: ['ā','ī','ū'], value: '連体形'},
    {ā:'a', ī:'i', ū:'u'},
    {ra:'主格', qa:'主格', mi:'対格', pû:'処格', yū:'向格', rû:'具格'},
    {cani:'過去', mari:'進行', yapi:'推量', pami:'意志'}
  ];
  let vStem = word;
  let vValue = '';
  for(let i = 0; i >= 0; i++) {
    if (i === 0 && rules[2][vStem.slice(0,2)]) {
      vValue = vValue + '・' + rules[2][vStem.slice(0,2)];
      vStem = vStem.slice(2)
    } else if (rules[3][vStem.slice(0,4)]) {
      vValue = vValue + '・' + rules[3][vStem.slice(0,4)];
      vStem = vStem.slice(4);
    } else break;
  }
  const vp = dicData.find(entry => entry.word === vStem.slice(0,-1) + rules[1][vStem.slice(-1)]);
  const vam = dicData.find(entry => entry.word.slice(0,-3) === vStem.slice(2,-3));
  const ncm = dicData.find(entry => entry.word === vStem)
  const aam = dicData.find(entry => entry.word === word.slice(2));
  if (rules[0].end.includes(vStem.slice(-1)) && vp && estmPos(vp.qualis,'pos').includes('動詞')) {
    results.push({...vp, value:'述語形' + vValue});
  } if (vStem.endsWith('ima') && vam && estmPos(vam.qualis) === 'verb') {
    results.push({...vam, value:'連体形' + vValue});
  } if (ncm && vValue.length < 4 && ncm.qualis !== '2') {
    results.push({...ncm, value:vValue.slice(1)});
  } if (aam && word.slice(0,2) === word.slice(2,4) && aam.qualis === '2') {
    results.push({...aam, value:'連体形'});
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
      if (incorrections.length > 1 && r3 < 5 && k === r2) {
        r1.push(incorrections[r4]);
        requestionFlag = true;
        k++;
      } else {
        const r5 = Math.floor(Math.random() * dicData.length);
        if (!r1.includes(r5) || r5 !== incorrections[r4]) {
          r1.push(r5);
          k++;
        }
      }
    }
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

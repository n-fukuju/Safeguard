const fs   = require('fs');
const util = require('util');

// iconv -f sjis -t utf8 pn_ja.dic > pn_ja.utf8.dic
// テキストファイルを読み込んで、JSONを出力
// -> /config/ へコピー
v// [日本語評価極性辞書](http://www.cl.ecei.tohoku.ac.jp/index.php?Open%20Resources%2FJapanese%20Sentiment%20Polarity%20Dictionary)
var input = 'wago.121808.pn.txt';
// [単語感情極性対応表](http://www.lr.pi.titech.ac.jp/~takamura/pndic_ja.html)
var input2 = 'pn_ja.utf8.dic';
var output = 'pn_wago.json';
var output2 = 'pn_dic.json';
var rePosi = /ポジ/;

var obj = {};
var buffer = fs.readFileSync(input);
buffer.toString().split('\n').forEach(function(line){
        var lines = line.split('\t');
        if(!lines || lines.length < 2){ return; }
        var words = lines[1].split(' ');
        if(!words){ return; }
        var word = words[0];
        var value = -1;
        if(rePosi.exec(lines[0])){ value = 1;}
        obj[word] = value;
});
fs.writeFile(output, JSON.stringify(obj));

var obj2 = {}
var buffer2 = fs.readFileSync(input2);
buffer2.toString().split('\n').forEach(function(line){
        var lines = line.split(':');
        if(!lines || lines.length < 3){ return; }
        var word = lines[0];
        var value = Number(lines[3]);
        obj2[word] = value;
});


fs.writeFile(output2, JSON.stringify(obj2));
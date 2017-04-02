var execSync = require('child_process').execSync;
var fs       = require('fs');
var pn_wago  = JSON.parse(fs.readFileSync('config/pn_wago.json', 'utf8'));
var pn_dic   = JSON.parse(fs.readFileSync('config/pn_dic.json', 'utf8'));

exports.getNegaPosi = function(word){
        return module.exports.getNegaPosiFromWago(word);
}
exports.getNegaPosiFromWago = function(word){
        var value = pn_wago[word];
        if(value){return value;}else{return 0;}
}
exports.getNegaPosiFromDic = function(word){
        var value = pn_dic[word];
        if(value){return value;}else{return 0;}
}

exports.textToConsole = function(text, pnDic, setReflect, isDetailed){
        var util = require('util');
        console.log(util.inspect(module.exports.textToObj(text, pnDic, setReflect, isDetailed), {depth:null}));
}

// Dependency parsing and return Japanese text.
// [string]text : Japanese text.
exports.textToObj = function(text, pnDic, setReflect, isDetailed){
        // ignore stderr(J.DepP profiler output)
        var opt = {input: text, stdio:['pipe','pipe','ignore']};
        const result = execSync('mecab | jdepp', opt);
        return module.exports.depToObj(result.toString(), pnDic, setReflect, isDetailed);
}// Convert J.DepP command output to Json.
// [string]depResult : J.DepP command output.
// return object:
//   { '<index>':
//     { depend: '<index>D',
//       words: [
//         {word: '<word>',
//          info: ['wordinfo'...],
//          pn: <pn>
//         }
//       subtotal: <pn total>
//     }
//     '<index>':
exports.depToObj = function(depResult, pnDic, setReflect, isDetailed){
        var arr = depResult.valueOf().split("\n");
        var re = /^\* (\d) (.*)/;
        var obj = {};
        var dep = null;
        for(var i=0; i < arr.length; i++){
                var line = arr[i];
                var m = line.match(re);
                if(/^EOS/.test(line)){ break; }
                if(m != null && m.length >= 3){
                        // index
                        dep = m[1];
                        obj[dep] = {};
                        obj[dep].depend = m[2];
                        obj[dep].words = []
                }else if(dep){
                        // word
                        var wordObj = {};
                        wordObj.word = line.split("\t")[0];
                        if(isDetailed){ wordObj.info = line.split("\t")[1]; }
                        wordObj.pn = 0;
                        if(wordObj.info){ wordObj.info = wordObj.info.split(","); }
                        //if(wordObj.info && pn[wordObj.word]){ wordObj.pn = pn[wordObj.word]; }
                        if(pnDic == "wago"){wordObj.pn = module.exports.getNegaPosiFromWago(wordObj.word);}
                        else if(pnDic == "dic"){wordObj.pn = module.exports.getNegaPosiFromDic(wordObj.word);}
                        else{wordObj.pn = module.exports.getNegaPosi(wordObj.word);}
                        obj[dep].words.push(wordObj);
                }
        }
        // to subtotal
        for(var prop in obj){
            var subtotal = 0;
            for(var i=0; i<obj[prop].words.length; i++){
                subtotal += obj[prop].words[i].pn;
            }
            obj[prop].subtotal = subtotal;
        }
        // ref dependent
        if(setReflect){
            var re = /^(\d+)D/;
            for(var prop in obj){
                var m = obj[prop].depend.match(re);
                if(m){
                    var d = m[1];
                    for(var index in obj){
                        if(d==index){ obj[prop].dependObj = obj[index];break; }
                    }
                }
            }
        }
    return obj;
}

exports.isDepended = function(obj, target, keyword){
    var re = /^(\d+)D/;
    for(var prop in obj){
        if(prop == target){
            var m = obj[prop].depend.match(re);
            if(m){
               var depend = m[0];
               for(var id in obj){
                   if(id == depend){ /* todo */ }
               }
            }
        }
    }
    return false;
}
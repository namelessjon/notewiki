/***************************************
*
*	Javascript Textile->HTML conversion
*
*	ben@ben-daglish.net (with thanks to John Hughes for improvements)
*   Issued under the "do what you like with it - I take no respnsibility" licence
*
*   Some modifications by Jonathan Stott
*   - biggest mod is the way links are handled.  This now involves a more complex
*   process, but stops links being double-counted.
****************************************/

var inpr,inbq,inbqq,inpre,html;
var aliases = new Array;
var alg={'>':'right','<':'left','=':'center','<>':'justify','~':'bottom','^':'top'};
var ent={"'":"&#8217;"," - ":" &#8211; ","--":"&#8212;"," x ":" &#215; ","\\.\\.\\.":"&#8230;","\\(C\\)":"&#169;","\\(R\\)":"&#174;","\\(TM\\)":"&#8482;"};
var tags={"b":"\\*\\*","i":"__","em":"_","strong":"\\*","cite":"\\?\\?","sup":"\\^","sub":"~","span":"\\%","del":"-","code":"@","ins":"\\+","del":"-"};
var le="\n\n";
var lstlev=0,lst="",elst="",intable=0,mm="";
var para = /^p(\S*)\.\s*(.*)/;
var rfn = /^fn(\d+)\.\s*(.*)/;
var bq = /^bq\.(\.)?\s*/;
var table=/^table\s*{(.*)}\..*/;
var trstyle = /^\{(\S+)\}\.\s*\|/;

// all the types of links and link-like entities we're interested in matching.
// Each link handler has two components.
//   matcher: A string, with no captures, which will be made into a regex to find links of the appropriate type in the text
//   handler: The function which will be called with the full text matched by matcher.  It returns the replacement text.
var textileLinkHandlers = [
    {
        // A normal textile link
        matcher: '\\"[^\\"]+\":(?:http|https|mailto):\\S+',
        handler: function(text) {
            var m = /"([^\"]+)":(\S+)/.exec(text);
            return make_link(m[2], m[1]);
        }
    },
    {
        // Either a textile reference link, or a textile link without http://
        matcher: '\\"[^\\"]+\":\\S+',
        handler: function(text) {
            var m = /"([^\"]+)":(\S+)/.exec(text);
            var link = aliases[m[2]] || ("http://" + m[2]);
            return make_link(link, m[1]);
        }
    },
    {
        // An image wrapped in a link
        matcher: '![^!\\s]+!(?::\\S+)',
        handler: function(text) {
            return make_image(text, /!([^!\s]+)!:(\S+)/);
        }
    },
    {
        // An image (no link)
        matcher: '![^!\\s]+!',
        handler: function(text) {
            return make_image(text, /!([^!\s]+)!/);
        }
    },
    {
        // A link like [[Link]] or like [[LinkPage|some text]]
        matcher : "\\[\\[[A-Z]\\w{2,}(?:\\|[^\\]]+)?\\]\\]",
        handler: function(text) {
            var m = /\[\[([A-Z]\w{2,})(?:\|([^\]]+))?\]\]/.exec(text);
            return make_link(m[1], m[2]);
        }
    },
    {
        // a WikiWord
        matcher : "[A-Z]+[a-z]+[A-Z]+[a-z]\\w+",
        handler: function(text) { return make_link(text); }
    }
];

// this regex matches any link we care about.
var anyLinkRegex = new RegExp("("+ textileLinkHandlers.map(function (i) { return i.matcher; }).join(")|(") + ")", 'g' );


function convert(t) {
	var lines = t.split(/\r?\n/);
	html="";
	inpr=inbq=inbqq=inpre=0;
	for(var i=0;i<lines.length;i++) {
		if(lines[i].indexOf("[") == 0 && lines[i][1] != "[" ) {
			var m = lines[i].indexOf("]");
			aliases[lines[i].substring(1,m)]=lines[i].substring(m+1);
		}
	}
	for(i=0;i<lines.length;i++) {
        if (lines[i].indexOf("[") == 0 && lines[i][1] != "[") {continue;}

        // deal with pre tags.
        if (mm = /<pre>/.exec(lines[i])) { inpre = 1; html += (lines[i] + "\n"); continue; }
        if (mm = /<\/pre>/.exec(lines[i])) { inpre= 0; }
        if (inpre) { html += (lines[i] + "\n"); continue; }

		if(mm=para.exec(lines[i])){stp(1);inpr=1;html += lines[i].replace(para,"<p"+make_attr(mm[1])+">"+prep(mm[2]));continue;}
		if(mm = /^h(\d)(\S*)\.\s*(.*)/.exec(lines[i])){stp(1);html += tag("h"+mm[1],make_attr(mm[2]),prep(mm[3]))+le;continue;}
		if(mm=rfn.exec(lines[i])){stp(1);inpr=1;html+=lines[i].replace(rfn,'<p id="fn'+mm[1]+'"><sup>'+mm[1]+'<\/sup>'+prep(mm[2]));continue;}
		if (lines[i].indexOf("*") == 0) {lst="<ul>";elst="<\/ul>";}
		else if (lines[i].indexOf("#") == 0) {lst="<\ol>";elst="<\/ol>";}
		else {while (lstlev > 0) {html += elst;if(lstlev > 1){html += "<\/li>";}else{html+="\n";}html+="\n";lstlev--;}lst="";}
		if(lst) {
			stp(1);
			var m = /^([*#]+)\s*(.*)/.exec(lines[i]);
			var lev = m[1].length;
			while(lev < lstlev) {html += elst+"<\/li>\n";lstlev--;}
			while(lstlev < lev) {html=html.replace(/<\/li>\n$/,"\n");html += lst;lstlev++;}
			html += tag("li","",prep(m[2]))+"\n";
			continue;
		}
		if (lines[i].match(table)){stp(1);intable=1;html += lines[i].replace(table,'<table style="$1;">\n');continue;}
		if ((lines[i].indexOf("|") == 0)  || (lines[i].match(trstyle)) ) {
			stp(1);
			if(!intable) {html += "<table>\n";intable=1;}
			var rowst="";var trow="";
			var ts=trstyle.exec(lines[i]);
			if(ts){rowst=qat('style',ts[1]);lines[i]=lines[i].replace(trstyle,"\|");}
			var cells = lines[i].split("|");
			for(j=1;j<cells.length-1;j++) {
				var ttag="td";
				if(cells[j].indexOf("_.")==0) {ttag="th";cells[j]=cells[j].substring(2);}
				cells[j]=prep(cells[j]);
				var al=/^([<>=^~\/\\\{]+.*?)\.(.*)/.exec(cells[j]);
				var at="",st="";
				if(al != null) {
					cells[j]=al[2];
					var cs= /\\(\d+)/.exec(al[1]);if(cs != null){at +=qat('colspan',cs[1]);}
					var rs= /\/(\d+)/.exec(al[1]);if(rs != null){at +=qat('rowspan',rs[1]);}
					var va= /([\^~])/.exec(al[1]);if(va != null){st +="vertical-align:"+alg[va[1]]+";";}
					var ta= /(<>|=|<|>)/.exec(al[1]);if(ta != null){st +="text-align:"+alg[ta[1]]+";";}
					var is= /\{([^\}]+)\}/.exec(al[1]);if(is != null){st +=is[1];}
					if(st != ""){at+=qat('style',st);}					
				}
				trow += tag(ttag,at,cells[j]);
			}
			html += "\t"+tag("tr",rowst,trow)+"\n";
			continue;
		}
		if(intable) {html += "<\/table>"+le;intable=0;}

		if (lines[i]=="") {stp();}
		else if (!inpr) {
			if(mm=bq.exec(lines[i])){lines[i]=lines[i].replace(bq,"");html +="<blockquote>";inbq=1;if(mm[1]) {inbqq=1;}}
			html += "<p>"+prep(lines[i]);inpr=1;
		}
		else {html += prep(lines[i]);}
    }
    // close our table at the end of the document if it wasn't already.
    if(intable) {html += "<\/table>"+le;intable=0;}

    stp();
	return html;
}

function prep(m){
	for(i in ent) {m=m.replace(new RegExp(i,"g"),ent[i]);}
	for(i in tags) {
		m = make_tag(m,RegExp("^"+tags[i]+"(.+?)"+tags[i]),i,"");
		m = make_tag(m,RegExp(" "+tags[i]+"(.+?)"+tags[i]),i," ");
    }
    m=m.replace(anyLinkRegex, handle_link);
	m=m.replace(/\[(\d+)\]/g,'<sup><a href="#fn$1">$1<\/a><\/sup>');
	m=m.replace(/([A-Z]+)\((.*?)\)/g,'<acronym title="$2">$1<\/acronym>');
	m=m.replace(/(=)?"([^\"]+)"/g,function($0,$1,$2){return ($1)?$0:"&#8220;"+$2+"&#8221;"});

	return m;
}

// called after a successful match of the anyLinkRegex
// It looks for the argument which isn't null, calls the handler from the array of handlers.
function handle_link(match) {
    for (var i = 0; i < textileLinkHandlers.length; i++) {
        if (arguments[i+1]) {
            return textileLinkHandlers[i].handler(match);
        }
    }
}

function make_tag(s,re,t,sp) {
	while(m = re.exec(s)) {
		var st = make_attr(m[1]);
		m[1]=m[1].replace(/^[\[\{\(]\S+[\]\}\)]/g,"");
		m[1]=m[1].replace(/^[<>=()]+/,"");
		s = s.replace(re,sp+tag(t,st,m[1]));
	}
	return s;
}

function make_link(href, text) {
    return text ? '<a href="'+href+'">'+text+'<\/a>' : '<a href="'+href+'">'+href+'<\/a>';
}

function make_image(m,re) {
	var ma = re.exec(m);
	if(ma != null) {
		var attr="";var st="";
		var at = /\((.*)\)$/.exec(ma[1]);
		if(at != null) {attr = qat('alt',at[1])+qat("title",at[1]);ma[1]=ma[1].replace(/\((.*)\)$/,"");}
		if(ma[1].match(/^[><]/)) {st = "float:"+((ma[1].indexOf(">")==0)?"right;":"left;");ma[1]=ma[1].replace(/^[><]/,"");}
		var pdl = /(\(+)/.exec(ma[1]);if(pdl){st+="padding-left:"+pdl[1].length+"em;";}
		var pdr = /(\)+)/.exec(ma[1]);if(pdr){st+="padding-right:"+pdr[1].length+"em;";}
		if(st){attr += qat('style',st);}
		var im = '<img src="'+ma[1]+'"'+attr+" />";
		if(ma.length >2) {im=tag('a',qat('href',ma[2]),im);}
		m = m.replace(re,im);
	}
	return m;
}

function make_attr(s) {
	var st="";var at="";
	if(!s){return "";}
	var l=/\[(\w\w)\]/.exec(s);
	if(l != null) {at += qat('lang',l[1]);}
	var ci=/\((\S+)\)/.exec(s);
	if(ci != null) {
		s = s.replace(/\((\S+)\)/,"");
		at += ci[1].replace(/#(.*)$/,' id="$1"').replace(/^(\S+)/,' class="$1"');
	}
	var ta= /(<>|=|<|>)/.exec(s);if(ta){st +="text-align:"+alg[ta[1]]+";";}
	var ss=/\{(\S+)\}/.exec(s);if(ss){st += ss[1];if(!ss[1].match(/;$/)){st+= ";";}}
	var pdl = /(\(+)/.exec(s);if(pdl){st+="padding-left:"+pdl[1].length+"em;";}
	var pdr = /(\)+)/.exec(s);if(pdr){st+="padding-right:"+pdr[1].length+"em;";}
	if(st) {at += qat('style',st);}
	return at;
}

function qat(a,v){return ' '+a+'="'+v+'"';}
function tag(t,a,c) {return "<"+t+a+">"+c+"</"+t+">";}
function stp(b){if(b){inbqq=0;}if(inpr){html+="<\/p>"+le;inpr=0;}if(inbq && !inbqq){html+="<\/blockquote>"+le;inbq=0;}}

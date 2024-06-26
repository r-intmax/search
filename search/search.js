//服务器用户数据加载未完成

var document = window.document;

function getCookie(name) {
	var cookies = document.cookie.split(";"); 
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim();
		if (cookie.startsWith(name + "=")) {
			return cookie.substring(name.length + 1);
		}
	}
	return "";
}

const expires = new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)).toUTCString();

//document.cookie = "baike=true; expires=" + expires;
if (getCookie("restricted_domains") == "") {
	document.cookie = "restricted_domains=%20 -site:bing.com; expires=" + expires;
}

var fake_cookie = "";

function getFakeCookie(name) {
	var cookies = fake_cookie.split(";"); 
	for (var i = 0; i < cookies.length; i++) {
		var cookie = cookies[i].trim();
		if (cookie.startsWith(name + "=")) {
			return cookie.substring(name.length + 1);
		}
	}
	return "";
}

function shield(domain){
	const trans = (text) => text.replace(/;/g, "%3B").replace(/=/g, '%3D');
	fake_cookie += domain + "=" + trans(document.getElementById(domain).innerHTML) + ";";
	document.getElementById(domain).innerHTML = '<button onclick="unshield(`' + domain + '`)"><svg style="width: 1em; height: 1em;" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 10L9 22L4 17" stroke="#00C853" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>已屏蔽' + domain + '</button><br><br>';
	if(getCookie("restricted_domains").indexOf('-site:' + domain) == -1){
		document.cookie = domain == "百科" ? "baike=false; expires=" + expires :"restricted_domains=" + getCookie("restricted_domains") + " -site:" + domain + "; expires=" + expires;
	}
}

function unshield(domain){
	const trans = (text) => text.replace(/%3B/g, ";").replace(/%3D/g, '=');
	document.getElementById(domain).innerHTML = trans(getFakeCookie(domain));
	fake_cookie = fake_cookie.replace(new RegExp(domain + '.*?;'), '');
	document.cookie = "restricted_domains=" + getCookie("restricted_domains").replace(new RegExp('-site:' + domain), '').replace(/\s{2,}/g, ' ') + "; expires=" + expires;
}

function show_restricted_domains(){
	let htm = '<button onclick="hide_restricted_domains()">隐藏当前屏蔽站点列表</button><br>';
	getCookie("restricted_domains").split(" -site:").slice(1).forEach(domain => {
		htm += '<span id="list' + domain + '"><button onclick="list_unshield(`' + domain + '`)">已屏蔽' + domain + '</button><br></span>';
	});
	document.getElementById("restricted_domains_list").innerHTML = htm;
}

function hide_restricted_domains(){
	document.getElementById("restricted_domains_list").innerHTML = '<button onclick="show_restricted_domains()">展示当前屏蔽站点列表</button><br>';
}

function list_shield(domain){
	document.cookie = "restricted_domains=" + getCookie("restricted_domains") + " -site:" + domain + "; expires=" + expires;
	document.getElementById("list" + domain).innerHTML = '<button onclick="list_unshield(`' + domain + '`)">已屏蔽' + domain + '</button><br>'
}

function list_unshield(domain){
	document.cookie = "restricted_domains=" + getCookie("restricted_domains").replace(new RegExp('-site:' + domain), '').replace(/\s{2,}/g, ' ') + "; expires=" + expires;
	document.getElementById("list" + domain).innerHTML = '<button onclick="list_shield(`' + domain + '`)">可展示' + domain + '</button><br>';
}

var domain_list = "{}";
var key = "";
var pages = 0;
var response = false;
var times = 0;
var time = new Date().getTime();

function request_error(){
	if(response == false){
		if(times < 3){
			setTimeout(() => {
				document.getElementById('result').innerHTML = document.getElementById('result').innerHTML.replace(/<h2>(网络连接中断.*|加载中)\.\.\.<\/h2>/g, '') + "<h2>网络连接中断, 第" + ++times + "次重新请求</h2>";
				new_request(key, pages);
			}, 2000);
		}else{
			document.getElementById('result').innerHTML = document.getElementById('result').innerHTML.replace(/<h2>(网络连接中断.*|加载中)\.\.\.<\/h2>/g, '') + "<h2 style=\"color: red;\">网络连接中断, 请联系管理员重启服务端</h2>";
		}
	}
}

function new_request(keyword, pages){
	try {
		response = false;
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `/search?keyword=${keyword}&pages=${pages}&restricted_domains=${getCookie("restricted_domains")}`, true);
		xhr.setRequestHeader('Content-Type', 'multipart/form-data');
		xhr.send();
		document.getElementById('result').innerHTML += '<h2>加载中...</h2>';	
		xhr.onload = () => {
			const result = JSON.parse(xhr.responseText);
			const bing_info = get_bing(keyword, result.bing_info, JSON.parse(domain_list));
			document.getElementById('result').innerHTML = (getCookie("baike") == "true" ? get_baike(result.baike_info) : "") + bing_info[1];
			domain_list = bing_info[0];
			response = true;
		};
	} catch (error) {
		request_error();
	}
	setTimeout(() => {
		request_error();
	}, 6000 * (times + 1));
}

function new_request_head(keyword){
	if(key != keyword){
		pages = 1;
		key = keyword;
		document.getElementById('result').innerHTML = "";
		domain_list = "{}";
	}else{
		if(document.getElementById('result').innerHTML.indexOf("网络连接中断")){
			document.getElementById('result').innerHTML = ""
		}
		pages += 10;
		//console.log(domain_list);
		let domain_json = JSON.parse(domain_list);
		getCookie("restricted_domains").split(" -site:").slice(1).forEach(domain => {
			delete domain_json[domain];
		});
		domain_list = JSON.stringify(domain_json);
	}
	times = 0;
	time = new Date().getTime();
	new_request(key, pages);
}

function new_page(){
	new_request_head(key);
}

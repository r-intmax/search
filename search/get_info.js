function shield_text(text){
	return ' <button onclick="shield(`' + text + '`)"><svg style="width: 1em; height: 1em;" width="100" height="100" viewBox="0 0 100 100"> <circle cx="50" cy="50" r="45" fill="white" stroke="red" stroke-width="10" /> <line x1="20" y1="20" x2="80" y2="80" stroke="red" stroke-width="10" /> </svg>屏蔽' + text + "</button><br>";
}

function get_bing(keyword, html, domains) {
	const replace = (text) => text.replace(/</g, "&lt;").replace(/>/g, '&gt;');
    let retstr = "<h4>\"" + keyword + "\"的搜索结果:</h4>";
    new DOMParser().parseFromString(html, "text/html").querySelectorAll("li.b_algo").forEach(result => {
		const title = replace(result.querySelector("h2").textContent);
		const link = result.querySelector("a").href;
		const content = replace(result.querySelector("div.b_caption").textContent.replace("网页", "")).split("·")[result.querySelector("div.b_caption").textContent.indexOf("·") != -1 ? 1 : 0].trim() + "<br>";
		const domain = link.split("/")[2].split(".").slice(["com.cn", "edu.cn"].some((element) => link.includes(element)) ? -3 : -2).join(".");
		const new_html_head = "<a href=\"" + link + "\" target=\"_blank\">" + title + "</a>" ;
		const { [domain]: items } = domains;
		if (!items || items.every(item => !title.includes(item))) {	// bug
			domains[domain] = items ? [...items, new_html_head + "<br>" + content] : [new_html_head + shield_text(domain) + content];
		}
	});
	Object.entries(domains).forEach(([domain, results]) => {
		retstr += '<div id="' + domain + '">' + results[0] + (results.length == 1 ? "<br>" : "<details><summary>更多来自" + domain + "的结果</summary>" + [...results.slice(1)].join("<br>") + "<br><a href=\"https://cn.bing.com/search?q=" + keyword + "+site:" + domain + "\" target=\"_blank\">更多来自" + domain + "的结果</a></details><br>" ) + '</div>';
	});
	return [JSON.stringify(domains), retstr + '<button type="button" style="display: inline-block; background-color: #007bff; color: #fff; padding: 10px 200px; border: none; border-radius: 5px;" onclick="new_page()">下一页</button>'];
};

function get_baike(html) {
	const text = html.replace(/<script>.*?<\/script>/g, "").replace(/<.*?>/g, "").replace(/(_百度百科.*?上传视频)|(_百度百科.*?个人中心)|(新手上路.*?01号)|(编辑)|(收藏.*?1 0)|(本词条.*?。)|(\[[^\]]*\])/g, "").replace(/\s{2,}/g, ' ');
	return text.includes("®®")? "": "<br><div id=\"百科\"><details><summary>百科解释:" + shield_text("百科") + text.substring(0, 300) + "</summary>" + text.substring(301) + "</details></div>";
}

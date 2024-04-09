def get_info(browser, keyword, pages, restricted_domains):
    if keyword is None: return {"baike_info": "", "bing_info": ""}
    handle = browser.new_tab()
    bing_info = browser.fetch(handle, f"https://cn.bing.com/search?q={keyword}+{restricted_domains}&first={str(pages)}")
    baike_info = browser.fetch(handle, f"https://baike.baidu.com/item/{keyword}") if restricted_domains.find('百科') != -1 else ""
    browser.close_tab(handle)
    return {"baike_info": baike_info, "bing_info": bing_info}

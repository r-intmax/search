import time

from selenium import webdriver
from selenium.webdriver.edge.options import Options

import thread_condition

class Browser:
    def new(self):
        self.driver = webdriver.Edge(options=self.options)

    def __init__(self, debug=False):
        self.browser_state = True;
        self.options = Options()
        self.debug = debug
        #self.options.binary_location = "/Programs Files/Firefox Developer Edition/firefox.exe"
        if not self.debug:
            self.options.add_argument('--headless')
            self.options.add_argument('--disable-gpu')
        self.new()
        self.driver_lock = thread_condition.ConditionLock()
    
    def __del__(self):
        self.close()
        
    def close(self):
        self.browser_state = False
        self.driver.quit()
        
    def reboot(self):
        if self.browser_state == True: self.driver.quit()
        self.browser_state = True;
        self.driver_lock.lockbool = True
        self.new()

    def new_tab(self):
        try:
            return self.driver_lock.lock(lambda: (
                self.driver.execute_script('window.open("about:blank")'),
                self.driver.window_handles[-1]
            ))[1]
        except:
            self.browser_state = False

    def fetch(self, handle, url):
        try:
            self.driver_lock.lock(lambda: (
                self.driver.switch_to.window(handle),
                self.driver.get(url)
            ))
            time.sleep(1)
            return self.driver_lock.lock(lambda: (
                self.driver.switch_to.window(handle),
                self.driver.page_source
            ))[1]
        except:
            self.browser_state = False

    def close_tab(self, handle):
        if not self.debug:
            try:
                self.driver_lock.lock(lambda: (
                    self.driver.close(),
                    self.driver.switch_to.window(self.driver.window_handles[0])
                ))
            except:
                self.browser_state = False


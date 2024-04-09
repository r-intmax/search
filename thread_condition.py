import time
import datetime

class ConditionLock:
    def __init__(self):
        self.lockbool = True
    
    def lock(self, func):
        visit = datetime.datetime.now();
        while self.lockbool == False:
            time.sleep(0.2)
            if (datetime.datetime.now() - visit).total_seconds() > 15:
                return None
        self.lockbool = False
        result = func()
        self.lockbool = True
        return result
    
    def unlock(self, func):
        pass


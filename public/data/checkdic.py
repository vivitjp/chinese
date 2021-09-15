# =====================================================
# 辞書のチェック用に作ったが、役に立たない
# =====================================================

import json
import os
import pathlib

try:
    trg_file = 'dict_2_main.json'

    BASE_PATH = os.path.join(os.getcwd(), 'public')
    BASE_PATH = os.path.join(BASE_PATH, 'data')
    CUR_PATH = os.path.join(BASE_PATH, trg_file)
    print(CUR_PATH)

    file_new = pathlib.Path(CUR_PATH)
    print(file_new.exists())

    with open(CUR_PATH, mode='r', encoding='utf-8') as f:
        obj = json.loads(f.read())

        print(obj['姑娘'])

except IOError as e:
    print("IOErrorMsg: ", e)
except Exception as e:
    print("ExceptionMsg: ", e)

# [{"W": "吖嗪", "S": ["ā", "qín"]}, {"W": "阿鼻地狱", "S": ["ā", "bí", "dì", "yù"]},

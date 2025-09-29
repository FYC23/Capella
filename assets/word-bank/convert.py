import json
import pandas as pd

file_location = r'assets\word-bank\data.txt'

file = open(file_location, "r", encoding="utf-8")
lines = file.readlines()
file.close()

tc_data = []
sc_data = []
py_data = []
cnt = 0

for line in lines:
    if 'zh-Hant' in line:
        st = line.find('title="')
        line = line[st + 7:]
        cnwd = line[:line.find('">')]
        tc_data.append(cnwd)
        cnt += 1
    if 'zh-Hans' in line:
        st = line.find('title="')
        line = line[st + 7:]
        cnwd = line[:line.find('">')]
        sc_data.append(cnwd)
    elif 'cmn-Latn-pinyin' in line:
        st = line.find('title="')
        line = line[st + 7:]
        py = line[:line.find('">')]
        py_data.append(py)

# save to json file

json_data = []

for i in range(cnt):
    l = (1 if i < 3000 else 2 if i < 7000 else 3)
    json_data.append({
        "level": l,
        "traditional-chinese": tc_data[i],
        "simplified-chinese": sc_data[i],
        "pinyin": py_data[i]
    })

with open(r'assets\word-bank\word-bank.json', 'w', encoding='utf-8') as f:
    json.dump(json_data, f, ensure_ascii=False, indent=4)


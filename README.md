# FlatStorage

## 簡述
這是一個基於 vue3 及 express.js 開發的 GCP Storage 檔案瀏覽器。
所有檔案的命名、路徑都被儲存在 records 當中，真實存放在 GCP 上的檔案只是一堆 UUID。
所以重新命名檔案時，不會真的發生複製成本。

## User Story
### 初始化
a. 判斷是否有既有的 config.yml，如果沒有：
a-1. 使用者剛啟動專案時，讓使用者透過 UI 介面編輯 config.yml:
a-1-1. 選擇 storage type，有「GCS」「AWS」「local disk」可選
a-1-2. 輸入 path 並按下確認
a-1-3. 讀取 path，並判斷以下邏輯
a-1-3-1. 如果 path 錯誤或為空：進入 b.
a-1-3-2. 如果 path 不為空，驗證檔案內容格式是否正確:
a-1-3-2-1. 如果正確或為空，讓使用者選擇「以既有的路徑為ID（成本較低）」「重新攤平、製作新ID（成本較高）」，提醒使用者在雲端製作ID的成本很高
a-1-3-2-2. 如果不正確，請使用者修正或刪除，並退出應用

b. 如果有，但不合法，請使用者修正或刪除，並退出應用

### 以既有的路徑為ID（成本較低）
1. 清空 records 既有內容
2. 

## before deploy
1. GCP api key

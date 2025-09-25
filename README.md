# FlatStorage

## 簡述
這是一個基於 vue3 及 express.js 開發的 GCP Storage 檔案瀏覽器。
所有檔案的命名、路徑都被儲存在 records 當中，真實存放在 GCP 上的檔案只是一堆 UUID。
所以重新命名檔案時，不會真的發生複製成本。

## User Story
### 初始化
a-1. 使用者進入 UI 時，需要提供連線資訊：
a-1-1. 選擇 storage type，有「GCS」「AWS」「local disk」可選
a-1-2. 選擇「建立新的工作階段，並刪除先前的 records」「繼續先前的工作階段」

### 「建立新的工作階段，並刪除先前的 records」
b-1. 讓使用者選擇「以既有的路徑為ID（成本較低）」「重新攤平、製作新ID（成本較高）」，提醒使用者在雲端製作ID的成本很高

### 「繼續先前的工作階段」
c-1. 讀取 records，並判斷
c-1-1. 如果 records 格式錯誤：進入 z.
c-1-2. 如果 records 正確或為空，則視為已經初始化完成

z. 如果有，但不合法，請使用者修正或刪除，並退出應用

### 以既有的路徑為ID（成本較低）
1. 清空 records 既有內容

### 重新攤平、製作新ID（成本較高）


## before deploy
1. create GCP project and storage bucket, set IAM permission
2. login gCloud cli



# Wildberries parser
Парсит товары продавца с сайта https://global.wildberries.ru/   
 по поисковому запросу по 100 карточек   настройки можно изменить комметарии оставлены

## Установка
1.Клонируем;
2.устанавливаем  npm i;
## Запуск
3.В файле parser.js  вносим поиск ,у меня стоит поиск "смартфон" (по необходимости таймауты и  количество регулируем);
4.Запускаем скрипт в терминале: node parser.js;
5.Ждем когда скачаются в Json карточки товара ;
6.Карточки появятся в файле products.jcon;
(название переключается в нижней части кода в :fs.writeFileSync('products.json', JSON.stringify(products, null, 2)); )






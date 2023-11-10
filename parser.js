const puppeteer = require('puppeteer'); //  библиотека Puppeteer для автоматизации браузера.
const fs = require('fs'); // библиотека для Json

// основная функция
async function main() {
    // Запускаем браузер  без Headless и открываем новую страницу.
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Задаем поисковый запрос и формируем ссылку.
    const searchQuery = 'Смартфон';
    const url = `https://global.wildberries.ru/catalog?search=${encodeURI(searchQuery)}`;

    // Переходим на страницу.
    await page.goto(url, { waitUntil: 'networkidle0' });
    
       // Функция для автопрокрутки страницы.
    const autoScroll = async (page) => {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;// Общая высота прокрученного контента.
                let distance = 100;// Количество пикселей, на которое мы будем прокручивать страницу за одну итерацию.
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;// Общая высота страницы. 
                    window.scrollBy(0, distance);
                    totalHeight += distance; // Прокручиваем страницу на заданное количество пикселей.
          // Если прокрутили страницу до конца, останавливаем таймер.
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    };
    // Прокручиваем страницу до конца.
    await autoScroll(page);

    // Ищем кнопку "Показать еще".
    let loadMoreButton = await page.$('.pagination-next'); 
    // Кликаем на кнопку, пока она существует.
    while (loadMoreButton) {
        await loadMoreButton.click();
        await page.waitForTimeout(2000); 
        // Прокручиваем страницу после каждого нажатия на кнопку.
        await autoScroll(page);
        // Ждем, пока изображения загрузятся.
        await page.waitForTimeout(10000); 
        // Снова ищем кнопку после ожидания.
        loadMoreButton = await page.$('.pagination-next');
    }

    // Собираем данные о продуктах со страницы.
    const products = await page.evaluate(() => {
        let products = []; // Массив для хранения информации о продуктах.
        // Находим все карточки продуктов на странице.
        let productCards = document.querySelectorAll('[data-tag="card"]');
        // Проходим по каждой карточке и извлекаем информацию.
        for (let productCard of productCards) {
            const product = {}; // Объект для хранения информации о продукте.
            
            // Выбираем нужные элементы на карточке продукта и сохраняем информацию.
            let linkElement = productCard.querySelector('[data-tag="cardLink"]');
            if (linkElement) {
                const href = linkElement.getAttribute('href');
                const id = href.substring(href.indexOf('=')+1);
                product.id = id; 
            }
            let imgElement = productCard.querySelector('.card-img picture img');
            let priceElement = productCard.querySelector('[data-tag="salePrice"]');
            let oldPriceElement = productCard.querySelector('.price__old del');
            let discountElement = productCard.querySelector('.price__discount');
            let brandElement = productCard.querySelector('.b-card__brand');
            let nameElement = productCard.querySelector('.b-card__name');
            let ratingElement = productCard.querySelector('.b-card__rating span:last-child');
            let deliveryElement = productCard.querySelector('[data-tag="delivery"] span');

            // Проверяем, существуют ли эти элементы и есть ли у них текст, и сохраняем его.
            if (linkElement) product.link = linkElement.getAttribute('href');
            if (imgElement) product.imgSrc = imgElement.getAttribute('src');
            if (priceElement && priceElement.textContent) product.price = priceElement.textContent.trim();
            if (oldPriceElement && oldPriceElement.textContent) product.oldPrice = oldPriceElement.textContent.trim();
            if (discountElement && discountElement.textContent) product.discount = discountElement.textContent.trim();
            if (brandElement && brandElement.textContent) product.brand = brandElement.textContent.trim();
            if (nameElement && nameElement.textContent) product.name = nameElement.textContent.trim();
            if (ratingElement && ratingElement.textContent) product.rating = ratingElement.textContent.trim();
            if (deliveryElement && deliveryElement.textContent) product.delivery = deliveryElement.textContent.trim();
            // Добавляем полученный продукт в массив.
            products.push(product);
        }
        // Возвращаем массив с продуктами.
        return products;
    });

    // Записываем результат в файл JSON.
    fs.writeFileSync('products.json', JSON.stringify(products, null, 2));
    console.log('Парсинг успешно завершен. Результаты сохранены в файле products.json');
    // Закрываем браузер.
    await browser.close();
}

// Запускаем главную функцию и обрабатываем ошибки.
main().catch(console.error);
// @todo: напишите здесь код парсера
//БЛОК КОДА СБОРА ДАННЫХ СО ВСЕЙ ВЕБ-СТРАНИЦЫ
//эта функция собирает структурированные данные с веб-страницы и организует их в удобный форматдля дальнейшей обработки
function parsePage() {
    return {
        meta: getMetaData(), // для хранения мета-информации
        product: {},  // для хранения информации о конкретном товаре/продукте
        suggested: [],// для хранения предложений/рекомендаций (например, похожих товаров)
        reviews: []   // для хранения отзывов о продукт
    };
}
//Функция parsePage становится доступной глобально
window.parsePage = parsePage;
//1 ШАГ Получение мета-информации страницы
//функция получения данных мета
function getMetaData() {
    // 1. Язык страницы
    const language = document.documentElement.lang;
    // 2. Заголовок
    const title = document.title.split('—')[0].trim();
    // 3. Получаем ключевые слова
    // Находим мета-тег с атрибутом name="keywords"
     const keywordsMeta = document.querySelector('meta[name="keywords"]');
     // Создаем пустой массив для хранения ключевых слов
    let keywords = [];
    // Проверяем, найден ли мета-тег
    if (keywordsMeta) {
        try {
            keywords = keywordsMeta.getAttribute('content')
                .split(',')
                .map(keyword => keyword.trim())
                .filter(keyword => keyword.length > 0);
        } catch (error) {
            console.error('Ошибка при обработке ключевых слов:', error);
        }   
    }
    //4. Получаем описание 
     const descriptionMeta = document.querySelector('meta[name="description"]');
     let description = '';
    
    if (descriptionMeta) {
        try {
            description = descriptionMeta.getAttribute('content');
        } catch (error) {
            console.error('Ошибка при обработке описания:', error);
        }
    }
    // 5. Получаем Оpengraph-описание
    const OpenGraphTags = document.querySelectorAll('meta[property^="og:"]');
const opengraph = {}; // Создаем объект для хранения OpenGraph данных
   // Заполняем объект opengraph данными
OpenGraphTags.forEach(tag => {
    try {
        const key = tag.getAttribute('property').replace('og:', '');
        const content = tag.getAttribute('content');
        if (content) {
            opengraph[key] = content;
        }
    } catch (error) {
        console.error('Ошибка при обработке OpenGraph тега:', error);
    }
});
// Проверяем, есть ли данные
        if (Object.keys(opengraph).length === 0) {
          console.warn('OpenGraph теги не найдены');
        } else {
}
// Создаем итоговый объект meta и возвращаем его
    const meta = {
        language,
        title,
        keywords,
        description,
        opengraph
    };
    return meta;
}

document.addEventListener('DOMContentLoaded', function () {
    const metaData = getMetaData();
    console.log(metaData);
});

//ШАГ 2 Данные карточки товара 
function GetProductCardData() {
    const productData = {
        product: {
            id: '',         //Идентификатор товара 
            images: [],      //Массив фотографий
            isLiked: '',    //Статус лайка
            name: '',       //Название товара
            //Массивы бирок, категорий и скидок
            tags: {
                category: [],
                discount: [],
                label: []
            },
            price: '',      //Цена товара с учётом скидки
            oldPrice: '',    //Цена товара без скидки
            discount: '',    //скидка
            discountPercent: '',//процент скидки
            currency: '',//валюта
            properties: {},//Свойства товара 
            description: '',   //Полное описание
        }

    }
    //Список данных карточки которые нужно получить
    //1. Идентификатор товара
    const productSection = document.querySelector('.product');
    //через совойство dataset сохраняем в переменную значение атрибута data-id
    const productId = productSection.dataset.id;
    productData.product.id = id; // Сохраняем в объект

    //2. Массив фотографий
    const nav = document.querySelector('.preview nav');
    //(1) Ищем все кнопки с изображениями на странице
    const buttons = nav.querySelectorAll('button');
    //(2) Создаём переменную в которой будем массив для хранения информации о img
    const images = [];
    // добавляем информацию об изображении из disabled кнопки первой в массив
    //Ищем активную картинку
    const activeButton = Array.from(buttons).find(button => button.disabled);
    //Берем информацию с активной картинки
    if (activeButton) {
        const activeImg = activeButton.querySelector('img');
        images.push({
            preview: activeImg.src,
            full: activeImg.dataset.src,
            alt: activeImg.alt
        });
    }
    //(3) Собираем информацию со всех остальных картинок
    buttons.forEach(button => {
        if (!button.disabled) {
            const imgContent = button.querySelector('img');
            images.push({
                preview: imgContent.src,
                full: imgContent.dataset.src,
                alt: imgContent.alt
            });
        }
    });
    //Присвоение массива images свойству productData.product.images
    productData.product.images = images;

    //3. Статус лайкa
    //проверяем содержит ли кнопка класс active с помощью метода  (classList.contains)
    const button = document.querySelector('.preview figure .like');
    // Проверяем наличие класса active
    const isLiked = button.classList.contains('active');
    //проверка
   
    productData.product.isLiked = isLiked; // Сохраняем в объект


    //4. Название товара 
    const productTitle = document.querySelector('h1').textContent;
    //проверка
    console.log(productTitle);//вывод
    productData.product.name = productTitle; // Сохраняем в объект


    // 5. Массивы бирок, категорий и скидок
    // находим все элементы span внутри элемента с классом tags
    // Получаем название товара
    const tagCategories = document.querySelectorAll('.tags span');
    //перебираем каждый найденный тег с помощью forEach и добавляем в массив
    tagCategories.forEach(element => {
        //с помощью classList.contains проверияем имеет ли тег класс green, ели да то его текст добавляется в массив categories(зеленый отвеает за категорию)
        if (element.classList.contains('green')) {
            productData.product.tags.category.push(element.textContent);
        }
        //Если тег имеет класс blue, текс добавляеться в массив tag(синий отвечает за бирку)
        else if (element.classList.contains('blue')) {
            productData.product.tags.label.push(element.textContent);
        }
        //Если тег имеет класс red, текст добавляется в массив discount(красный отвеает за скидку)
        else if (element.classList.contains('red')) {
            productData.product.tags.discount.push(element.textContent);
        }
    });

    //6. Цена товара с учётом скидки
    const ProductPriceDiscount = document.querySelector('.price');
    //получаем значение
    const priceDiscount = ProductPriceDiscount.textContent.trim();
    // Удаляем символ ₽ и лишние пробелы
    const cleanedPriceDiscount = priceDiscount.replace('₽', '').trim();
    // Преобразовываем строку в число чтобы выполнить расчет
    const priceDiscountNum = parseFloat(cleanedPriceDiscount);
    //добавляем в структруру данных
    productData.product.price = priceDiscountNum;
    //вывод в консоль  проверка
  

    //7. Цена товара без скидки
    //ищем число
    const PriceWithoutDiscount = document.querySelector('.price span')
    //получаем значение 
    const priceWithoutNu = PriceWithoutDiscount.textContent.trim();
    // Удаляем символ ₽ и лишние пробелы
    const priceWithout = priceWithoutNu.replace('₽', '').trim();
    // Преобразовываем строку в число чтобы выполнить расчет
    const priceWithoutNum = parseFloat(priceWithout);
    //добавляем в структруру данных
    productData.product.oldPrice = priceWithoutNum;
    //вывод в консоль проверка
   



    //8. Размер скидки
    // Рассчитываем скидку
    // Создаем переменные для хранения значений
    let discountAmount = 0; // размер скидки в рублях
    let discountPercentageProduct = 0; // процент скидки
    // Проверяем, что есть обе цены и старая цена больше новой
    if (priceWithoutNum > 0 && priceDiscountNum > 0 && priceWithoutNum > priceDiscountNum) {
        // Рассчитываем размер скидки в рублях
        discountAmount = priceWithoutNum - priceDiscountNum;
       
        // Рассчитываем процент скидки
        discountPercentageProduct = ((priceWithoutNum - priceDiscountNum) / priceWithoutNum) * 100;
        // Округляем до двух знаков после запятой и добавляем знак процента
        discountPercentageProduct = discountPercentageProduct.toFixed(2) + '%';

        
    }
    // Сохраняем значения в структуру данных
    productData.product.discount = discountAmount;
    productData.product.discountPercent = discountPercentageProduct;



    //9. Валюта
    //переменная неизменная 
    const currency = '₽'
    //изменняемая переменная которая хранит код валюты которая получиться из условия
    let currencyCountry;
    //с помощью условных операторов создаем уловние и проверям значение переменной currency  
    //и если она равна '$' то currencyCountry устанавливается в 'USD'и так далее с разными валютами 
    if (currency === '$') {
        currencyCountry = 'USD';
    }
    else if (currency === '€') {
        currencyCountry = 'EUR';
    }
    else if (currency === '₽') {
        currencyCountry = 'RUB';
    }
    
    // Добавляем код валюты в структуру данных
    productData.product.currency = currencyCountry

    //10. Свойства товара (создаем обьект с ключами и значениями)
    //создаем переменную в которой будет храниться обьект
    //ищем с помощью  querySelectorAll находим  все элементы li
    const propertiesContent = document.querySelectorAll('.properties li')
    //Создали пустой объект для хранения ключей и значений
    const properties = {};
    // Создаем счетчик для формирования динамических ключей
    let index = 1;
    // Перебираем каждый элемент li из найденного списка
    propertiesContent.forEach(li => {
        // Извлекаем значения
        const value = li.querySelector('span:last-child').textContent.trim();
        // Формируем динамический ключ
        const dynamicKey = `key${index}`;
        // Добавляем в объект
        properties[dynamicKey] = value;
        // увеличиваем счетчик
        index++;

        // Добавляем в структуру данных
        productData.product.properties = properties;
    });
    
    


    //11. Полное описание
    //ищем заголовок
    const blockTitleitem = document.querySelector('h3');
    // Получаем текст заголовка
    const blockTitleText = blockTitleitem.textContent.trim();
    // Формируем HTML-разметку заголовка
    const blockTitle = `<h3>${blockTitleText}</h3>`;
    // Формируем начальную часть описания
    let description = blockTitle;
    //Ищем все параграфы описания
    const blockDescriptions = document.querySelectorAll('.description p');
    // Собираем все параграфы с отступами
    blockDescriptions.forEach(paragraph => {
        // Добавляем каждый параграф с отступом и переносом строки
        description += `\n                ${paragraph.outerHTML}`;


        // Добавляем в структуру данных
        productData.product.description = description;


    });
    
    return productData;
}
document.addEventListener('DOMContentLoaded', function () {
    const productData = GetProductCardData();
    console.log(productData);
});







//шаг 3 Массив дополнительных товаров
//тут мы получае все карточки и перебираем их в цикле, чтобы сформировать массив
function GetArrayOfAdditionalProducts() {

    //1. ищем все карточки с помощью querySelectorAll 
    const productCards = document.querySelectorAll('.suggested .items article');
    //2. Массив для хранения данных о предложенных товарах
    const productsSuggested = [];

    //3. проходимся по всем карточкам чтобы сформировать массив
    productCards.forEach(card => {
        //4. создаем перемненую товара со всем необходимым 
        const product = {
            image: card.querySelector('img').src || '',         // Извлекаем ссылку на изображение
            title: card.querySelector('h3').textContent || '',  //  заголовок
            price: card.querySelector('b').textContent || '',   //   цену
            currency: '₽',                                // Валюту
            description: card.querySelector('p').textContent || '' // Извлекаем описание
        };
        //5.  Добавляем объект с данными в массив
        productsSuggested.push(product);


    });
    //6. возвращаем данные  productsSuggested
    return productsSuggested;

}
document.addEventListener('DOMContentLoaded', function () {
    const productCards = GetArrayOfAdditionalProducts();
    console.log(productCards);
});



//ШАГ 4 Массив обзоров (отзывы о товарах)
//(Получае всё аналогично предыдущему блоку) В цикле перебираем карточки, чтобы сформировать массив
function getArrayOfReviews() {
    //1. ищем все карточки с помощью querySelectorAll c отзывами
    const reviewsBlock = document.querySelectorAll('.reviews .items article');
    //2.  Массив для хранения данных с отзывами
    const reviewsArray = [];
    //3. проходимся по всем отзывам чтобы сформировать массив
    reviewsBlock.forEach(card => {
        // Подсчет рейтинга (количество заполненных звезд)
        const rating = card.querySelectorAll('.rating .filled').length;

        // Собираем данные отзыва
        const reviews = {
            rating: rating,
            author: {
                avatar: card.querySelector('.author img')?.src || '',
                name: card.querySelector('.author span')?.textContent || ''
            },
            title: card.querySelector('h3.title')?.textContent || '',
            description: card.querySelector('p')?.textContent || '',
            date: formatDate(card.querySelector('.author i')?.textContent || '')
        };

        // Добавляем в массив
        reviewsArray.push(reviews);
    });
    return reviewsArray;

}
// Функция форматирования даты
function formatDate(dateString) {
    if (!dateString) return '';
    // Разбиваем дату и форматируем
    const [day, month, year] = dateString.split('/');
    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const reviews = getArrayOfReviews();
    console.log({ reviews: reviews }); // Выводим в нужном формате
});
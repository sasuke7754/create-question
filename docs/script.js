document.querySelector('.start-button').addEventListener('click', function() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            const randomQuestions = getRandomQuestions(data, 10);
            displayQuestions(randomQuestions);
        })
        .catch(error => console.error('Error fetching the questions:', error));
});

function getRandomQuestions(questions, count) {
    const books = {
        "第一本书": { 
            "highPriority": [1, 3, 4, 8, 9, 10, 11, 12, 17, 19], 
            "mediumPriority": [2, 7, 18], 
            "lowPriority": [5, 6, 14, 20, 21], 
            "exclude": [] 
        },
        "第二本书": { 
            "highPriority": [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 19, 21, 22, 23, 24, 25], 
            "mediumPriority": [], 
            "lowPriority": [18, 27], 
            "exclude": [] 
        },
        "第三本书": { 
            "highPriority": [2, 4, 5, 6, 7, 9, 10], 
            "mediumPriority": [12], 
            "lowPriority": [3, 8], 
            "exclude": [] 
        }
    };

    // 过滤掉不需要的章节
    const availableQuestions = questions.filter(question => {
        const book = question.book;
        const chapter = parseInt(question.chapter.match(/\d+/)[0]); // 提取章节号
        return !books[book].exclude.includes(chapter);
    });

    // 按优先级加权
    const weightedQuestions = availableQuestions.map(question => {
        let weight = 1; // 默认非重点章节
        const book = question.book;
        const chapter = parseInt(question.chapter.match(/\d+/)[0]);

        if (books[book].highPriority.includes(chapter)) {
            weight = 3;
        } else if (books[book].mediumPriority.includes(chapter)) {
            weight = 2;
        }

        return { ...question, weight };
    });

    // 根据权重进行随机选择
    const randomQuestions = getRandomWeightedQuestions(weightedQuestions, count);

    // 按书本、章节、小节排序
    randomQuestions.sort((a, b) => {
        const bookOrder = ["第一本书", "第二本书", "第三本书"];
        const bookCompare = bookOrder.indexOf(a.book) - bookOrder.indexOf(b.book);
        if (bookCompare !== 0) return bookCompare;
        const chapterCompare = parseInt(a.chapter.match(/\d+/)[0]) - parseInt(b.chapter.match(/\d+/)[0]);
        if (chapterCompare !== 0) return chapterCompare;
        return a.section - b.section;
    });

    return randomQuestions;
}

function getRandomWeightedQuestions(questions, count) {
    const totalWeight = questions.reduce((sum, q) => sum + q.weight, 0);
    const randomQuestions = [];

    while (randomQuestions.length < count) {
        const randomWeight = Math.random() * totalWeight;
        let cumulativeWeight = 0;

        for (let i = 0; i < questions.length; i++) {
            cumulativeWeight += questions[i].weight;
            if (cumulativeWeight >= randomWeight) {
                randomQuestions.push(questions[i]);
                questions.splice(i, 1);
                break;
            }
        }
    }

    return randomQuestions;
}

function displayQuestions(questions) {
    const container = document.getElementById('questions-container');
    container.innerHTML = '';
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'question';
        questionElement.textContent = `${question.book}${question.chapter}第${question.section}题：${question.question}`;
        container.appendChild(questionElement);
    });
}

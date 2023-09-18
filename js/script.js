document.addEventListener('DOMContentLoaded', () => {
    const triviaForm = document.getElementById('trivia-form');
    const generateButton = document.getElementById('generate-btn');
    const questionCard = document.getElementById('question-card');
    const questionContainer = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const scoreContainer = document.getElementById('score');
    const scoreValue = document.getElementById('score-value');
    const newTriviaButton = document.getElementById('new-trivia-btn');
    const calculateScoreButton = document.getElementById('calculate-score-btn');

    let currentQuestionIndex = 0;
    let triviaData = [];
    let selectedAnswers = new Array(triviaData.length).fill(null);

    //Función para cargar las categorías

    function loadCategories() {
        const categorySelect = document.getElementById('category');

        fetch('https://opentdb.com/api_category.php')
            .then(response => response.json())
            .then(data => {
                data.trivia_categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Error al cargar las categorías:', error));
    }

    //Función para generar la trivia de acuerdo a lo seleccionado

    function generateTrivia() {
        const difficulty = document.getElementById('difficulty').value;
        const type = document.getElementById('type').value;
        const category = document.getElementById('category').value;

        const apiUrl = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=${type}`;

        fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            triviaData = data.results;

            if (triviaData.length < 10) {
                // Mostrar una alerta personalizada con SweetAlert2
                Swal.fire({
                    title: 'Trivia insuficiente',
                    text: 'La trivia no contiene las 10 preguntas. ¿Deseas reiniciar la trivia?',
                    icon: 'warning',
                    showCancelButton: false, // Ocultar el botón "Cancelar"
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        resetTrivia(); // Llamar a la función de reinicio si se confirma.
                    }
                });
            } else {
                showQuestion(0);
                questionCard.style.display = 'block';
                scoreContainer.style.display = 'none';
                newTriviaButton.style.display = 'none';
            }
        })
        .catch(error => console.error('Error al cargar la trivia:', error));
    }

    //Función que muestra las preguntas retornadas de la API

    function displayQuestion(questionData) {
        questionContainer.innerHTML = `<p class="question">${currentQuestionIndex + 1}. ${questionData.question}</p>`;
        optionsContainer.innerHTML = '';

        questionData.incorrect_answers.forEach((option, index) => {
            const isChecked = selectedAnswers[currentQuestionIndex] === index ? 'checked' : '';
            optionsContainer.innerHTML += `
            <li>
                <label>
                    <input type="radio" name="answer-${currentQuestionIndex}" id="option-${index}" ${isChecked}>
                    ${option}
                </label>
            </li>
        `;
        });

        const isCheckedCorrect = selectedAnswers[currentQuestionIndex] === 'correct' ? 'checked' : '';

        optionsContainer.innerHTML += `
        <li>
            <label>
                <input type="radio" name="answer-${currentQuestionIndex}" id="option-correct" ${isCheckedCorrect}>
                ${questionData.correct_answer}
            </label>
        </li>
    `;

        prevButton.style.display = currentQuestionIndex === 0 ? 'none' : 'block';
        nextButton.style.display = currentQuestionIndex === triviaData.length - 1 ? 'none' : 'block';
        if (currentQuestionIndex === triviaData.length - 1) {
            calculateScoreButton.style.display = 'block';
        } else {
            calculateScoreButton.style.display = 'none';
        }
    }

    //Función para validar las respuestas seleccionadas en cada pregunta

    function showQuestion(index) {
        if (index >= 0 && index < triviaData.length) {
            currentQuestionIndex = index;
            displayQuestion(triviaData[currentQuestionIndex]);

            const selectedOptionIndex = selectedAnswers[currentQuestionIndex];
            if (selectedOptionIndex !== undefined) {
                const radioInput = document.getElementById(`option-${selectedOptionIndex}`);
                if (radioInput) {
                    radioInput.checked = true;
                }
            }
        }
    }

    //Función para calcular el puntaje 

    function calculateScore() {

        let correctas = selectedAnswers.filter(elemento => elemento === "correct").length;

        let totalScore = correctas * 100;

        const totalQuestions = triviaData.length;
        const percentage = (correctas / totalQuestions) * 100;

        scoreValue.textContent = totalScore;
        scoreContainer.style.display = 'block';
        newTriviaButton.style.display = 'block';

        // Mostrar el porcentaje para todas las preguntas
        scoreContainer.innerHTML = `<p>Puntaje total: ${totalScore}</p>`;
        scoreContainer.innerHTML += `<p>Preguntas respondidas correctamente: ${correctas} de ${totalQuestions}</p>`;
        scoreContainer.innerHTML += `<p>Porcentaje de respuestas correctas: ${percentage}%</p>`;
    }

    function resetTrivia() {
        questionCard.style.display = 'none';
        scoreContainer.style.display = 'none';
        newTriviaButton.style.display = 'none';
        triviaForm.reset();
        refreshSelections()
    }

    function refreshSelections() {
      
        const difficultySelect = document.getElementById('difficulty');
        const typeSelect = document.getElementById('type');
        const categorySelect = document.getElementById('category');

        difficultySelect.selectedIndex = 0;
        typeSelect.selectedIndex = 0;
        categorySelect.innerHTML = '';
        loadCategories();
    }
    // Event listeners de los botones y selecciones

    optionsContainer.addEventListener('change', () => {
        const selectedOptionIndex = document.querySelector(`input[name="answer-${currentQuestionIndex}"]:checked`);
        if (selectedOptionIndex) {
            const index = selectedOptionIndex.id.replace('option-', ''); // Obtener el índice de la opción seleccionada
            selectedAnswers[currentQuestionIndex] = index; // Almacena la selección en el arreglo
        }
    });

    generateButton.addEventListener('click', () => {
        selectedAnswers = [];
        generateTrivia()
    });

    prevButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            selectedAnswers[currentQuestionIndex] = selectedOption.id.replace('option-', ''); // Almacena la selección
        }
        showQuestion(currentQuestionIndex - 1);
    });

    nextButton.addEventListener('click', () => {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            selectedAnswers[currentQuestionIndex] = selectedOption.id.replace('option-', ''); // Almacena la selección
        }
        showQuestion(currentQuestionIndex + 1);
    });

    newTriviaButton.addEventListener('click', () => {
        resetTrivia();
        selectedAnswers = [];
    });

    calculateScoreButton.addEventListener('click', () => {
        calculateScore();
    });

    //Funciones que se cargan al iniciar javascript

    loadCategories();
});

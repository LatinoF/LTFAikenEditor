(() => {
    'use strict';

    let questions = [];
    const questionCountSpan = document.getElementById('questionCount'); // Get the span element

    // Mostra un alert
    const showAlert = (message) => {
        showModal({
            type: 'alert',
            message
        });
    };

    // Mostra un'informazione
    const showInfo = (message) => {
        showModal({
            type: 'info',
            message
        });
    };

    const updateQuestionCount = () => {
        questionCountSpan.textContent = questions.length;
    };

    // Aggiungi una nuova domanda
    const addQuestion = () => {
        const questionText = document.getElementById("questionText").value.trim();
        const answerElements = document.querySelectorAll("#answers .flex");
        const answers = [];
        let correctAnswer = "";

        answerElements.forEach((el, i) => {
            const input = el.querySelector("input[type='text']");
            const radio = el.querySelector("input[type='radio']");
            const answerValue = input.value.trim();
            answers.push(answerValue);
            if (radio.checked) correctAnswer = String.fromCharCode(65 + i);
        });

        if (!questionText || answers.some(a => a === "")) {
            showAlert("Completare tutti i campi");
            return;
        }

        questions.push({
            text: questionText,
            answers,
            correctAnswer
        });
        updateQuestionList();
        saveToLocalStorage();
        updateQuestionCount();

        // Resetta il modulo
        document.getElementById("questionText").value = "";
        answerElements.forEach((el, i) => {
            el.querySelector("input[type='text']").value = "";
            el.querySelector("input[type='radio']").checked = i === 0;
        });
    };

    // Aggiorna la lista delle domande
    const updateQuestionList = () => {
        const list = document.getElementById("questionList");
        list.innerHTML = questions.map((q, index) => `
        <li class="p-2 bg-gray-200 rounded flex justify-between items-center">
            ${sanitizeHTML(q.text).replace(/\n/g, "<br>")}
            <div class="flex space-x-1">
                <button onclick="editQuestion(${index})" class='px-2 py-1 bg-blue-500 text-white rounded flex items-center hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400'>
                    <span class="material-icons">edit</span>
                </button>
                <button onclick="deleteQuestion(${index})" class='px-2 py-1 bg-red-500 text-white rounded flex items-center hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400'>
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </li>
    `).join('');
        updateQuestionCount(); // Update the counter after rendering the list
    };

    // Modifica una domanda esistente
    const editQuestion = (index) => {
        const q = questions[index];
        document.getElementById("questionText").value = q.text;
        const answerElements = document.querySelectorAll("#answers .flex");
        q.answers.forEach((answer, i) => {
            const input = answerElements[i].querySelector("input[type='text']");
            const radio = answerElements[i].querySelector("input[type='radio']");
            input.value = answer;
            radio.checked = q.correctAnswer === String.fromCharCode(65 + i);
        });
        questions.splice(index, 1);
        updateQuestionList();
        updateQuestionCount(); // Update the counter after editing
        saveToLocalStorage();
    };

    // Elimina una domanda
    const deleteQuestion = (index) => {
        questions.splice(index, 1);
        updateQuestionList();
        saveToLocalStorage();
        updateQuestionCount(); // Update the counter after deleting
    };

    // Pulisce tutte le domande
    const clearQuestions = () => {
        questions = [];
        updateQuestionList();
        saveToLocalStorage();
        updateQuestionCount(); // Update the counter after clearing
    };

    // Scarica il database in formato AIKEN
    const downloadAiken = () => {
            const aikenText = questions.map(q =>
                    `${q.text}\n${q.answers.map((a, i) => `${String.fromCharCode(65 + i)}. ${a}`).join('\n')}\nANSWER: ${q.correctAnswer}`
    ).join("\n\n");
    
    const blob = new Blob([aikenText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Database_AIKEN.txt";
    a.click();
};

// Mostra il modal
const showModal = ({ type, message, onConfirm }) => {
    const modal = document.getElementById("DynamicModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalIcon = document.getElementById("modalIcon");
    const modalHeader = document.getElementById("modalHeader");
    const modalMessage = document.getElementById("modalMessage");
    const modalButtons = document.getElementById("modalButtons");

    // Reset del contenuto del modal
    modalButtons.innerHTML = "";

    switch(type) {
        case 'alert':
            modalHeader.textContent = "Attenzione";
            modalIcon.textContent = "warning";
            modalIcon.className = "material-icons mr-2 text-orange-400";
            modalMessage.textContent = message;

            const okButton = document.createElement("button");
            okButton.className = "flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400";
            okButton.innerHTML = `<span class="material-icons mr-2">check</span> OK`;
            okButton.addEventListener('click', hideModal);

            modalButtons.appendChild(okButton);
            break;
        case 'confirm':
            modalHeader.textContent = "Attenzione";
            modalIcon.textContent = "warning";
            modalIcon.className = "material-icons mr-2 text-orange-400";
            modalMessage.textContent = message;

            const cancelButton = document.createElement("button");
            cancelButton.className = "flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400";
            cancelButton.innerHTML = `<span class="material-icons mr-2">close</span> Annulla`;
            cancelButton.addEventListener('click', hideModal);

            const confirmButton = document.createElement("button");
            confirmButton.className = "flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-400";
            confirmButton.innerHTML = `<span class="material-icons mr-2">delete</span> Cancella DB`;
            confirmButton.addEventListener('click', () => {
                if (onConfirm) onConfirm();
                hideModal();
            });

            modalButtons.appendChild(cancelButton);
            modalButtons.appendChild(confirmButton);
            break;
        case 'info':
            modalHeader.textContent = "Notifica";
            modalIcon.textContent = "info";
            modalIcon.className = "material-icons mr-2 text-blue-400";
            modalMessage.textContent = message;

            const infoOkButton = document.createElement("button");
            infoOkButton.className = "flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400";
            infoOkButton.innerHTML = `<span class="material-icons mr-2">check</span> OK`;
            infoOkButton.addEventListener('click', hideModal);

            modalButtons.appendChild(infoOkButton);
            break;
        default:
            console.warn(`Tipo di modal non riconosciuto: ${type}`);
    }

    modal.classList.remove("hidden");
    modal.setAttribute('aria-hidden', 'false');
};

// Nasconde il modal
const hideModal = () => {
    const modal = document.getElementById("DynamicModal");
    modal.classList.add("hidden");
    modal.setAttribute('aria-hidden', 'true');
};

// Gestione delle interazioni fuori dal modal
const setupModalInteractions = () => {
    const modal = document.getElementById('DynamicModal');
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    // Accessibilità: Chiudi il modal con la tastiera
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            hideModal();
        }
    });
};

// Sanitizza l'input per prevenire XSS
const sanitizeHTML = (str) => {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
};

// Trigger del input file
const triggerFileInput = () => {
    document.getElementById('importFileInput').click();
};

// Importa il database in formato AIKEN
const importAiken = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const parsedQuestions = parseAiken(content);
        if (parsedQuestions) {
            questions = questions.concat(parsedQuestions);
            updateQuestionList();
            saveToLocalStorage();
            showInfo("Importazione completata con successo!");
        }
    };
    reader.onerror = () => {
        showAlert("Errore nella lettura del file.");
    };
    reader.readAsText(file);
    
    // Resetta l'input file
    event.target.value = '';
};

// Parsing del formato AIKEN
const parseAiken = (text) => {
    const lines = text.split(/\r?\n/);
    const questionsParsed = [];
    let currentQuestion = null;
    let currentAnswers = {};
    let correctAnswer = null;

    for (let line of lines) {
        line = line.trim();
        if (line === '') continue; // Salta le righe vuote

        // Controlla se la linea è una risposta
        const answerMatch = line.match(/^([A-D])\)\s+(.*)$/i) || line.match(/^([A-D])\.\s+(.*)$/i);
        if (answerMatch) {
            const letter = answerMatch[1].toUpperCase();
            const answerText = answerMatch[2];
            if (currentQuestion) {
                currentAnswers[letter] = answerText;
            } else {
                showAlert("Formato AIKEN errato: Risposta senza una domanda precedente.");
                return null;
            }
            continue;
        }

        // Controlla se la linea è la risposta corretta
        const answerLineMatch = line.match(/^ANSWER:\s+([A-D])$/i);
        if (answerLineMatch) {
            correctAnswer = answerLineMatch[1].toUpperCase();
            if (currentQuestion && Object.keys(currentAnswers).length >= 2) {
                // Aggiungi la domanda al database
                const answersArray = ['A', 'B', 'C', 'D'].map(letter => currentAnswers[letter] || '');
                questionsParsed.push({
                    text: currentQuestion,
                    answers: answersArray,
                    correctAnswer: correctAnswer
                });
            } else {
                showAlert("Formato AIKEN errato: Mancano risposte valide o domanda.");
                return null;
            }
            // Reset per la prossima domanda
            currentQuestion = null;
            currentAnswers = {};
            correctAnswer = null;
            continue;
        }

        // Se non è una risposta o la risposta corretta, è il testo della domanda
        currentQuestion = line;
        currentAnswers = {};
        correctAnswer = null;
    }

    // Controlla se l'ultimo formato è stato completato
    if (currentQuestion && Object.keys(currentAnswers).length >= 2 && correctAnswer) {
        const answersArray = ['A', 'B', 'C', 'D'].map(letter => currentAnswers[letter] || '');
        questionsParsed.push({
            text: currentQuestion,
            answers: answersArray,
            correctAnswer: correctAnswer
        });
    } else if (currentQuestion && Object.keys(currentAnswers).length >= 2 && !correctAnswer) {
        showAlert("Formato AIKEN errato: Mancante risposta corretta per l'ultima domanda.");
        return null;
    }

    // Validazione finale
    for (const q of questionsParsed) {
        if (!q.text || q.answers.some(a => a === '') || !q.correctAnswer) {
            showAlert("Errore nel formato del file AIKEN.");
            return null;
        }
    }

    return questionsParsed;
};

// Funzione per salvare le domande in localStorage
const saveToLocalStorage = () => {
    try {
        const serializedData = JSON.stringify(questions);
        localStorage.setItem('aikenQuestions', serializedData);
        console.log("Domande salvate in localStorage.");
    } catch (e) {
        console.error("Errore nel salvare i dati: ", e);
        showAlert("Errore nel salvare i dati. Prova a ridurre il numero di domande.");
    }
};

// Funzione per caricare le domande da localStorage
const loadFromLocalStorage = () => {
    const data = localStorage.getItem('aikenQuestions');
    if (data) {
        try {
            questions = JSON.parse(data);
            console.log("Domande caricate da localStorage.");
            updateQuestionList();
            updateQuestionCount(); // Update the counter after loading
        } catch (e) {
            console.error("Errore nel caricare i dati: ", e);
            showAlert("Errore nel caricare i dati salvati. I dati potrebbero essere corrotti.");
        }
    }
};

// Inizializzazione
const init = () => {
    loadFromLocalStorage();
    setupModalInteractions();
    updateQuestionCount(); // Initialize the counter on load

    // Event Listener per cancellare il DB
    document.getElementById("clearCacheButton").addEventListener("click", () => {
        showModal({
            type: 'confirm',
            message: "Sei sicuro di voler cancellare il database? (L'operazione non è reversibile)",
            onConfirm: clearQuestions
        });
    });
};

// Esporre alcune funzioni globalmente se necessario
window.addQuestion = addQuestion;
window.editQuestion = editQuestion;
window.deleteQuestion = deleteQuestion;
window.downloadAiken = downloadAiken;
window.triggerFileInput = triggerFileInput;
window.importAiken = importAiken;
window.showInfo = showInfo;

// Avvia l'inizializzazione quando il DOM è pronto
document.addEventListener('DOMContentLoaded', init);
})();
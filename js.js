// Display Current Date and Time
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('clock').textContent = time;
}

// Initialize Numbers
function initializeNumbers() {
  document.getElementById('current-date').textContent = getCurrentDate();
  setInterval(updateClock, 1000);
  updateClock();

  const savedData = JSON.parse(localStorage.getItem(getCurrentDate())) || [];
  const numberLine = document.getElementById('number-line');
  numberLine.innerHTML = '';

  if (savedData.length > 0) {
    savedData.forEach(entry => numberLine.appendChild(createNumberEntry(entry.number, entry.shape, entry.comment)));
  } else {
    for (let i = 1; i <= 130; i++) {
      numberLine.appendChild(createNumberEntry(i));
    }
  }
}

// Create a Number Entry
function createNumberEntry(number, shape = 'none', comment = '') {
  const entry = document.createElement('div');
  entry.className = 'number-entry';
  entry.innerHTML = `
    <div class="number">${number}</div>
    <div class="shapes">
      <div class="shape ${shape === 'correct' ? 'correct' : ''}" onclick="setShape(this, 'correct')">✔</div>
      <div class="shape ${shape === 'incorrect' ? 'incorrect' : ''}" onclick="setShape(this, 'incorrect')">✘</div>
      <div class="shape ${shape === 'none' ? 'none' : ''}" onclick="setShape(this, 'none')">—</div>
    </div>
    <textarea oninput="saveData()">${comment}</textarea>
  `;
  return entry;
}

// Add or Delete Boxes
function addNumber() {
  const numberInput = document.getElementById('number-input');
  const inputValue = parseInt(numberInput.value, 10);

  if (isNaN(inputValue)) {
    alert('Please enter a valid number.');
    return;
  }

  const numberLine = document.getElementById('number-line');
  const existingNumbers = Array.from(numberLine.children).map(entry =>
    parseInt(entry.querySelector('.number').textContent, 10)
  );

  if (inputValue > 0) {
    // Add new boxes
    let startNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    for (let i = 0; i < inputValue; i++) {
      const numberEntry = createNumberEntry(startNumber++);
      numberLine.appendChild(numberEntry);
    }
  } else if (inputValue < 0) {
    // Delete boxes
    const boxesToDelete = Math.abs(inputValue);
    const numbersAbove130 = existingNumbers.filter(num => num > 130).sort((a, b) => b - a); // Highest to lowest

    if (numbersAbove130.length === 0) {
      alert('No numbers above 130 to delete.');
      return;
    }

    for (let i = 0; i < boxesToDelete; i++) {
      const numberToDelete = numbersAbove130[i];
      if (!numberToDelete) break;

      const entryToRemove = Array.from(numberLine.children).find(
        entry => parseInt(entry.querySelector('.number').textContent, 10) === numberToDelete
      );
      if (entryToRemove) {
        numberLine.removeChild(entryToRemove);
      }
    }
  }

  saveData(); // Save changes
  numberInput.value = ''; // Clear input field
}

// Set Shape
function setShape(element, status) {
  const shapes = element.parentElement.querySelectorAll('.shape');
  shapes.forEach(shape => shape.classList.remove('correct', 'incorrect', 'none'));
  element.classList.add(status);
  saveData();
}

// Save Data
function saveData() {
  const numberLine = document.getElementById('number-line');
  const data = Array.from(numberLine.children).map(entry => ({
    number: entry.querySelector('.number').textContent,
    shape: entry.querySelector('.shape.correct') ? 'correct' : entry.querySelector('.shape.incorrect') ? 'incorrect' : 'none',
    comment: entry.querySelector('textarea').value,
  }));
  localStorage.setItem(getCurrentDate(), JSON.stringify(data));
}

// Search Numbers with Exact Match
function filterNumbers() {
  const query = document.getElementById('search-bar').value.trim(); // Search query
  const numberLine = document.getElementById('number-line');
  const children = Array.from(numberLine.children);

  children.forEach(child => {
    const number = child.querySelector('.number').textContent.trim();

    if (number === query) {
      child.style.display = 'block'; // Show only the exact match
    } else {
      child.style.display = 'none'; // Hide all non-matching numbers
    }
  });

  // If the search query is empty, reset the display of all numbers
  if (query === '') {
    children.forEach(child => {
      child.style.display = 'block';
    });
  }
}

// Open Calendar
function openCalendar() {
  document.getElementById('calendar-modal').style.display = 'block';
  renderCalendar();
}

// Close Calendar
function closeCalendar() {
  document.getElementById('calendar-modal').style.display = 'none';
}

// Render Calendar
function renderCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add Header
  const header = document.getElementById('calendar-header');
  header.textContent = `${today.toLocaleString('default', { month: 'long' })} ${year}`;

  // Weekdays
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekdays.forEach(day => {
    const div = document.createElement('div');
    div.className = 'weekday';
    div.textContent = day;
    calendar.appendChild(div);
  });

  // Empty spaces for alignment
  const firstDay = new Date(year, month, 1).getDay() || 7;
  for (let i = 1; i < firstDay; i++) {
    const div = document.createElement('div');
    div.className = 'empty';
    calendar.appendChild(div);
  }

  // Calendar Dates
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const div = document.createElement('div');
    div.textContent = day;

    if (date === getCurrentDate() || localStorage.getItem(date)) {
      div.classList.add('saved');
      div.onclick = () => loadDataForDate(date);
    } else {
      div.classList.add('disabled');
    }

    calendar.appendChild(div);
  }
}

// Load Data for Selected Date
function loadDataForDate(date) {
  const savedData = JSON.parse(localStorage.getItem(date)) || [];
  const numberLine = document.getElementById('number-line');
  numberLine.innerHTML = '';

  if (savedData.length > 0) {
    savedData.forEach(entry => numberLine.appendChild(createNumberEntry(entry.number, entry.shape, entry.comment)));
  }
}

// Get Current Date
function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Initialize App
window.onload = initializeNumbers;


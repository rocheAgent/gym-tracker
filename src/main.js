import './styles.css'

// Estado de la app
let data = { workouts: [], exercises: [] }
let currentWorkout = null
let exerciseList = []

const defaultExercises = [
  'Press banca',
  'Sentadilla',
  'Peso muerto',
  'Press militar',
  'Curl de bíceps',
  'Extensión de tríceps',
  'Fondos',
  'Remo',
  'Pull ups',
  'Crunches'
]

// Elementos del DOM
const elements = {
  workoutName: document.getElementById('workout-name'),
  exerciseSelect: document.getElementById('exercise-select'),
  newWorkoutCard: document.getElementById('new-workout-card'),
  activeWorkout: document.getElementById('active-workout'),
  exercisesList: document.getElementById('exercises-list'),
  totalWorkouts: document.getElementById('total-workouts'),
  totalExercises: document.getElementById('total-exercises'),
  historyList: document.getElementById('history-list'),
  fileInput: document.getElementById('file-input')
}

// Cargar datos desde localStorage
function loadData() {
  try {
    const saved = localStorage.getItem('gym-tracker-data')
    if (saved) {
      data = JSON.parse(saved)
    }
  } catch (e) {
    console.log('Sin datos en localStorage')
  }
  updateHistory()
}

// Guardar datos en localStorage
function saveData() {
  try {
    localStorage.setItem('gym-tracker-data', JSON.stringify(data))
  } catch (e) {
    console.error('Error guardando datos:', e)
  }
}

// Poblar selector de ejercicios
function populateExerciseSelect() {
  const exercises = data.exercises?.length > 0 ? data.exercises : defaultExercises
  elements.exerciseSelect.innerHTML = '<option value="">Seleccionar ejercicio...</option>' +
    exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('')
}

// Cambiar pestaña
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
  
  document.getElementById(tabId).classList.add('active')
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active')
}

// Iniciar entrenamiento
function startWorkout() {
  const name = elements.workoutName.value || `Entrenamiento ${data.workouts.length + 1}`
  currentWorkout = {
    name,
    date: new Date().toISOString(),
    exercises: []
  }
  exerciseList = []
  
  elements.newWorkoutCard.style.display = 'none'
  elements.activeWorkout.style.display = 'block'
  elements.workoutName.value = ''
}

// Agregar ejercicio
function addExercise() {
  const exerciseName = elements.exerciseSelect.value
  
  if (!exerciseName) {
    alert('Selecciona un ejercicio')
    return
  }

  const exercise = {
    name: exerciseName,
    sets: []
  }

  // 3 sets por defecto
  for (let i = 0; i < 3; i++) {
    exercise.sets.push({ reps: 0, weight: 0 })
  }

  exerciseList.push(exercise)
  renderExercises()
  elements.exerciseSelect.value = ''
}

// Renderizar lista de ejercicios
function renderExercises() {
  const container = elements.exercisesList
  container.innerHTML = exerciseList.map((ex, idx) => `
    <div class="exercise-item">
      <div class="exercise-header">
        <span class="exercise-name">${ex.name}</span>
        <button class="btn btn-danger btn-small" data-remove="${idx}">✕</button>
      </div>
      <div class="sets-grid">
        ${ex.sets.map((set, sidx) => `
          <div>
            <div class="set-label">Set ${sidx + 1}</div>
            <input type="number" placeholder="Reps" value="${set.reps}" 
              data-ex="${idx}" data-set="${sidx}" data-field="reps">
            <input type="number" placeholder="Kg" value="${set.weight}"
              data-ex="${idx}" data-set="${sidx}" data-field="weight">
          </div>
        `).join('')}
      </div>
      <button class="btn btn-small btn-secondary" data-add-set="${idx}" style="margin-top: 8px;">+ Set</button>
    </div>
  `).join('')

  // Event listeners para inputs
  container.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const exIdx = parseInt(e.target.dataset.ex)
      const setIdx = parseInt(e.target.dataset.set)
      const field = e.target.dataset.field
      exerciseList[exIdx].sets[setIdx][field] = parseInt(e.target.value) || 0
    })
  })

  // Event listeners para botones
  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.remove)
      exerciseList.splice(idx, 1)
      renderExercises()
    })
  })

  container.querySelectorAll('[data-add-set]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.addSet)
      exerciseList[idx].sets.push({ reps: 0, weight: 0 })
      renderExercises()
    })
  })
}

// Finalizar entrenamiento
function finishWorkout() {
  if (exerciseList.length === 0) {
    alert('Agrega al menos un ejercicio')
    return
  }

  currentWorkout.exercises = exerciseList
  data.workouts.push(currentWorkout)
  
  currentWorkout = null
  exerciseList = []
  
  elements.newWorkoutCard.style.display = 'block'
  elements.activeWorkout.style.display = 'none'
  
  saveData()
  updateHistory()
  alert('✅ Entrenamiento guardado!')
}

// Cancelar entrenamiento
function cancelWorkout() {
  currentWorkout = null
  exerciseList = []
  elements.newWorkoutCard.style.display = 'block'
  elements.activeWorkout.style.display = 'none'
}

// Actualizar historial
function updateHistory() {
  elements.totalWorkouts.textContent = data.workouts.length
  
  let exCount = 0
  data.workouts.forEach(w => exCount += w.exercises.length)
  elements.totalExercises.textContent = exCount

  if (data.workouts.length === 0) {
    elements.historyList.innerHTML = '<div class="empty-state">No hay entrenamientos registrados</div>'
    return
  }

  const sorted = [...data.workouts].sort((a, b) => new Date(b.date) - new Date(a.date))

  elements.historyList.innerHTML = sorted.map(w => {
    const date = new Date(w.date).toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const exercisesSummary = w.exercises.map(ex => {
      const totalReps = ex.sets.reduce((sum, s) => sum + s.reps, 0)
      const totalWeight = ex.sets.reduce((sum, s) => sum + s.weight, 0)
      return `${ex.name}: ${ex.sets.length} sets, ${totalReps} reps, ${totalWeight}kg`
    }).join('<br>')

    return `
      <div class="history-item">
        <div class="history-date">${date}</div>
        <div class="history-exercises">${exercisesSummary}</div>
      </div>
    `
  }).join('')
}

// Exportar JSON
function exportJSON() {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gym-tracker-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

// Importar JSON
function importJSON(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      data = JSON.parse(e.target.result)
      saveData()
      updateHistory()
      populateExerciseSelect()
      alert('✅ Datos importados correctamente!')
    } catch (err) {
      alert('❌ Error al importar el archivo')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  loadData()
  populateExerciseSelect()

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab))
  })

  // Botones
  document.getElementById('start-workout-btn').addEventListener('click', startWorkout)
  document.getElementById('add-exercise-btn').addEventListener('click', addExercise)
  document.getElementById('finish-workout-btn').addEventListener('click', finishWorkout)
  document.getElementById('cancel-workout-btn').addEventListener('click', cancelWorkout)
  document.getElementById('download-btn').addEventListener('click', exportJSON)
  document.getElementById('upload-btn').addEventListener('click', () => elements.fileInput.click())
  elements.fileInput.addEventListener('change', importJSON)
})

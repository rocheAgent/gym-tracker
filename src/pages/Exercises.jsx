import { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultExercises, muscleGroups } from '../data/defaultExercises';
import { Plus, Search, X, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import './Exercises.css';

export default function Exercises() {
  const [exercises, setExercises] = useLocalStorage('exercises', defaultExercises);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: '', muscle: '', equipment: '' });
  
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle = !filterMuscle || ex.muscle === filterMuscle;
    return matchesSearch && matchesMuscle;
  });
  
  const addExercise = () => {
    if (!newExercise.name || !newExercise.muscle) return;
    
    setExercises([...exercises, { 
      ...newExercise, 
      id: uuidv4(),
      isCustom: true 
    }]);
    setNewExercise({ name: '', muscle: '', equipment: '' });
    setShowAddModal(false);
  };
  
  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };
  
  const isDefault = (id) => !exercises.find(e => e.id === id)?.isCustom;
  
  return (
    <div className="exercises-page fade-in">
      <header className="page-header">
        <div>
          <h1>Ejercicios</h1>
          <p className="subtitle">{exercises.length} ejercicios disponibles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Nuevo
        </button>
      </header>
      
      <div className="filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="input filter-select"
          value={filterMuscle}
          onChange={(e) => setFilterMuscle(e.target.value)}
        >
          <option value="">Todos los músculos</option>
          {muscleGroups.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
      
      <div className="exercises-grid">
        {filteredExercises.map(ex => (
          <div key={ex.id} className="exercise-item card">
            <div className="exercise-info">
              <h3>{ex.name}</h3>
              <div className="tags">
                <span className="tag muscle">{ex.muscle}</span>
                <span className="tag equipment">{ex.equipment}</span>
                {ex.isCustom && <span className="tag custom">Custom</span>}
              </div>
            </div>
            {ex.isCustom && (
              <button 
                className="btn-ghost delete-btn"
                onClick={() => deleteExercise(ex.id)}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {filteredExercises.length === 0 && (
        <div className="empty">
          <p>No se encontraron ejercicios</p>
        </div>
      )}
      
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Ejercicio</h2>
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Nombre del ejercicio"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label className="label">Grupo Muscular</label>
                <select
                  className="input"
                  value={newExercise.muscle}
                  onChange={(e) => setNewExercise({ ...newExercise, muscle: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {muscleGroups.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="label">Equipamiento</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Barra, Mancuernas, Maquina..."
                  value={newExercise.equipment}
                  onChange={(e) => setNewExercise({ ...newExercise, equipment: e.target.value })}
                />
              </div>
              <button className="btn btn-primary" onClick={addExercise}>
                <Plus size={18} />
                Agregar Ejercicio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
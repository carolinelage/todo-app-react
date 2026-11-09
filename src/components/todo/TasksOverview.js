'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheck, FiChevronDown, FiInbox, FiTrash2 } from 'react-icons/fi';
import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';

export default function TasksOverview() {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const listMenuRef = useRef(null);

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) { setIsLoading(false); return undefined; }
    return onSnapshot(collection(getFirebaseDb(), 'users', user.uid, 'lists'), (snapshot) => {
      const validLists = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setLists(validLists);
      setActiveListId((current) => validLists.some((list) => list.id === current) ? current : (validLists[0]?.id ?? ''));
      setIsLoading(false);
    }, () => setIsLoading(false));
  }, []);

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId),
    [activeListId, lists],
  );

  useEffect(() => {
    function closeListMenu(event) {
      if (listMenuRef.current && !listMenuRef.current.contains(event.target)) {
        setIsListMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', closeListMenu);
    return () => document.removeEventListener('mousedown', closeListMenu);
  }, []);

  function updateListTodos(updateTodos) {
    setLists((current) => {
      const updated = current.map((list) => (
        list.id === activeListId ? { ...list, todos: updateTodos(list.todos ?? []) } : list
      ));
      const user = getFirebaseAuth().currentUser;
      const changed = updated.find((list) => list.id === activeListId);
      if (user && changed) void setDoc(doc(getFirebaseDb(), 'users', user.uid, 'lists', activeListId), changed, { merge: true });
      return updated;
    });
  }

  function toggleTask(taskId) {
    updateListTodos((todos) => todos.map((task) => (
      task.id === taskId ? { ...task, isComplete: !task.isComplete } : task
    )));
  }

  function removeTask(taskId) {
    updateListTodos((todos) => todos.filter((task) => task.id !== taskId));
  }

  if (isLoading) return <p className="tasks-loading">Carregando suas tarefas...</p>;

  return (
    <section className="tasks-overview">
      <div className="tasks-overview-header">
        <div>
          <span className="dashboard-eyebrow">Workspace</span>
          <h1>Minhas tarefas</h1>
          <p>Veja tudo o que precisa da sua atenção em cada lista.</p>
        </div>
        <div className="list-select" ref={listMenuRef}>
          <span>Lista selecionada</span>
          <div className={`list-select-trigger ${isListMenuOpen ? 'open' : ''}`}>
            <FiInbox />
            <button
              type="button"
              className="list-select-button"
              onClick={() => setIsListMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isListMenuOpen}
            >
              {activeList?.name ?? 'Nenhuma lista criada'}
            </button>
            <FiChevronDown className="list-select-chevron" />
          </div>
          {isListMenuOpen && lists.length > 0 && (
            <div className="list-options" role="listbox" aria-label="Listas disponíveis">
              {lists.map((list) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={list.id === activeListId}
                  className={`list-option ${list.id === activeListId ? 'selected' : ''}`}
                  key={list.id}
                  onClick={() => {
                    setActiveListId(list.id);
                    setIsListMenuOpen(false);
                  }}
                >
                  <span className="list-color" />
                  <span>{list.name}</span>
                  <small>{list.todos.length}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeList ? (
        <div className="all-tasks-panel">
          <div className="all-tasks-heading">
            <div>
              <span>Lista ativa</span>
              <h2>{activeList.name}</h2>
            </div>
            <strong>{activeList.todos?.length ?? 0} tarefas</strong>
          </div>
          <div className="all-tasks-list">
            {(activeList.todos ?? []).length === 0 ? (
              <div className="empty-list"><span>✦</span><strong>Essa lista ainda está vazia.</strong><p>Volte à visão geral para adicionar uma tarefa.</p></div>
            ) : (
              activeList.todos.map((task) => (
                <div className={`workspace-task ${task.isComplete ? 'completed' : ''}`} key={task.id}>
                  <button type="button" className="task-check" onClick={() => toggleTask(task.id)} aria-label={task.isComplete ? 'Marcar como pendente' : 'Concluir tarefa'}>
                    {task.isComplete && <FiCheck />}
                  </button>
                  <span>{task.text}</span>
                  <button type="button" className="task-delete" onClick={() => removeTask(task.id)} aria-label="Excluir tarefa"><FiTrash2 /></button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="all-tasks-panel empty-overview">
          <FiInbox />
          <strong>Você ainda não criou uma lista.</strong>
          <p>Crie sua primeira lista na visão geral.</p>
        </div>
      )}
    </section>
  );
}

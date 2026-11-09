'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import Link from 'next/link';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';
import { planDetails } from '../../lib/entitlements';
import { useUserPlan } from '../../hooks/useUserPlan';

function createList(name) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    todos: [],
  };
}

function normalizeLists(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((list) => list && typeof list.id === 'string' && typeof list.name === 'string')
    .map((list) => ({
      id: list.id,
      name: list.name,
      todos: Array.isArray(list.todos)
        ? list.todos.filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string')
        : [],
    }));
}

export default function TodoWorkspace() {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [taskDrafts, setTaskDrafts] = useState({});
  const [isAddingList, setIsAddingList] = useState(false);
  const [taskMessage, setTaskMessage] = useState('');
  const [editingListId, setEditingListId] = useState('');
  const [listNameDraft, setListNameDraft] = useState('');
  const { plan } = useUserPlan();
  const [showPlanUpgrade, setShowPlanUpgrade] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) return undefined;
      unsubscribe = onSnapshot(collection(getFirebaseDb(), 'users', user.uid, 'lists'), (snapshot) => {
        const nextLists = normalizeLists(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
        setLists(nextLists);
        setActiveListId((current) => nextLists.some((list) => list.id === current) ? current : (nextLists[0]?.id ?? ''));
        if (nextLists.length === 0) {
          const initialList = createList('Minha primeira lista');
          void setDoc(doc(getFirebaseDb(), 'users', user.uid, 'lists', initialList.id), initialList);
        }
      }, (error) => setWorkspaceError(`Não foi possível sincronizar suas listas (${error.code}).`));
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : 'Firebase não configurado.');
    }
    return () => unsubscribe();
  }, []);

  async function saveList(list) {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    try {
      await setDoc(doc(getFirebaseDb(), 'users', user.uid, 'lists', list.id), list, { merge: true });
    } catch (error) {
      setWorkspaceError(`Não foi possível salvar a lista (${error.code ?? 'erro'}).`);
    }
  }

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? lists[0],
    [activeListId, lists],
  );

  function addList(event) {
    event.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    const maxLists = planDetails[plan].maxLists;
    if (maxLists !== null && lists.length >= maxLists) {
      setShowPlanUpgrade(true);
      setIsAddingList(false);
      return;
    }
    const list = createList(name);
    setLists((current) => [...current, list]);
    saveList(list);
    setActiveListId(list.id);
    setNewListName('');
    setIsAddingList(false);
    setShowPlanUpgrade(false);
  }

  function startEditingList(list) {
    setEditingListId(list.id);
    setListNameDraft(list.name);
  }

  function handleListClick(event, list) {
    setActiveListId(list.id);
    if (event.detail === 2) {
      event.preventDefault();
      startEditingList(list);
    }
  }

  function cancelEditingList() {
    setEditingListId('');
    setListNameDraft('');
  }

  function saveListName() {
    const name = listNameDraft.trim();
    if (!name) {
      cancelEditingList();
      return;
    }

    const updatedList = lists.find((list) => list.id === editingListId);
    if (!updatedList) {
      cancelEditingList();
      return;
    }
    const updated = { ...updatedList, name };
    setLists((current) => current.map((list) => list.id === editingListId ? updated : list));
    void saveList(updated);
    cancelEditingList();
  }

  function addTask(event) {
    event.preventDefault();
    const listId = activeList?.id;
    const text = (taskDrafts[listId] ?? '').trim();
    if (!listId) {
      setTaskMessage('Selecione uma lista antes de criar uma tarefa.');
      return;
    }
    if (!text) {
      setTaskMessage('Digite uma tarefa para adicioná-la à lista.');
      return;
    }

    setLists((current) => current.map((list) => {
      if (list.id !== listId) return list;
      const updated = { ...list, todos: [{ id: `${Date.now()}-${Math.random()}`, text, isComplete: false }, ...list.todos] };
      saveList(updated);
      return updated;
    }));
    setTaskDrafts((current) => ({ ...current, [listId]: '' }));
    setTaskMessage('Tarefa adicionada à lista.');
    window.setTimeout(() => setTaskMessage(''), 2500);
  }

  function toggleTask(taskId) {
    setLists((current) => current.map((list) => {
      if (list.id !== activeList.id) return list;
      const updated = { ...list, todos: list.todos.map((task) => task.id === taskId ? { ...task, isComplete: !task.isComplete } : task) };
      saveList(updated);
      return updated;
    }));
  }

  function removeTask(taskId) {
    setLists((current) => current.map((list) => {
      if (list.id !== activeList.id) return list;
      const updated = { ...list, todos: list.todos.filter((task) => task.id !== taskId) };
      saveList(updated);
      return updated;
    }));
  }

  function removeList() {
    if (!activeList || lists.length === 1) return;
    const remaining = lists.filter((list) => list.id !== activeList.id);
    setLists(remaining);
    setActiveListId(remaining[0].id);
    const user = getFirebaseAuth().currentUser;
    if (user) void deleteDoc(doc(getFirebaseDb(), 'users', user.uid, 'lists', activeList.id));
  }

  if (workspaceError) return <p className="task-message" role="alert">{workspaceError}</p>;
  if (!activeList) return <p className="tasks-loading">Carregando suas listas...</p>;
  const activeTaskDraft = taskDrafts[activeList.id] ?? '';

  return (
    <div className="todo-workspace">
      <aside className="list-sidebar">
        <div className="list-sidebar-heading">
          <span>Suas listas</span>
          <button type="button" className="icon-button" onClick={() => setIsAddingList(true)} aria-label="Criar nova lista">
            <FiPlus />
          </button>
        </div>
        {isAddingList && (
          <form className="new-list-form" onSubmit={addList}>
            <input autoFocus value={newListName} onChange={(event) => setNewListName(event.target.value)} placeholder="Nome da lista" aria-label="Nome da nova lista" />
          </form>
        )}
        <nav aria-label="Listas de tarefas">
          {lists.map((list) => (
            editingListId === list.id ? (
              <input
                autoFocus
                key={list.id}
                className="list-name-input"
                value={listNameDraft}
                onChange={(event) => setListNameDraft(event.target.value)}
                onBlur={saveListName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveListName();
                  if (event.key === 'Escape') cancelEditingList();
                }}
                aria-label="Editar nome da lista"
              />
            ) : (
              <button
                type="button"
                key={list.id}
                className={`list-item ${list.id === activeList.id ? 'selected' : ''}`}
                onClick={(event) => handleListClick(event, list)}
                onDoubleClick={(event) => {
                  event.preventDefault();
                  startEditingList(list);
                }}
                title="Clique duas vezes para editar"
              >
                <span className="list-color" /> {list.name} <small>{list.todos.length}</small>
              </button>
            )
          ))}
        </nav>
        <p className="list-hint">Plano {planDetails[plan].name}: {planDetails[plan].maxLists === null ? 'listas ilimitadas' : `até ${planDetails[plan].maxLists} listas`}.</p>
        {showPlanUpgrade && (
          <div className="plan-upgrade-overlay" role="presentation">
            <section className="plan-upgrade-modal" role="dialog" aria-modal="true" aria-labelledby="plan-upgrade-title">
              <button type="button" className="plan-upgrade-close" onClick={() => setShowPlanUpgrade(false)} aria-label="Fechar aviso">×</button>
              <span className="plan-upgrade-icon">✦</span>
              <span className="plan-upgrade-eyebrow">Desbloqueie seu próximo passo</span>
              <h3 id="plan-upgrade-title">Você chegou ao limite do plano {planDetails[plan].name}</h3>
              <p>O plano Grátis permite até {planDetails[plan].maxLists} listas. Faça upgrade para criar listas ilimitadas e manter todos os seus projetos organizados em um só lugar.</p>
              <div className="plan-upgrade-actions">
                <Link href="/plans" className="plan-upgrade-cta">Ver planos e desbloquear <span>↗</span></Link>
                <button type="button" className="plan-upgrade-later" onClick={() => setShowPlanUpgrade(false)}>Continuar no plano atual</button>
              </div>
            </section>
          </div>
        )}
      </aside>

      <div className="task-list-content">
        <div className="task-list-heading">
          <div>
            <span className="dashboard-eyebrow">Lista ativa</span>
            {editingListId === activeList.id ? (
              <input
                autoFocus
                className="active-list-name-input"
                value={listNameDraft}
                onChange={(event) => setListNameDraft(event.target.value)}
                onBlur={saveListName}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveListName();
                  if (event.key === 'Escape') cancelEditingList();
                }}
                aria-label="Editar nome da lista ativa"
              />
            ) : (
              <div
                className="active-list-title"
              >
                <h2>{activeList.name}</h2>
                <button
                  type="button"
                  className="edit-list-button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    startEditingList(activeList);
                  }}
                  aria-label="Editar nome da lista"
                  title="Editar nome da lista"
                >
                  <FiEdit2 />
                </button>
              </div>
            )}
          </div>
          {lists.length > 1 && <button type="button" className="delete-list-button" onClick={removeList}><FiTrash2 /> Excluir lista</button>}
        </div>
        <form className="workspace-task-form" onSubmit={addTask}>
          <input
            id="task-input"
            value={activeTaskDraft}
            onChange={(event) => {
              setTaskDrafts((current) => ({ ...current, [activeList.id]: event.target.value }));
              if (taskMessage) setTaskMessage('');
            }}
            placeholder="O que você quer realizar?"
            aria-label="Nova tarefa"
            autoComplete="off"
          />
          <button type="submit"><FiPlus /> Adicionar tarefa</button>
        </form>
        {taskMessage && <p className="task-message" role="status">{taskMessage}</p>}
        <div className="workspace-tasks">
          {activeList.todos.length === 0 && (
            <div className="empty-list"><span>✦</span><strong>Essa lista está pronta para começar.</strong><p>Adicione sua primeira tarefa e dê forma ao seu dia.</p></div>
          )}
          {activeList.todos.map((task) => (
            <div className={`workspace-task ${task.isComplete ? 'completed' : ''}`} key={task.id}>
              <button type="button" className="task-check" onClick={() => toggleTask(task.id)} aria-label={task.isComplete ? 'Marcar como pendente' : 'Concluir tarefa'}>
                {task.isComplete && <FiCheck />}
              </button>
              <span>{task.text}</span>
              <button type="button" className="task-delete" onClick={() => removeTask(task.id)} aria-label="Excluir tarefa"><FiTrash2 /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

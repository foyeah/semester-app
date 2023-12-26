import './App.css'
import React from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from 'react-query';
import styled from 'styled-components';
import { useState } from 'react';

const NavBar = styled.div`
  background: #2196F3;
  height: 83px;
  width: full;
  display: flex;
`;

const Container = styled.div`
  max-width: 900px;
  margin: auto;
  padding: 20px;
`;

const NavBarButton = styled.button`
  border: solid;
  border-color: #ED6C02;
  margin: auto;
  background: #ED6C02;
  border-radius: 4px;
  padding: 6px 16px 6px 16px;
  color: white;
  margin-left: 20px;
  margin-right: 560px;
`;

const SortButton = styled.button`
  margin: auto;
  background: #FFFFFF;
  border: solid white;
  width: 200px;
  height: 48px;
  margin-left: auto;
  margin-right: 20px;
  font-size: 18px;
`;

const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const TaskItem = styled.li`
  width: full;
  border-style: solid;
  border-width: 1px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-text: center;
  border-radius: 10px;
  padding: 16px;
  font-size: 20px;
`;

const TaskButton = styled.button`
  background: #2196F3;
  align-items: center;
  justify-items: center;
  border-radius: 4px;
  border: solid;
  border-color: #2196F3;
  margin: 5px;
  color: white;
`;

const TaskDiv = styled.div`
  display: flex;
  justify-content: center;
`;

const App = () => {
  const queryClient = new QueryClient();
  const [sortCompleted, setSortCompleted] = useState(false);

  const fetchTasks = async () => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return sortCompleted
      ? storedTasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
      : storedTasks;
  };

  const addTask = async (newTask) => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = [...tasks, newTask];
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return updatedTasks;
  };

  const updateTask = async (updatedTask) => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return updatedTasks;
  };

  const deleteTask = async (taskId) => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    return updatedTasks;
  };

  const { data: tasks } = useQuery('tasks', fetchTasks, {
    initialData: [],
  });

  const mutation = useMutation(addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });

  const updateMutation = useMutation(updateTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });

  const deleteMutation = useMutation(deleteTask, {
    onSuccess: () => {
      queryClient.invalidateQueries('tasks');
    },
  });

  const handleEdit = (task) => {
    const editedTask = prompt('Edit task:', task.title);
    if (editedTask) {
      updateMutation.mutate({ ...task, title: editedTask });
    }
  };

  const handleDelete = (taskId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (confirmDelete) {
      deleteMutation.mutate(taskId);
    }
  };

  const handleToggleCompletion = (taskId) => {
    const updatedTasks = (tasks || []).map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    queryClient.setQueryData('tasks', updatedTasks);
  };

  const filteredTasks = sortCompleted ? (tasks || []) : (tasks || []).filter((task) => !task.completed);

  return (
    <>
      <NavBar>
        <Container>
          <NavBarButton
            onClick={() => {
              const newTask = prompt('Enter a new task:');
              if (newTask) {
                mutation.mutate({ id: Date.now(), title: newTask });
              }
            }}
          >
            ADD TASK
          </NavBarButton>
          <SortButton onClick={() => setSortCompleted(!sortCompleted)}>
            {sortCompleted ? 'Sort by All' : 'Sort by Done'}
          </SortButton>
        </Container>      
      </NavBar>
      <Container>
        <TaskList>
          {filteredTasks.map((task) => (
            <TaskItem key={task.id}>
              <input type="checkbox" onClick={() => handleToggleCompletion(task.id)} />
              <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.title}</span>
              <TaskDiv>
                <TaskButton onClick={() => handleEdit(task)}>EDIT</TaskButton>
                <TaskButton onClick={() => handleDelete(task.id)}><img src="Vector.png" alt="" /></TaskButton>
              </TaskDiv>
            </TaskItem>
          ))}
        </TaskList>       
      </Container>     
    </>
  );
};

const Root = () => (
  <QueryClientProvider client={new QueryClient()}>
    <App />
  </QueryClientProvider>
);

export default Root;

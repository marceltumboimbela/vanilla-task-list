import './normalize.css'
import './style.css'

type task = {
  date: string,
  is_done: boolean,
  description: string,
  id: string
}

type apiResponse = {
  user: string,
  user_avatar: string,
  tasks: {
    [key: string]: task
  }
}

class TaskManager {
  private _tasks: task[];
  constructor(){
    this._tasks = []
  }

  get tasks(){
    return this._tasks.sort(this.sortTaskByDate)
  }

  sortTaskByDate(a: task, b: task) {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  }

  generateRandomId(){
    return Math.floor(Math.random() * 100)
  }

  populateInitialData(tasks: apiResponse["tasks"]){
    let taskList = Object.entries(tasks)
    for(let [key, value] of taskList){
      const task = {...value, id: key}
      this.tasks.push(task)
    }
  }

  addNewTask() {
    const date = new Date()

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    const task = {
      date: formattedDate,
      is_done: false,
      description: "lorem ipsum",
      id: String(this.generateRandomId())
    }

    this.tasks.push(task)
  }

  getTaskById(id: task["id"]){
    return this.tasks.find(task => task.id === id)
  }

  removeTask(id: task["id"]){
    const index = this.tasks.findIndex(item => item.id === id)
    this.tasks.splice(index, 1)
  }
}

function renderTaskList(tasks: task[]){
  const taskListElement = document.querySelector('#taskList');
  if (taskListElement !== null) {
    const tasksElement = tasks.map((item) => taskComponent(item)).join('');
    taskListElement.innerHTML = tasksElement;
  }
}

function taskComponent(task: task) {
  return `
    <li data-taskid=${task.id}>
      <div class="task">
        <div class="taskHeader">
          <input type="date" value=${task.date} id="changeDate">
          <div class="taskRemove">
            <button>
              <label>
                <input type="checkbox" id="checkDone" name="checkDone" ${task.is_done ? "checked": ""}>
                ${task.is_done ? "Done" : "Mark as Done"}
              </label>
            </button>
            <button id="removeTask">Remove</button>
          </div>
        </div>
        <div class="taskDescription">
          <p>${task.description}</p>
        </div>
      </div>
    </li>
  `
}

function renderProfile(user: apiResponse["user"], avatar: apiResponse["user_avatar"]){
  const userName = document.querySelector('#userName')
  const userAvatar = document.querySelector<HTMLImageElement>('#userAvatar')
  if (userName !== null) {
    userName.textContent = user
  }
  if (userAvatar !== null) {
    userAvatar.src = avatar
  }
}

async function getData(){
  const response = await fetch('http://localhost:8080/')
  const jsonResult: apiResponse = await response.json()
  return jsonResult
}

async function main(){
  const addTaskButton = document.querySelector<HTMLButtonElement>('#addTask')
  const taskListElement = document.querySelector('#taskList')
  const taskManager = new TaskManager()

  const result = await getData()
  taskManager.populateInitialData(result.tasks)
  renderTaskList(taskManager.tasks)
  renderProfile(result.user, result.user_avatar)
  if (addTaskButton !== null) {
    addTaskButton.addEventListener('click', () => {
      taskManager.addNewTask()
      renderTaskList(taskManager.tasks)
    })
  }

  if (taskListElement !== null) {
    taskListElement.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if(target.matches('#checkDone')){
        const listItem = target.closest('li');
        if (listItem !== null) {
          const taskId = listItem.dataset.taskid;
          if (taskId === undefined) return;
          const task = taskManager.getTaskById(taskId);
          if (task === undefined) return
          task.is_done = !task.is_done;
          renderTaskList(taskManager.tasks);
        }
      }

      if (target.matches('#removeTask')) {
        const listItem = target.closest('li');
        if (listItem !== null) {
          const taskId = listItem.dataset.taskid;
          if (taskId === undefined) return;
          taskManager.removeTask(taskId);
          renderTaskList(taskManager.tasks);
        }
      }
    })
  }

  if (taskListElement !== null) {
    taskListElement.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;

      if(target.matches('#changeDate')){
        const listItem = target.closest('li');
        if(listItem !== null){
          const taskId = listItem.dataset.taskid
          if(taskId === undefined) return
          const task = taskManager.getTaskById(taskId)
          if (task === undefined) return
          task.date = `${target.value}`
          renderTaskList(taskManager.tasks)
        }
      }
    })
  }
}

main()
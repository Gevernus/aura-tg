import { CoinsComponent, PassiveIncomeComponent, ClickPowerComponent, TasksComponent, UserComponent } from '../dist/components.js';
const taskCardMap = new Map();

function updateTaskCard(task, cardElement) {
    const progressPercentage = (task.progress / task.task_requiredActionCount) * 100;

    cardElement.querySelector('h3').textContent = task.task_name;
    cardElement.querySelector('p').textContent = task.task_description;
    cardElement.querySelector('.task-progress').style.width = `${progressPercentage}%`;
    cardElement.querySelector('.progress-text').textContent = `Progress: ${task.progress}/${task.task_requiredActionCount}`;
    cardElement.querySelector('.reward-text').textContent = `Reward: ${task.task_coins_bonus} coins`;

    const claimButton = cardElement.querySelector('.claim-reward-button');
    if (task.completed && !task.claimed) {
        if (!claimButton) {
            const newClaimButton = document.createElement('button');
            newClaimButton.className = 'claim-reward-button';
            newClaimButton.setAttribute('data-task-id', task.task_id);
            newClaimButton.textContent = 'Claim';
            cardElement.querySelector('.task-content').appendChild(newClaimButton);
        }
    } else if (claimButton) {
        claimButton.remove();
    }
}

export function init(entity) {
    // Add tab switching functionality
    initializeTabs();
    document.addEventListener('click', (event) => {
        const claimButton = event.target.closest('.claim-reward-button');
        if (claimButton) {
            const taskId = claimButton.getAttribute('data-task-id');
            claimReward(entity, taskId);
        }
    });
};

async function claimReward(entity, taskId) {
    try {
        const userComponent = entity.getComponent(UserComponent);
        const tasksComponent = entity.getComponent(TasksComponent);
        const coinsComponent = entity.getComponent(CoinsComponent);

        const response = await fetch(`/api/${userComponent.user.id}/tasks/${taskId}/claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            console.error(`Failed to update progress for task ${taskId}`);
        }

        const { tasks, reward } = await response.json();
        tasksComponent.tasks = tasks;
        coinsComponent.amount += reward;

    } catch (error) {
        console.error(`Error updating progress for task ${taskId}:`, error);
    }
}

function createTaskCard(task) {
    const cardElement = document.createElement('div');
    cardElement.className = 'task-card';
    cardElement.innerHTML = `
        <div class="task-icon ${task.daily ? 'daily-task' : ''}"></div>
        <div class="task-content">
            <h3></h3>
            <p></p>
            <div class="task-progress-bar">
                <div class="task-progress"></div>
            </div>
            <p class="progress-text"></p>
            <p class="reward-text"></p>
        </div>
    `;
    updateTaskCard(task, cardElement);
    return cardElement;
}

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`${tabName}-container`).classList.add('active');
        });
    });
};

export function render(entity) {
    // Update coins and passive income display
    const coinsComponent = entity.getComponent(CoinsComponent);
    const passiveIncomeComponent = entity.getComponent(PassiveIncomeComponent);
    const clickPowerComponent = entity.getComponent(ClickPowerComponent);
    document.getElementById('coins').textContent = Math.floor(coinsComponent.amount);
    document.getElementById('passiveIncome').textContent = passiveIncomeComponent.incomePerHour.toFixed(1);
    document.getElementById('tapPower').textContent = clickPowerComponent.power;

    const tasksComponent = entity.getComponent(TasksComponent);
    const activeTasks = tasksComponent.tasks.filter(task => !task.completed || !task.claimed);
    const completedTasks = tasksComponent.tasks.filter(task => task.completed && task.claimed);

    const activeContainer = document.getElementById('active-container');
    const completedContainer = document.getElementById('completed-container');

    // Function to update or create a task card
    function updateOrCreateTaskCard(task, container) {
        let cardElement = taskCardMap.get(task.task_id);
        if (!cardElement) {
            cardElement = createTaskCard(task);
            taskCardMap.set(task.task_id, cardElement);
        } else {
            updateTaskCard(task, cardElement);
        }

        if (cardElement.parentElement !== container) {
            container.appendChild(cardElement);
        }
    }

    // Update or create active task cards
    activeTasks.forEach(task => updateOrCreateTaskCard(task, activeContainer));

    // Update or create completed task cards
    completedTasks.forEach(task => updateOrCreateTaskCard(task, completedContainer));

    // Remove any cards for tasks that no longer exist
    taskCardMap.forEach((cardElement, taskId) => {
        if (!tasksComponent.tasks.some(task => task.task_id === taskId)) {
            cardElement.remove();
            taskCardMap.delete(taskId);
        }
    });

    // Move any remaining cards to the correct container
    taskCardMap.forEach((cardElement, taskId) => {
        const task = tasksComponent.tasks.find(t => t.task_id === taskId);
        if (task) {
            const targetContainer = task.completed && task.claimed ? completedContainer : activeContainer;
            if (cardElement.parentElement !== targetContainer) {
                targetContainer.appendChild(cardElement);
            }
        }
    });
}
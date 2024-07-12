({
    init: function (entity) {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
    //     data.tasksData.forEach(task => {
    //         const taskDiv = document.createElement('div');
    //         taskDiv.classList.add('task-item');
    //         taskDiv.innerHTML = `
    //     <p>${task.description}</p>
    //     <p>Reward: ${task.reward}</p>
    //     <button class="completeButton" data-id="${task.id}">Complete</button>
    //   `;
    //         tasksList.appendChild(taskDiv);
    //     });

        document.querySelectorAll('.completeButton').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = e.target.getAttribute('data-id');
                console.log(`Completing task with ID: ${taskId}`);
            });
        });
    },

    render: function (entity) {

    }
})
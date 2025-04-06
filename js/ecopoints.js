document.addEventListener("DOMContentLoaded", async () => {
    try {
    if (localStorage.getItem('user')) {
        const userString = localStorage.getItem('user');
        const user = JSON.parse(userString);
        const signInElement = document.getElementById('sign-in');
        const avatarElement = document.getElementById('user-avatar');
        const pointsElement = document.getElementById('points');
        const actionsElement = document.getElementById('actions-list');

        document.getElementById('level').textContent = `Level ${Math.floor(user.points / 50) + 1}`;

        document.getElementById("sign-up").textContent = "Log Positive Environment Action";
        if (signInElement && user.name) {
            signInElement.textContent = user.name;
        }
        
        if (avatarElement && user.photoURL) {
            avatarElement.src = user.photoURL;
            avatarElement.classList.remove('hidden');
        }

        if (pointsElement) {
            pointsElement.textContent = user.points || 0;
        }

        if (actionsElement) {
            const actions = user.actions || [];
            actionsElement.innerHTML = '';
            actions.forEach(action => {
                const li = document.createElement('li');
                li.className = 'action-item fade-in';
                li.innerHTML = `
                    <div class="action-content">
                    <span class="action-date">April 6, 2025</span>
                        <h3>${user.name}'s New Action</h3>
                        <p>${action.text}</p>
                        <span class="points-badge">+${action.points} points</span>
                    </div>
                `;
                actionsElement.insertBefore(li, actionsElement.firstChild);
            });
        }

        const leaderboardElement = document.querySelector('.leaderboard-list');
        const leaderboard = [
            { name: 'Ben K.', points: 1250 },
            { name: 'Utsav D.', points: 980 },
            { name: 'Himesh A.', points: 875 },
            { name: user.name, points: user.points || 0 } // Add the current user
        ];

        // Sort leaderboard by points in descending order
        leaderboard.sort((a, b) => b.points - a.points);

        // Clear existing leaderboard
        leaderboardElement.innerHTML = '';

        // Populate sorted leaderboard
        leaderboard.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = `leaderboard-item ${index === 0 ? 'top-player' : ''}`;
            li.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-points">${player.points} pts</span>
            `;
            leaderboardElement.appendChild(li);
        });
    }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
    
    // add action when user submits form
    const form = document.getElementById('action-input');
    document.addEventListener('submit',  (event) => {
        event.preventDefault();
        const actionInput = document.getElementById('action-input');
        const action = actionInput.value;
        
        
        if (localStorage.getItem('user')) {
            const userString = localStorage.getItem('user');
            const user = JSON.parse(userString);
            const actionInput = document.getElementById('action-input');
            

            const actionText = actionInput.value.trim();
            
            if (!actionText) return;

            const actionsElement = document.getElementById('actions-list');
            const pointsElement = document.getElementById('points');

            // user.actions.push(actionText);
            localStorage.setItem('user', JSON.stringify(user));
            
            const points = Math.floor(Math.random() * 10) + 10;
            user.points += points;

            const newAction = {
                text: actionText,
                points: points,
                date: new Date().toISOString()
            };

            user.actions.push(newAction);
            localStorage.setItem('user', JSON.stringify(user));
            const li = document.createElement('li');
            // make div inside
            li.className = 'action-item fade-in';
            li.innerHTML = `
                <div class="action-content">
                <span class="action-date">April 6, 2025</span>
                    <h3>${user.name} New Action</h3>
                    <p>${actionText}</p>
                    <span class="points-badge">+${points} points</span>
                </div>
            `;
            actionsElement.insertBefore(li, actionsElement.firstChild);
            pointsElement.textContent = user.points;
            // update local storage points
            localStorage.setItem('user', JSON.stringify(user));
        }
        actionInput.value = '';
    });
});
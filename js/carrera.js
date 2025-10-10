document.addEventListener("DOMContentLoaded", async () => {
    // --- ELEMENTOS DEL DOM ---
    const selectPilotEl = document.getElementById('select-pilot');
    const selectCircuitEl = document.getElementById('select-circuit');
    const selectLapsEl = document.getElementById('select-laps');
    const selectDriversEl = document.getElementById('select-drivers');
    const preRaceScreen = document.getElementById('pre-race-screen');
    const startRaceBtn = document.getElementById('start-race-btn');
    const raceSimulationScreen = document.getElementById('race-simulation-screen');
    const driversStandings = document.getElementById('drivers-standings');
    const currentLapDisplay = document.getElementById('current-lap-display');
    const trackNameDisplay = document.getElementById('track-name-display');
    const standingsLapDisplay = document.getElementById('standings-lap-display');
    const standingsList = document.getElementById('standings-list');
    const canvas = document.getElementById('track-canvas');
    const ctx = canvas.getContext('2d');
    const carsContainer = document.getElementById('cars-container');
    const stopRaceBtn = document.getElementById('stop-race-btn');
    const raceEndModal = document.getElementById('race-end-modal');
    const restartRaceBtn = document.getElementById('restart-race-btn');
    const winnerNameEl = document.getElementById('winner-name');
    const winnerTeamEl = document.getElementById('winner-team');

    // --- DATOS Y ESTADO DE LA CARRERA ---
    let allPilots = [];
    let allTeams = [];
    let allCircuits = [];
    let raceParticipants = []; // Pilotos seleccionados para esta carrera
    let userSelectedPilotId = '';
    let currentLap = 0;
    let totalLaps = 0;
    let circuitLength = 0;
    let raceInterval = null; // Para el bucle de simulación
    const SIMULATION_SPEED_MS = 150; // Velocidad de actualización de la simulación (más bajo = más rápido)
    const PIT_STOP_LAP_RANGE = { min: 20, max: 40 }; // Vueltas entre las que se hará un pit stop
    const PIT_STOP_DURATION = 0.5; // Vueltas que se "pierden" en un pit stop

    // --- FUNCIONES DE INICIALIZACIÓN ---
    async function loadData() {
        try {
            // Asegúrate de que las rutas a tus archivos JSON son correctas
            const f1DataResponse = await fetch('/resources/json/f1.json'); // o la ruta a tu f1.json
            const f1Data = await f1DataResponse.json();
            allPilots = f1Data.pilotos;
            allTeams = f1Data.escuderias;

            const circuitsResponse = await fetch('/resources/json/circuitos.json'); // o la ruta a tu circuits.json
            allCircuits = await circuitsResponse.json();

            populateSelectors();
        } catch (error) {
            console.error("Error al cargar los datos de F1 o circuitos:", error);
        }
    }

    function populateSelectors() {
        allPilots.forEach(pilot => {
            const option = document.createElement('option');
            option.value = pilot.id;
            option.textContent = pilot.name;
            selectPilotEl.appendChild(option);
        });

        allCircuits.forEach(circuit => {
            const option = document.createElement('option');
            option.value = circuit.id;
            option.textContent = circuit.name;
            selectCircuitEl.appendChild(option);
        });
    }

    function resetRaceState() {
        raceParticipants = [];
        userSelectedPilotId = '';
        currentLap = 0;
        totalLaps = 0;
        circuitLength = 0;
        if (raceInterval) {
            clearInterval(raceInterval);
            raceInterval = null;
        }
        preRaceScreen.style.display = 'flex';
        raceSimulationScreen.style.display = 'none';
        driversStandings.style.display = 'none';
        standingsList.innerHTML = '';
        carsContainer.innerHTML = '';
    }

    // --- LÓGICA DE LA SIMULACIÓN ---
    function setupRace() {
        resetRaceState();

        userSelectedPilotId = selectPilotEl.value;
        const selectedCircuitId = selectCircuitEl.value;
        totalLaps = parseInt(selectLapsEl.value);
        const numDrivers = parseInt(selectDriversEl.value);

        if (!userSelectedPilotId || !selectedCircuitId) {
            alert("Por favor, selecciona un piloto y un circuito.");
            return false;
        }

        const selectedCircuit = allCircuits.find(c => c.id === selectedCircuitId);
        circuitLength = selectedCircuit.length;

        trackNameDisplay.textContent = `Circuito: ${selectedCircuit.name}`;
        currentLapDisplay.textContent = `Vuelta: 0 / ${totalLaps}`;
        standingsLapDisplay.textContent = `(Vuelta 0)`;

        let availablePilots = allPilots.filter(p => p.id !== userSelectedPilotId);
        availablePilots.sort(() => 0.5 - Math.random());
        const otherPilots = availablePilots.slice(0, numDrivers - 1);
        const userPilot = allPilots.find(p => p.id === userSelectedPilotId);

        raceParticipants = [userPilot, ...otherPilots].map(pilot => {
            const team = allTeams.find(t => t.id === pilot.teamId); // Usamos teamId
            return {
                id: pilot.id,
                name: pilot.name,
                teamName: team ? team.name : 'Unknown',
                teamId: pilot.teamId,
                skill: pilot.skill,
                carPerformance: team ? team.carPerformance : 5.0,
                lapsCompleted: 0,
                currentLapProgress: Math.random() * 0.01, // Pequeña variación inicial
                isPitStopping: false,
                pitStopAtLap: Math.floor(Math.random() * (PIT_STOP_LAP_RANGE.max - PIT_STOP_LAP_RANGE.min + 1)) + PIT_STOP_LAP_RANGE.min
            };
        });

        raceParticipants.sort((a, b) => (b.skill + b.carPerformance) - (a.skill + a.carPerformance));

        preRaceScreen.style.display = 'none';
        raceSimulationScreen.style.display = 'flex';
        driversStandings.style.display = 'block';

        drawTrack();
        renderStandings(); // Renderiza la tabla inicial estática
        raceInterval = setInterval(runRaceStep, SIMULATION_SPEED_MS);
        return true;
    }

    function runRaceStep() {
        if (raceParticipants.length === 0 || currentLap >= totalLaps) {
            clearInterval(raceInterval);
            raceInterval = null;
            displayRaceResults();
            return;
        }

        raceParticipants.forEach((pilot, index) => {
            if (pilot.isPitStopping) {
                // Lógica de pit stop simplificada
                pilot.isPitStopping = false; // Solo dura un "paso"
                return; // No avanza en este paso
            }

            let speedBoost = 0;
            if (index > 0) {
                const driverAhead = raceParticipants[index - 1];
                const distanceToAhead = (driverAhead.lapsCompleted + driverAhead.currentLapProgress) - (pilot.lapsCompleted + pilot.currentLapProgress);
                if (distanceToAhead < 0.015) {
                    speedBoost += 0.001; // Efecto DRS/rebufo
                }
            }

            if (Math.random() < 0.05) {
                speedBoost -= 0.002; // Pequeño error
            }

            const circuitDifficultyFactor = 1 - (allCircuits.find(c => c.id === selectCircuitEl.value).difficulty / 20);
            const baseSpeed = (pilot.skill / 10) * (pilot.carPerformance / 10) * 0.005;
            const randomFactor = (Math.random() * 0.004) - 0.002;

            pilot.currentLapProgress += (baseSpeed + randomFactor + speedBoost) * circuitDifficultyFactor;

            if (pilot.currentLapProgress >= 1) {
                pilot.lapsCompleted++;
                pilot.currentLapProgress %= 1;

                if (pilot.lapsCompleted === pilot.pitStopAtLap && pilot.lapsCompleted < totalLaps - 5) {
                    pilot.isPitStopping = true;
                    pilot.pitStopAtLap += Math.floor(Math.random() * (PIT_STOP_LAP_RANGE.max - PIT_STOP_LAP_RANGE.min + 1)) + PIT_STOP_LAP_RANGE.min;
                }
            }
        });

        const leadDriver = raceParticipants[0];
        if (leadDriver && leadDriver.lapsCompleted > currentLap) {
            currentLap = leadDriver.lapsCompleted;
            if (currentLap > totalLaps) currentLap = totalLaps;
            currentLapDisplay.textContent = `Vuelta: ${currentLap} / ${totalLaps}`;
            standingsLapDisplay.textContent = `(Vuelta ${currentLap})`;
        }

        raceParticipants.sort((a, b) => (b.lapsCompleted + b.currentLapProgress) - (a.lapsCompleted + a.currentLapProgress));

        renderStandings();
        updateCarPositionsOnCanvas();

        if (raceParticipants[0].lapsCompleted >= totalLaps) {
            clearInterval(raceInterval);
            raceInterval = null;
            displayRaceResults();
        }
    }

    // --- FUNCIONES DE RENDERIZADO ---
    function drawTrack() {
        const w = canvas.width = canvas.parentElement.clientWidth;
        const h = canvas.height = canvas.parentElement.clientHeight;
        const centerX = w / 2;
        const centerY = h / 2;
        const radiusX = w / 2 - 40;
        const radiusY = h / 2 - 20;

        ctx.clearRect(0, 0, w, h);

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 20;
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX - 30, radiusY - 15, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radiusY);
        ctx.lineTo(centerX, centerY - radiusY + 35);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    function updateCarPositionsOnCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;

        carsContainer.innerHTML = '';

        raceParticipants.forEach((pilot, index) => {
            const angle = (pilot.currentLapProgress * 2 * Math.PI) - (Math.PI / 2);
            const laneOffset = (index % 5) - 2;
            const radiusX = (w / 2 - 40) - (laneOffset * 5);
            const radiusY = (h / 2 - 20) - (laneOffset * 2.5);

            const x = centerX + radiusX * Math.cos(angle);
            const y = centerY + radiusY * Math.sin(angle);

            const carDot = document.createElement('div');
            carDot.className = 'car-dot';
            if (pilot.id === userSelectedPilotId) {
                carDot.classList.add('user-car');
            }

            const team = allTeams.find(t => t.id === pilot.teamId); // Usamos teamId
            carDot.style.backgroundColor = team ? team.color || '#FFFFFF' : '#FFFFFF';
            carDot.style.left = `${x - 6}px`;
            carDot.style.top = `${y - 6}px`;

            carsContainer.appendChild(carDot);
        });
    }

    function renderStandings() {
        const leadDriverTotalProgress = raceParticipants.length > 0 ? (raceParticipants[0].lapsCompleted + raceParticipants[0].currentLapProgress) : 0;

        raceParticipants.forEach((pilot, index) => {
            let itemElement = document.getElementById(`driver-${pilot.id}`);

            if (!itemElement) {
                itemElement = document.createElement('div');
                itemElement.classList.add('standings-item');
                itemElement.id = `driver-${pilot.id}`;
                standingsList.appendChild(itemElement);
            }

            if (pilot.id === userSelectedPilotId) {
                itemElement.classList.add('user-pilot');
            }

            let interval = '';
            if (index === 0) {
                interval = 'Líder';
            } else {
                const pilotTotalProgress = pilot.lapsCompleted + pilot.currentLapProgress;
                const diff = leadDriverTotalProgress - pilotTotalProgress;
                const secondsBehind = (diff * 90).toFixed(2); // Asumiendo una vuelta de 90 segundos
                interval = `+${secondsBehind}s`;
            }

            itemElement.innerHTML = `
                <span>${index + 1}</span>
                <span class="driver-name">${pilot.name}</span>
                <span class="team-name">${pilot.teamName}</span>
                <span>${pilot.lapsCompleted}</span>
                <span>${interval}</span>
            `;

            // Mueve el elemento a su nueva posición vertical
            itemElement.style.top = `${index * 50}px`; // 50px es la altura de cada fila + margen
        });
        // Calculamos y asignamos la altura total al contenedor para evitar que colapse.
        standingsList.style.height = `${raceParticipants.length * 50}px`; // 50px por cada piloto
    }

    function displayRaceResults() {
        const winner = raceParticipants[0];
        winnerNameEl.textContent = winner.name;
        winnerTeamEl.textContent = winner.teamName;
        raceEndModal.style.display = 'flex'; // Mostrar el modal
    }

    function stopRace() {
        clearInterval(raceInterval);
        raceInterval = null;
        alert('La carrera ha sido detenida. La página se recargará.');
        location.reload();
    }

    // --- EVENT LISTENERS ---
    startRaceBtn.addEventListener('click', () => {
        if (startRaceBtn.disabled) return;
        startRaceBtn.disabled = true; // Prevenir múltiples clics
        setupRace();
        setTimeout(() => { startRaceBtn.disabled = false; }, 2000); // Reactivar botón después de 2s
    });

    stopRaceBtn.addEventListener('click', stopRace);
    restartRaceBtn.addEventListener('click', () => {
        location.reload(); // Recargar la página
    });

    // --- INICIALIZACIÓN ---
    loadData();
});
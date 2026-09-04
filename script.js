const planetOverlay = document.querySelector(".planet-info-overlay");
const planetInfoTitle = document.querySelector(".planet-info-title");
const planetInfoDesc = document.querySelector(".planet-info-description");
const planetInfoBtn = document.querySelector(".planet-info-btn");


let planetData = {};

fetch("planets.json")
    .then(response => response.json())
    .then(data => {
        planetData = data;
    })
    .catch(error => {
        console.log("خطا در دریافت اطلاعات");
    })

function setupPlanet(planet, planetName, correctOrbit, orbitSpeed){

    let dragging = false;
    let placed = false;
    let orbiting = false;

    planet.addEventListener("pointerdown", function(e){
        if (placed) return;
        dragging = true;

        const rect = planet.getBoundingClientRect();
        planet.style.width = rect.width + "px";
        planet.style.height = rect.height + "px";
        planet.style.position = "fixed";
        planet.style.left = rect.left + "px";
        planet.style.top = rect.top + "px";
        planet.style.transform = "none";

        document.body.appendChild(planet);

        planet.setPointerCapture(e.pointerId);
    });

    planet.addEventListener("pointermove", function(e){
        if (!dragging || placed) return;

        const x = e.clientX - planet.offsetWidth / 2;
        const y = e.clientY - planet.offsetHeight / 2;

        planet.style.left = x + "px";
        planet.style.top = y + "px";

        const planetRect = planet.getBoundingClientRect();
        const planetCenterX = planetRect.left + planetRect.width / 2;
        const planetCenterY = planetRect.top + planetRect.height / 2;

        const orbits = document.querySelectorAll(".orbit");

        orbits.forEach(orbit => {
            const orbitRect = orbit.getBoundingClientRect();

            const orbitCenterX = orbitRect.left + orbitRect.width / 2;
            const orbitCenterY = orbitRect.top + orbitRect.height / 2;

            const radiusX = orbitRect.width / 2;
            const radiusY = orbitRect.height / 2;

            const dx = planetCenterX - orbitCenterX;
            const dy = planetCenterY - orbitCenterY;

            const distance = Math.sqrt(
                Math.pow(dx / radiusX, 2) + 
                Math.pow(dy / radiusY, 2)
            );

            const difference = Math.abs(distance - 1);

            if (difference < 0.06){
                orbit.classList.add("near")
            } else {
                orbit.classList.remove("near")
                orbit.classList.remove("wrong")
            }
        });
    });

    planet.addEventListener("pointerup", function(e) {
        if (!dragging) return;
        dragging = false;

        planet.releasePointerCapture(e.pointerId);

        const planetRect = planet.getBoundingClientRect();
        const planetCenterX = planetRect.left + planetRect.width / 2;
        const planetCenterY = planetRect.top + planetRect.height / 2;

        const orbits = document.querySelectorAll(".orbit");
        let droppedOnValidOrbit = false;

        orbits.forEach(orbit => {
            const orbitRect = orbit.getBoundingClientRect();

            const orbitCenterX = orbitRect.left + orbitRect.width / 2;
            const orbitCenterY = orbitRect.top + orbitRect.height / 2;

            const radiusX = orbitRect.width / 2;
            const radiusY = orbitRect.height / 2;

            const dx = planetCenterX - orbitCenterX;
            const dy = planetCenterY - orbitCenterY;

            const distance = Math.sqrt(
                Math.pow(dx / radiusX, 2) + 
                Math.pow(dy / radiusY, 2)
            );

            const difference = Math.abs(distance - 1);

            if (difference < 0.08 && !orbit.classList.contains("occupied")){
                droppedOnValidOrbit = true;
                orbit.classList.remove("near");
                planet.classList.add("placed");

                planet.style.width = "";
                planet.style.height = "";

                setTimeout(() => {
                    const newRect = planet.getBoundingClientRect();
                    const currentPlanetWidth = newRect.width;
                    const currentPlanetHeight = newRect.height;

                    const angle = Math.atan2( dy / radiusY, dx / radiusX);
                    const newX = orbitCenterX + Math.cos(angle) * radiusX;
                    const newY = orbitCenterY + Math.sin(angle) * radiusY;

                    planet.style.left = (newX - currentPlanetWidth / 2) + "px";
                planet.style.top = (newY - currentPlanetHeight / 2) + "px";
                }, 10)

                if (orbit === correctOrbit){
                    orbit.classList.add("correct");
                    orbit.classList.add("occupied");

                    const data = planetData[planetName]

                    planetInfoTitle.textContent = data.title;
                    planetInfoDesc.textContent = data.description;

                    planetOverlay.hidden = false;

                    orbiting = true;
                    startOrbit(planet, orbit, orbitSpeed)
                    placed = true
                } else {
                    orbit.classList.add("wrong");
                }
            }
        });
        if (!droppedOnValidOrbit){
            document.querySelectorAll(".orbit").forEach(o => o.classList.remove("near"));
        }
    });

    function startOrbit(planet, orbit, speed){
        function animate(){
            if (!orbiting) return;

            const orbitRect = orbit.getBoundingClientRect();
            const radiusX = orbitRect.width / 2;
            const radiusY = orbitRect.height / 2;
            const orbitCenterX = orbitRect.left + radiusX;
            const orbitCenterY = orbitRect.top + radiusY;

            if (!planet.dataset.angle){
                const planetRect = planet.getBoundingClientRect();
                const planetCenterX = planetRect.left + planetRect.width / 2;
                const planetCenterY = planetRect.top + planetRect.height / 2;
                planet.dataset.angle = Math.atan2(
                    (planetCenterY - orbitCenterY) / radiusY,
                    (planetCenterX - orbitCenterX) / radiusX
                );
            }

            let angle = parseFloat(planet.dataset.angle);
            angle -= speed;
            planet.dataset.angle = angle;

            const x = orbitCenterX + Math.cos(angle) * radiusX - planet.offsetWidth / 2;
            const y = orbitCenterY + Math.sin(angle) * radiusY - planet.offsetHeight / 2;

            planet.style.left = x + "px";
            planet.style.top = y + "px";

            requestAnimationFrame(animate);
        }
        animate();
    }
}

setupPlanet(
    document.querySelector(".earth"),
    "earth",
    document.querySelector(".orbit-3"),
    0.015
)
setupPlanet(
    document.querySelector(".jupiter"),
    "jupiter",
    document.querySelector(".orbit-5"),
    0.008
)
setupPlanet(
    document.querySelector(".mercury"),
    "mercury",
    document.querySelector(".orbit-1"),
    0.025
)
setupPlanet(
    document.querySelector(".uranus"),
    "uranus",
    document.querySelector(".orbit-7"),
    0.004
)
setupPlanet(
    document.querySelector(".venus"),
    "venus",
    document.querySelector(".orbit-2"),
    0.018
)
setupPlanet(
    document.querySelector(".saturn"),
    "saturn",
    document.querySelector(".orbit-6"),
    0.006
)
setupPlanet(
    document.querySelector(".mars"),
    "mars",
    document.querySelector(".orbit-4"),
    0.012
)

planetInfoBtn.addEventListener("click", ()=> {
    planetOverlay.hidden = true;
});
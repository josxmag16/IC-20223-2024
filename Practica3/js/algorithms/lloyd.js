// Definición de la clase Lloyd
class Lloyd {
    // Constructor de la clase Lloyd
    constructor(x, centers, epsilon, max_iter, gamma) {
        this.x = x; // Datos de entrada
        this.centers = centers; // Centros iniciales
        this.epsilon = epsilon; // Tolerancia
        this.max_iter = max_iter; // Número máximo de iteraciones
        this.gamma = gamma; // Factor de aprendizaje
    }
  
    // Método para calcular la distancia euclidiana entre dos puntos
    distance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return sum;
    }

    // Método para realizar el algoritmo Lloyd
    calculate(drawer) {
        for (let i = 0; i < this.max_iter; i++) {
            console.log(`-> Iteración ${i}`);
            drawer.innerHTML += `<h1>Iteración ${i}:</h1>`;
            let old_centers = [...this.centers];
            // Iterar sobre cada muestra de datos
            for (let muestra = 0; muestra < this.x.length; muestra++) {
                let dist = [];
                // Calcular la distancia de la muestra a cada centro
                for (let centro = 0; centro < this.centers.length; centro++) {
                    dist.push(this.distance(this.x[muestra], this.centers[centro]));
                }
                // Encontrar el índice del centro más cercano
                let min_idx = dist.indexOf(Math.min(...dist));
                console.log(`Antiguo centro ${min_idx} = ${this.centers[min_idx]}`);
                drawer.innerHTML += `<h5>Antiguo centro ${min_idx}:</h5>`;
                drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${muestra}-1"></table>`;
                generateTable2(document.getElementById(`tabla-${muestra}-1`), this.centers[min_idx]);
                // Actualizar el centro más cercano
                for (let j = 0; j < this.centers[min_idx].length; j++) {
                    this.centers[min_idx][j] += this.gamma * (this.x[muestra][j] - this.centers[min_idx][j]);
                }
                console.log(`Nuevo centro ${min_idx} = ${this.centers[min_idx]}`);
                console.log('='.repeat(10));
                drawer.innerHTML += `<h5>Nuevo centro ${min_idx}:</h5>`;
                drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${muestra}-2"></table>`;
                generateTable2(document.getElementById(`tabla-${muestra}-2`), this.centers[min_idx]);
            }

            // Comprobar si se ha alcanzado la convergencia
            let done = true;
            for (let center = 0; center < this.centers.length; center++) {
                let dist = this.distance(old_centers[center], this.centers[center]);
                if (dist > this.epsilon) {
                    done = false;
                    break;
                }
            }
            // Si se ha alcanzado la convergencia, devolver los centros finales
            if (done) {
                return this.centers;
            }
        }
    }

    // Método para clasificar un ejemplo basado en los centros calculados
    classify(centres, example) {
        let distances = [];
        // Calcular la distancia del ejemplo a cada centro
        for (let i = 0; i < centres.length; i++) {
            let dist = 0;
            for (let j = 0; j < example.length; j++) {
                dist += (example[j] - centres[i][j]) ** 2;
            }
            distances.push(dist);
        }
        // Devolver el índice del centro más cercano al ejemplo
        return distances.indexOf(Math.min(...distances));
    }
}

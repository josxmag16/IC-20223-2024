class Lloyd {
    constructor(x, centers, epsilon, max_iter, gamma) {
        this.x = x; 
        this.centers = centers;  
        this.epsilon = epsilon;
        this.max_iter = max_iter;
        this.gamma = gamma;
      }
    
      distance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          sum += Math.pow(a[i] - b[i], 2);
        }
        return sum;
      }

      calculate(drawer) {
        for (let i = 0; i < this.max_iter; i++) {
            console.log(`-> Iteracion ${i}`);
            drawer.innerHTML += `<h1>Iteracion ${i}:</h1>`
            let old_centers = [...this.centers];
            for (let muestra = 0; muestra < this.x.length; muestra++) {
                let dist = [];
                for (let centro = 0; centro < this.centers.length; centro++) {
                    dist.push(this.distance(this.x[muestra], this.centers[centro]));
                }
                let min_idx = dist.indexOf(Math.min(...dist));
                console.log(`Antiguo c${min_idx} = ${this.centers[min_idx]}`);
                drawer.innerHTML += `<h5>Antiguo centro ${min_idx}:</h5>`
                drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${muestra}-1"></table>`;
                generateTable2(document.getElementById(`tabla-${muestra}-1`), this.centers[min_idx]);
                for (let j = 0; j < this.centers[min_idx].length; j++) {
                    this.centers[min_idx][j] += this.gamma * (this.x[muestra][j] - this.centers[min_idx][j]);
                }
                console.log(`Nuevo   c${min_idx} = ${this.centers[min_idx]}`);
                console.log('=' . repeat(10));
                drawer.innerHTML += `<h5>Nuevo centro ${min_idx}:</h5>`
                drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-${muestra}-2"></table>`;
                generateTable2(document.getElementById(`tabla-${muestra}-2`), this.centers[min_idx]);
            }
    
            let done = true;
            for (let center = 0; center < this.centers.length; center++) {
                let dist = this.distance(old_centers[center], this.centers[center]);
                if (dist > this.epsilon) {
                    done = false;
                    break;
                }
            }
            if (done) {
                return this.centers;
            }
        }
      }

      classify(centres, example) {
        let distances = [];
        for (let i = 0; i < centres.length; i++) {
            let dist = 0;
            for (let j = 0; j < example.length; j++) {
                dist += (example[j] - centres[i][j]) ** 2;
            }
            distances.push(dist);
        }
        return distances.indexOf(Math.min(...distances));
    }
}
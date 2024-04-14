class KMeans {
    constructor(x, v, b, epsilon, clases) {
      this.x = x;  
      this.v = v; 
      this.n = math.transpose(x).length;  
      this.c = clases;  
      this.b = b;
      this.epsilon = epsilon;
    }
  
    _d(i, j) {
        let sum = 0;
        for (let k = 0; k < this.x.length; k++) {
          sum += Math.pow(this.x[k][j] - this.v[i][k], 2);
        }
        return sum;
      }
  
    _p(i, j) {
      const exp = 1 / (this.b - 1);
  
      const d = this._d(i, j);
      if (d === 0.0) {
        return 1.0;
      }
  
      let num = math.pow(1 / d, exp);
      let den = 0;
      for (let r = 0; r < this.c; r++) {
        den += math.pow(1 / this._d(r, j), exp);
      }
      return num / den;
    }
  
    calculate(drawer) {
      console.log("==========");
      let cont = 0;
      while (true) {
        let u = math.zeros([this.c, this.n]);
        let new_v = math.zeros([this.v.length, this.v[0].length]);
        for (let i = 0; i < this.c; i++) {
          let num = math.zeros([this.x.length]);
          let den = 0;
          for (let j = 0; j < this.n; j++) {
            let p = this._p(i, j);
            u[i][j] = p;
            let aux = math.pow(p, this.b);
            for(let k = 0; k < num.length; k++) {
                num[k] += aux * this.x[k][j];
            }
            den += aux;
          }
          for(let k = 0; k < new_v[0].length; k++) {
            new_v[i][k] = num[k] / den;
          }
        }
  
        let max_delta = 0.0;
        for (let i = 0; i < this.c; i++) {
            let sum = 0;
            for (let k = 0; k < this.v[i].length; k++) {
                sum += Math.pow(this.v[i][k] - new_v[i][k], 2);
            }
            let delta = Math.sqrt(sum);
            console.log("delta", delta);
            max_delta = Math.max(max_delta, delta)
        }

        drawer.innerHTML += `<h1>Centros</h1>`;
        drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-centros-${cont}"></table>`;
        generateTable(document.getElementById(`tabla-centros-${cont}`), this.v);

        drawer.innerHTML += `<h1>Nuevos centros</h1>`;
        drawer.innerHTML += `<table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-new_centros-${cont}"></table>`;
        generateTable(document.getElementById(`tabla-new_centros-${cont}`), new_v);

        drawer.innerHTML += `<h1>Matriz de pertenencia</h1>`;
        drawer.innerHTML += `<div class="table-responsive"><table class="table table-bordered table-striped table-dark table-sm mb-3" id="tabla-matrix-${cont}"></table></div>`;
        generateTable(document.getElementById(`tabla-matrix-${cont}`), u);

        drawer.innerHTML += `<h1>Delta: ${max_delta} ${(max_delta < this.epsilon ? '<' : '>')} ${this.epsilon}</h1>`;
        console.log(`centros:\n${this.v}\n`
                    + `nuevos centros:\n${new_v}\n`
                    + `matriz de pertenencia:\n${u}\n`
                    + `delta:\n${max_delta}\n`
                    + `${"-".repeat(10)}`);

        drawer.innerHTML += `<h1>________________________________________</h1>`;
        cont++;
        this.v = new_v;
        if (max_delta <= this.epsilon) {
          return this.v;
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
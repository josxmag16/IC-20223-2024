class Bayes {

    constructor(N) {
      this.N = N;
      this.classes = {};
    }
  
    training() {
      for (let class_name in this.classes) {
        this.classes[class_name].generate_m_vector();
        this.classes[class_name].generate_c_matrix();
      }
    }
  
    classify(class_vector) {
      let mini = Number.POSITIVE_INFINITY;
      let class_name = "";
      for (let c in this.classes) {
        const m_vector = this.classes[c].get_m_vector();
        let diff_vector = math.subtract(math.transpose(class_vector), this.classes[c].get_m_vector());
        const c_matrix = this.classes[c].get_c_matrix();
        let dm = math.multiply(math.multiply(diff_vector, math.inv(this.classes[c].get_c_matrix())), diff_vector);
        if (dm < mini) {
          mini = dm;
          class_name = c;
        }
      }
      return class_name;
    }
  
    get_class(class_name) {
      return this.classes[class_name];
    }
  
    get_classes() {
      return this.classes;
    }
  
    add_x(vector, class_name) {
      if (!(class_name in this.classes)) {
        this.classes[class_name] = new Class(this.N, class_name);
      }
      this.classes[class_name].x_vectors.push(vector);
    }
  
  }
  
  class Class {
  
    constructor(N, name) {
      this.N = N;
      this.class_name = name;
      this.x_vectors = [];
      this.m_vector = Array(N).fill(0);
      this.c_matrix = math.zeros([this.N, this.N]);
    }
  
    get_class_name() {
      return this.class_name;
    }
  
    generate_m_vector() {
        for (let vector of this.x_vectors) {
            this.m_vector = math.add(this.m_vector, vector);
        }
        this.m_vector = math.divide(this.m_vector, this.x_vectors.length);
    }
  
    generate_c_matrix() {
        for (let vector of this.x_vectors) {
          let diff_vector = [math.subtract(vector, this.m_vector)];
          let mul = [math.multiply(diff_vector, math.transpose(diff_vector))];
          if (mul.length !== this.N || mul[0].length !== this.N) {
            mul = math.multiply(math.transpose(diff_vector), diff_vector);
          }
          this.c_matrix = math.add(this.c_matrix, mul);
        }
        this.c_matrix = math.divide(this.c_matrix, this.x_vectors.length);
    }
  
    get_m_vector() {
      return this.m_vector;
    }
  
    get_c_matrix() {
      return this.c_matrix;
    }
  
  }
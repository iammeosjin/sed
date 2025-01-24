import DefaultModel from '../library/model.ts';
import { Student } from '../types.ts';

class Model extends DefaultModel<Student> {
  getPrefix() {
    return 'students';
  }
}

const StudentModel = new Model();

export default StudentModel;

export type ID = (string | number)[];
export type KVEntry = {
  id: ID;
};

export type Student = {
  id: ID; // schoolYear, semester, level, degree, college,  sid
  sid?: string;
  slug: string;
  email: string;
  name: string;
  schoolYear: number;
  level: number;
  degree: string;
  college: string;
  semester: number;
};

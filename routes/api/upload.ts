import { Handlers } from '$fresh/server.ts';
//@deno-types=npm:@types/bluebird
import Bluebird from 'npm:bluebird';
import { parse } from 'https://deno.land/std@0.212.0/csv/mod.ts';
import StudentModel from '../../models/student.ts';

export const handler: Handlers = {
  async POST(req) {
    const body = await req.json();
    const data = body.data;

    const users = parse(
      data,
      {
        skipFirstRow: true, // Skip the header row
      },
    ) as {
      'Name': string;
      College: string;
      Level: string;
      Degree: string;
      SchoolYear: string;
      Semester: string;
      Email: string;
    }[];

    console.log('users', users.length);

    const students = await Bluebird.map(users, async (user) => {
      if (!user.Name) return;
      const slug = user.Name.toLowerCase().replace(/\s/g, '-');
      if (user.Name === 'ABES, ANDREA MARIE H.') {
        console.log('id', user);
      }

      await StudentModel.insert({
        id: [
          user.SchoolYear,
          user.Semester,
          user.Level,
          user.Degree,
          user.College,
          slug,
        ], // schoolYear, semester, level, degree, college,  sid
        email: user.Email,
        name: user.Name,
        slug,
        schoolYear: parseInt(user.SchoolYear),
        level: parseInt(user.Level),
        degree: user.Degree,
        college: user.College,
        semester: parseInt(user.Semester),
      });
      return {
        email: user.Email,
        name: user.Name,
        slug,
        schoolYear: parseInt(user.SchoolYear),
        level: parseInt(user.Level),
        degree: user.Degree,
        college: user.College,
        semester: parseInt(user.Semester),
      };
    }, { concurrency: 100 });
    console.log(JSON.stringify(students.filter((s) => !!s)));
    console.log('done', await StudentModel.list().then((res) => res.length));

    return new Response(null, {
      status: 200,
    });
  },
};

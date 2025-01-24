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
      'School ID': string;
      'Name': string;
      College: string;
      Level: string;
      Degree: string;
      SchoolYear: string;
      Semester: string;
      Email: string;
    }[];
    await Bluebird.map(users, async (user) => {
      await StudentModel.insert({
        id: [
          user.SchoolYear,
          user.Semester,
          user.Level,
          user.Degree,
          user.College,
          user['School ID'],
        ], // schoolYear, semester, level, degree, college,  sid
        sid: user['School ID'],
        email: user.Email,
        name: user.Name,
        schoolYear: parseInt(user.SchoolYear),
        level: parseInt(user.Level),
        degree: user.Degree,
        college: user.College,
        semester: parseInt(user.Semester),
      });
    }, { concurrency: 10 });

    console.log('done');

    return new Response(null, {
      status: 200,
    });
  },
};

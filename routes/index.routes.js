import role from "./role.route.js";
import user from "./user.route.js";
import student from "./student.route.js";
import tutor from "./tutor.route.js";
import staff from "./staff.route.js";
import message from "./message.route.js";

const routes = {
  role: role,
  user: user,
  student: student,
  tutor: tutor,
  staff: staff,
  message: message,
};

export default routes;

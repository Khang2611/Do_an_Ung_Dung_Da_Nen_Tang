import React from "react";

import StudentLogin from "./student/StudentLogin";

export default function LoginModule() {
  return <StudentLogin onSelectRole={() => {}} selectedRole="student" />;
}

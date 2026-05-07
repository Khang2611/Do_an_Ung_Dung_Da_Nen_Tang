import React from "react";

import RoleLoginScreen from "../shared/RoleLoginScreen";
import type { RoleScreenProps } from "../shared/types";

export default function InstructorLogin(props: RoleScreenProps) {
  return <RoleLoginScreen {...props} roleKey="instructor" />;
}

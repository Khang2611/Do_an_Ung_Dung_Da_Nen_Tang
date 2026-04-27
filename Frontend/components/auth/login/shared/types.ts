export type LoginRoleKey = "admin" | "instructor" | "student";

export type LoginRoleIcon =
  | "reader-outline"
  | "school-outline"
  | "shield-checkmark-outline";

export type LoginRoleConfig = {
  key: LoginRoleKey;
  label: string;
  accent: string;
  fill: string;
  icon: LoginRoleIcon;
  demoEmail: string;
  demoPassword: string;
  buttonGradient: readonly [string, string];
  brandGradient: readonly [string, string];
  portalTitle: string;
  portalDescription: string;
  noteTitle: string;
  noteText: string;
};

export type RoleScreenProps = {
  selectedRole: LoginRoleKey;
  onSelectRole: (role: LoginRoleKey) => void;
};
